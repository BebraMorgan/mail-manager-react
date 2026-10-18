import type { ProblemMail } from '../../../shared/types'

export type ProblemFilter = 'all' | 'retry' | 'skipped' | 'review' | 'reconcile'

export interface DeletionAuditEntry {
	id: number
	email_id: number
	actor_id: number
	status: string
	error_code: string
	created_at: string
}

export type ReconciliationResolution = 'in_inbox' | 'moved_to_trash'

export function isReconciliationNeeded(item: ProblemMail): boolean {
	return item.deletion_state === 'unknown' || item.deletion_state === 'moving'
}

export function isHumanReviewNeeded(item: ProblemMail): boolean {
	return item.needs_review || item.importance === 'uncertain'
}

export function matchesProblemFilter(
	item: ProblemMail,
	filter: ProblemFilter
): boolean {
	switch (filter) {
		case 'retry':
			return item.deletion_state === 'active' && item.status === 'retry'
		case 'skipped':
			return item.deletion_state === 'active' && item.status === 'skipped'
		case 'review':
			return item.deletion_state === 'active' && isHumanReviewNeeded(item)
		case 'reconcile':
			return isReconciliationNeeded(item)
		case 'all':
			return true
	}
}

export function filterProblems(
	items: ProblemMail[],
	filter: ProblemFilter,
	search: string
): ProblemMail[] {
	const term = search.trim().toLocaleLowerCase('ru-RU')
	return items.filter((item) => {
		if (!matchesProblemFilter(item, filter)) return false
		if (!term) return true
		return [
			item.subject,
			item.sender,
			String(item.email_id),
			item.last_error,
		].some((part) => part.toLocaleLowerCase('ru-RU').includes(term))
	})
}

export function formatProblemDate(raw: string): string {
	if (!raw) return '—'
	const date = new Date(raw)
	if (Number.isNaN(date.getTime())) return '—'
	return new Intl.DateTimeFormat('ru-RU', {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	}).format(date)
}
