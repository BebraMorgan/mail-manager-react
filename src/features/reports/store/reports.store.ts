import { create } from 'zustand'
import {
	getSessionVersion,
	subscribeSessionReset,
} from '../../../shared/api/client/model/authSession'
import type { DailyReport } from '../../../shared/types'
import { reportsApi } from '../api/reports.api'
import { utcToday } from '../model/reportUtils'

interface ReportsState {
	date: string
	report: DailyReport | null
	loading: boolean
	error: string | null
	setDate: (date: string) => void
	load: () => Promise<void>
	reset: () => void
}

let requestId = 0

export const useReportsStore = create<ReportsState>((set, get) => ({
	date: utcToday(),
	report: null,
	loading: false,
	error: null,
	setDate(date) {
		if (date === get().date) return
		requestId++
		set({ date, report: null, error: null, loading: false })
	},
	reset() {
		requestId++
		set({ date: utcToday(), report: null, loading: false, error: null })
	},
	async load() {
		const id = ++requestId
		const session = getSessionVersion()
		const date = get().date
		set({ loading: true, error: null })
		try {
			const report = await reportsApi.daily(date)
			if (id === requestId && session === getSessionVersion()) {
				set({ report, loading: false })
			}
		} catch (error) {
			if (id === requestId && session === getSessionVersion()) {
				set({
					loading: false,
					error:
						error instanceof Error
							? error.message
							: 'Не удалось получить отчёт',
				})
			}
		}
	},
}))

subscribeSessionReset(() => useReportsStore.getState().reset())
