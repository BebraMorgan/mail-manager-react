import { api } from './client/api'
import type { MailSettings, SetMailSettings } from '../types'
export const mailSettingsApi = {
	get: () => api.get<MailSettings>('/mail/settings'),
	save: (input: SetMailSettings) =>
		api.post<{ status: 'ok' }>('/mail/settings', input),
}
