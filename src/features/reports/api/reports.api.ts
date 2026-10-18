import { api } from '../../../shared/api/client'
import type { DailyReport } from '../../../shared/types'

export const reportsApi = {
	daily: (date: string) =>
		api.get<DailyReport>('/reports/daily', { params: { date } }),
}
