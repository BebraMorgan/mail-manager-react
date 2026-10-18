import { api } from './client/api'
import type {
	Classification,
	DailyReport,
	ManualClassification,
	MoveResponse,
	Page,
	QueueStats,
} from '../types'

export interface ClassificationFilters {
	limit?: number
	offset?: number
	category?: string
	importance?: string
	spam_verdict?: string
	include_in_report?: boolean
	needs_review?: boolean
	q?: string
}
export interface MailContent {
	id: number
	sender: string
	subject: string
	body: string
}
export interface DeletePreviewItem {
	id: number
	sender?: string
	subject?: string
	status:
		'active' | 'moving' | 'deleted' | 'unknown' | 'not_found' | 'invalid_id'
}
export interface DeletePreview {
	items: DeletePreviewItem[]
	enabled: boolean
	action: 'move_to_trash'
	destination_configured: boolean
}
export const mailApi = {
	async classifications(
		params: ClassificationFilters = {}
	): Promise<Page<Classification>> {
		return await api.get<Page<Classification>>('/classifications', { params })
	},
	async classification(id: number): Promise<Classification> {
		return await api.get<Classification>(`/classifications/${id}`)
	},
	async classifyAgain(id: number): Promise<void> {
		await api.post(`/classifications/${id}/retry`)
	},
	async updateClassification(
		id: number,
		body: ManualClassification
	): Promise<void> {
		await api.patch(`/classifications/${id}`, body)
	},
	async content(id: number): Promise<MailContent> {
		return await api.get<MailContent>(`/mail/${id}/content`, {
			timeout: 70_000,
		})
	},
	async queueStats(): Promise<QueueStats> {
		return await api.get<QueueStats>('/queue/stats')
	},
	async dailyReport(date: string): Promise<DailyReport> {
		return await api.get<DailyReport>('/reports/daily', { params: { date } })
	},
	async sync(): Promise<{ registered: number; status: string }> {
		// The Go endpoint can scan for up to four minutes; use a specific timeout.
		return api.post<{ registered: number; status: string }>(
			'/mail/sync',
			undefined,
			{ timeout: 245_000 }
		)
	},
	async deletePreview(ids: number[]): Promise<DeletePreview> {
		return await api.post<DeletePreview>('/mail/delete/preview', { ids })
	},
	async moveToTrash(ids: number[], password: string): Promise<MoveResponse> {
		// 207 Multi-Status is a valid response; examine every item.status.
		// Backend processes up to 100 IDs sequentially (each IMAP MOVE can be slow).
		// Avoid a 20s Axios timeout which could report failure after a successful MOVE.
		// Ambiguous transport errors must NEVER trigger automatic retries.
		return await api.post<MoveResponse>(
			'/mail/delete',
			{ ids, confirm: 'MOVE_TO_TRASH', password },
			{ timeout: 0 }
		)
	},
}
