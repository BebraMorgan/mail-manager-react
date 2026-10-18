import type {
	Classification,
	DailyReport,
	MailSettings,
	QueueStats,
	ProblemMail,
} from '../../../shared/types'

export type { ProblemMail, ProblemsResponse } from '../../../shared/types'

export type DashboardSource =
	'queue' | 'today' | 'recent' | 'important' | 'problems' | 'settings'

export interface DashboardData {
	queue: QueueStats | null
	today: DailyReport | null
	recent: Classification[] | null
	important: Classification[] | null
	problems: ProblemMail[] | null
	settings: MailSettings | null
}

export interface DashboardMetrics {
	processed: number | null
	pending: number | null
	errors: number | null
	receivedToday: number | null
	processingPercent: number | null
	processedToday: number | null
	spamToday: number | null
	needsReviewToday: number | null
}

export const DASHBOARD_POLL_MS = 30_000
export const DASHBOARD_PAGE_SIZE = 5
