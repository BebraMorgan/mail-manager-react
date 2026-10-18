import { create } from 'zustand'
import {
	getSessionVersion,
	subscribeSessionReset,
} from '../../../shared/api/client/model/authSession'
import type { ProblemMail } from '../../../shared/types'
import { problemsApi } from '../api/problems.api'
import type { DeletionAuditEntry, ProblemFilter } from '../model/types'

type LoadState = 'idle' | 'loading' | 'ready' | 'error'

interface ProblemsStore {
	items: ProblemMail[]
	audit: DeletionAuditEntry[]
	status: LoadState
	refreshing: boolean
	error: string | null
	auditError: string | null
	updatedAt: string | null
	filter: ProblemFilter
	search: string
	setFilter: (filter: ProblemFilter) => void
	setSearch: (search: string) => void
	load: () => Promise<void>
	reset: () => void
}

const initial = () => ({
	items: [] as ProblemMail[],
	audit: [] as DeletionAuditEntry[],
	status: 'idle' as LoadState,
	refreshing: false,
	error: null as string | null,
	auditError: null as string | null,
	updatedAt: null as string | null,
	filter: 'all' as ProblemFilter,
	search: '',
})

let generation = 0
let inFlight: Promise<void> | null = null

function describe(error: unknown): string {
	return error instanceof Error ? error.message : 'Не удалось загрузить данные'
}

export const useProblemsStore = create<ProblemsStore>((set, get) => ({
	...initial(),
	setFilter: (filter) => set({ filter }),
	setSearch: (search) => set({ search: search.slice(0, 120) }),
	async load() {
		if (inFlight) return inFlight
		const version = getSessionVersion()
		const request = ++generation
		const hasData = get().status === 'ready' || get().items.length > 0
		set({
			status: hasData ? 'ready' : 'loading',
			refreshing: hasData,
			error: null,
			auditError: null,
		})

		const task = (async () => {
			const [problems, audit] = await Promise.allSettled([
				problemsApi.list(),
				problemsApi.audit(),
			])
			if (request !== generation || version !== getSessionVersion()) return
			set((state) => ({
				items: problems.status === 'fulfilled' ? problems.value : state.items,
				audit: audit.status === 'fulfilled' ? audit.value : state.audit,
				status: problems.status === 'fulfilled' ? 'ready' : 'error',
				refreshing: false,
				error:
					problems.status === 'rejected' ? describe(problems.reason) : null,
				auditError: audit.status === 'rejected' ? describe(audit.reason) : null,
				updatedAt:
					problems.status === 'fulfilled'
						? new Date().toISOString()
						: state.updatedAt,
			}))
		})()
		inFlight = task
		try {
			await task
		} finally {
			if (inFlight === task) inFlight = null
		}
	},
	reset() {
		generation++
		// A new session can load immediately, even if an old request is still pending.
		inFlight = null
		set(initial())
	},
}))

subscribeSessionReset(() => useProblemsStore.getState().reset())
