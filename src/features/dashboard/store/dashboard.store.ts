import { create } from 'zustand'
import {
	getSessionVersion,
	subscribeSessionReset,
} from '../../../shared/api/client/model/authSession'
import { dashboardApi } from '../api/dashboard.api'
import type { DashboardData, DashboardSource } from '../model/types'

type DashboardStatus = 'idle' | 'loading' | 'ready'

interface DashboardState {
	status: DashboardStatus
	data: DashboardData
	refreshing: boolean
	syncing: boolean
	failedSources: DashboardSource[]
	lastUpdatedAt: string | null
	load: () => Promise<void>
	sync: () => Promise<number>
	reset: () => void
}

const emptyData = (): DashboardData => ({
	queue: null,
	today: null,
	recent: null,
	important: null,
	problems: null,
	settings: null,
})

let loadInFlight: Promise<void> | null = null
let syncInFlight: Promise<number> | null = null
let requestGeneration = 0

export const useDashboardStore = create<DashboardState>((set, get) => ({
	status: 'idle',
	data: emptyData(),
	refreshing: false,
	syncing: false,
	failedSources: [],
	lastUpdatedAt: null,

	reset() {
		requestGeneration += 1
		loadInFlight = null
		syncInFlight = null
		set({
			status: 'idle',
			data: emptyData(),
			refreshing: false,
			syncing: false,
			failedSources: [],
			lastUpdatedAt: null,
		})
	},

	async load() {
		if (loadInFlight) return loadInFlight

		const generation = ++requestGeneration
		const session = getSessionVersion()
		const initial = get().status === 'idle'
		set({ status: initial ? 'loading' : 'ready', refreshing: !initial })

		const task = (async () => {
			const [queue, today, recent, important, problems, settings] =
				await Promise.allSettled([
					dashboardApi.queue(),
					dashboardApi.today(),
					dashboardApi.recent(),
					dashboardApi.important(),
					dashboardApi.problems(),
					dashboardApi.settings(),
				] as const)

			if (generation !== requestGeneration || session !== getSessionVersion()) {
				return
			}

			const failed: DashboardSource[] = []
			set((state) => {
				const data = { ...state.data }
				if (queue.status === 'fulfilled') data.queue = queue.value
				else failed.push('queue')
				if (today.status === 'fulfilled') data.today = today.value
				else failed.push('today')
				if (recent.status === 'fulfilled') data.recent = recent.value
				else failed.push('recent')
				if (important.status === 'fulfilled') data.important = important.value
				else failed.push('important')
				if (problems.status === 'fulfilled') data.problems = problems.value
				else failed.push('problems')
				if (settings.status === 'fulfilled') data.settings = settings.value
				else failed.push('settings')

				return {
					status: 'ready',
					data,
					refreshing: false,
					failedSources: failed,
					lastUpdatedAt:
						failed.length < 6 ? new Date().toISOString() : state.lastUpdatedAt,
				}
			})
		})()

		loadInFlight = task
		try {
			await task
		} finally {
			if (loadInFlight === task) loadInFlight = null
		}
	},

	async sync() {
		if (syncInFlight) return syncInFlight
		const session = getSessionVersion()
		set({ syncing: true })

		const task = (async () => {
			const response = await dashboardApi.sync()
			if (session === getSessionVersion()) await get().load()
			return response.registered
		})()
		syncInFlight = task
		try {
			return await task
		} finally {
			if (syncInFlight === task) syncInFlight = null
			if (session === getSessionVersion()) set({ syncing: false })
		}
	},
}))

subscribeSessionReset(() => useDashboardStore.getState().reset())
