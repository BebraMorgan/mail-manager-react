import { api } from '../../../shared/api/client'
import { mailApi } from '../../../shared/api/mail'
import { mailSettingsApi } from '../../../shared/api/mailSettings'
import { DASHBOARD_PAGE_SIZE } from '../model/types'
import type { ProblemsResponse } from '../model/types'

const todayUTC = () => new Date().toISOString().slice(0, 10)

export const dashboardApi = {
	queue: mailApi.queueStats,
	today: () => mailApi.dailyReport(todayUTC()),
	recent: async () => {
		const page = await mailApi.classifications({ limit: DASHBOARD_PAGE_SIZE })
		return page.items
	},
	important: async () => {
		const page = await mailApi.classifications({
			limit: DASHBOARD_PAGE_SIZE,
			importance: 'high',
		})
		return page.items
	},
	problems: async () => {
		const response = await api.get<ProblemsResponse>('/queue/problems', {
			params: { limit: DASHBOARD_PAGE_SIZE },
		})
		return response.items
	},
	settings: mailSettingsApi.get,
	sync: mailApi.sync,
}
