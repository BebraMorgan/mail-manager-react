import { useEffect, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useMailStore } from '../store/mail.store'

const POLL_INTERVAL_MS = 45_000
export function useMailPage() {
	const state = useMailStore(
		useShallow((s) => ({
			filters: s.filters,
			page: s.page,
			pageSize: s.pageSize,
			items: s.items,
			total: s.total,
			selectedIds: s.selectedIds,
			status: s.status,
			refreshing: s.refreshing,
			error: s.error,
			selectedMailId: s.selectedMailId,
			setFilter: s.setFilter,
			clearFilters: s.clearFilters,
			setPage: s.setPage,
			setPageSize: s.setPageSize,
			toggleSelected: s.toggleSelected,
			selectVisible: s.selectVisible,
			clearSelected: s.clearSelected,
			openMail: s.openMail,
			load: s.load,
		}))
	)

	const [search, setSearch] = useState(state.filters.q)
	useEffect(() => {
		const timer = window.setTimeout(() => {
			const value = search.trim().slice(0, 120)
			if (value !== useMailStore.getState().filters.q)
				useMailStore.getState().setFilter('q', value)
		}, 350)
		return () => window.clearTimeout(timer)
	}, [search])

	const { filters, page, pageSize, load } = state
	useEffect(() => {
		void load()
	}, [filters, page, pageSize, load])
	useEffect(() => {
		const refresh = () => {
			if (!document.hidden) void load()
		}
		const timer = window.setInterval(refresh, POLL_INTERVAL_MS)
		document.addEventListener('visibilitychange', refresh)
		return () => {
			window.clearInterval(timer)
			document.removeEventListener('visibilitychange', refresh)
		}
	}, [load])

	const visibleSelectedIds = state.items
		.filter(
			(item) =>
				item.deletion_state === 'active' &&
				state.selectedIds.includes(item.email_id)
		)
		.map((item) => item.email_id)
	const selectableIds = state.items
		.filter((item) => item.deletion_state === 'active')
		.map((item) => item.email_id)

	return {
		...state,
		search,
		setSearch,
		pageCount: Math.max(1, Math.ceil(state.total / state.pageSize)),
		visibleSelectedIds,
		selectableIds,
	}
}
