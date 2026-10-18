import { api } from '../../../shared/api/client'
import type {
	Classification,
	ProblemMail,
	ProblemsResponse,
} from '../../../shared/types'
import type {
	DeletionAuditEntry,
	ReconciliationResolution,
} from '../model/types'

interface AuditResponse {
	items: DeletionAuditEntry[]
}

export const problemsApi = {
	async list(): Promise<ProblemMail[]> {
		const response = await api.get<ProblemsResponse>('/queue/problems', {
			params: { limit: 200 },
		})
		return response.items
	},
	async audit(): Promise<DeletionAuditEntry[]> {
		const response = await api.get<AuditResponse>('/mail/delete-audit')
		return response.items
	},
	classification(id: number): Promise<Classification> {
		return api.get<Classification>(`/classifications/${id}`)
	},
	async retry(id: number): Promise<void> {
		await api.post(`/classifications/${id}/retry`)
	},
	async reconcile(
		id: number,
		resolution: ReconciliationResolution,
		password: string
	): Promise<void> {
		await api.post(`/mail/delete/${id}/reconcile`, { resolution, password })
	},
}
