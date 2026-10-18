import { useEffect, useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useProblemsStore } from '../store/problems.store'
import {
	filterProblems,
	isHumanReviewNeeded,
	isReconciliationNeeded,
} from '../model/types'

const POLL_MS = 45_000

export function useProblems() {
	const state = useProblemsStore(
		useShallow((s) => ({
			items: s.items,
			audit: s.audit,
			status: s.status,
			refreshing: s.refreshing,
			error: s.error,
			auditError: s.auditError,
			updatedAt: s.updatedAt,
			filter: s.filter,
			search: s.search,
			setFilter: s.setFilter,
			setSearch: s.setSearch,
			load: s.load,
		}))
	)

	useEffect(() => {
		void state.load()
		const onVisibility = () => {
			if (!document.hidden) void state.load()
		}
		const timer = window.setInterval(onVisibility, POLL_MS)
		document.addEventListener('visibilitychange', onVisibility)
		return () => {
			window.clearInterval(timer)
			document.removeEventListener('visibilitychange', onVisibility)
		}
	}, [state])

	const filtered = useMemo(
		() => filterProblems(state.items, state.filter, state.search),
		[state.items, state.filter, state.search]
	)
	const metrics = useMemo(
		() => ({
			total: state.items.length,
			retry: state.items.filter(
				(x) => x.deletion_state === 'active' && x.status === 'retry'
			).length,
			skipped: state.items.filter(
				(x) => x.deletion_state === 'active' && x.status === 'skipped'
			).length,
			review: state.items.filter(
				(x) => x.deletion_state === 'active' && isHumanReviewNeeded(x)
			).length,
			reconcile: state.items.filter(isReconciliationNeeded).length,
		}),
		[state.items]
	)

	return { ...state, filtered, metrics }
}
