import { create } from 'zustand'
import {
	subscribeSessionReset,
	getSessionVersion,
} from '../../../shared/api/client/model/authSession'
import type { Classification } from '../../../shared/types'
import { mailPageApi } from '../api/mail.api'
import { DEFAULT_MAIL_FILTERS, type MailFilters } from '../model/types'

type LoadStatus = 'idle' | 'loading' | 'ready' | 'error'

interface MailStore {
	filters: MailFilters
	page: number
	pageSize: number
	items: Classification[]
	total: number
	selectedIds: number[]
	status: LoadStatus
	refreshing: boolean
	error: string | null
	selectedMailId: number | null
	setFilter: <K extends keyof MailFilters>(
		key: K,
		value: MailFilters[K]
	) => void
	clearFilters: () => void
	setPage: (page: number) => void
	setPageSize: (size: number) => void
	toggleSelected: (id: number) => void
	selectVisible: (ids: number[], checked: boolean) => void
	clearSelected: () => void
	removeSelected: (ids: number[]) => void
	openMail: (id: number | null) => void
	load: () => Promise<void>
	reset: () => void
}

const initialState = () => ({
	filters: { ...DEFAULT_MAIL_FILTERS },
	page: 1,
	pageSize: 20,
	items: [] as Classification[],
	total: 0,
	selectedIds: [] as number[],
	status: 'idle' as LoadStatus,
	refreshing: false,
	error: null as string | null,
	selectedMailId: null as number | null,
})

let requestNumber = 0
export const useMailStore = create<MailStore>((set, get) => ({
	...initialState(),
	setFilter(key, value) {
		requestNumber++
		set((state) => ({
			filters: { ...state.filters, [key]: value },
			page: 1,
			selectedIds: [],
			items: [],
			total: 0,
			status: 'loading',
			refreshing: false,
		}))
	},
	clearFilters: () => {
		requestNumber++
		set({
			filters: { ...DEFAULT_MAIL_FILTERS },
			page: 1,
			selectedIds: [],
			items: [],
			total: 0,
			status: 'loading',
			refreshing: false,
		})
	},
	setPage: (page) => {
		requestNumber++
		set({
			page: Math.max(1, page),
			items: [],
			status: 'loading',
			refreshing: false,
		})
	},
	setPageSize: (size) => {
		requestNumber++
		set({
			pageSize: size,
			page: 1,
			selectedIds: [],
			items: [],
			total: 0,
			status: 'loading',
			refreshing: false,
		})
	},
	toggleSelected(id) {
		set((state) => ({
			selectedIds: state.selectedIds.includes(id)
				? state.selectedIds.filter((other) => other !== id)
				: state.selectedIds.length < 100
					? [...state.selectedIds, id]
					: state.selectedIds,
		}))
	},
	selectVisible(ids, checked) {
		set((state) => ({
			selectedIds: checked
				? [...new Set([...state.selectedIds, ...ids])].slice(0, 100)
				: state.selectedIds.filter((id) => !ids.includes(id)),
		}))
	},
	clearSelected: () => set({ selectedIds: [] }),
	removeSelected(ids) {
		set((state) => ({
			selectedIds: state.selectedIds.filter((id) => !ids.includes(id)),
		}))
	},
	openMail: (id) => set({ selectedMailId: id }),
	async load() {
		const number = ++requestNumber
		const version = getSessionVersion()
		const state = get()
		set({
			status: state.status === 'idle' ? 'loading' : state.status,
			refreshing: state.status !== 'idle',
			error: null,
		})
		try {
			const response = await mailPageApi.list(
				state.filters,
				state.page,
				state.pageSize
			)
			if (number !== requestNumber || version !== getSessionVersion()) return
			// If results disappear after an edit/deletion, go back to the previous page.
			if (
				response.total > 0 &&
				state.page > Math.ceil(response.total / state.pageSize)
			) {
				set({
					page: Math.ceil(response.total / state.pageSize),
					refreshing: false,
				})
				return
			}
			set({
				items: response.items,
				total: response.total,
				status: 'ready',
				refreshing: false,
				error: null,
			})
		} catch (error) {
			if (number !== requestNumber || version !== getSessionVersion()) return
			set({
				status: 'error',
				refreshing: false,
				error: error instanceof Error ? error.message : 'Ошибка загрузки писем',
			})
		}
	},
	reset() {
		requestNumber++
		set(initialState())
	},
}))

subscribeSessionReset(() => useMailStore.getState().reset())
