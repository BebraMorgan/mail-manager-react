import { api } from '../../../shared/api/client'
import { mailSettingsApi } from '../../../shared/api/mailSettings'
import { authApi } from '../../../shared/authGuard/api/auth'
import type { ChangePasswordInput } from '../../../shared/authGuard/model/types'

export interface ImapFolder {
	name: string
	attributes: string[]
}
export interface ImapFoldersResponse {
	items: ImapFolder[]
}

export const settingsApi = {
	load: mailSettingsApi.get,
	save: mailSettingsApi.save,
	folders: () =>
		api.get<ImapFoldersResponse>('/mail/folders', { timeout: 45_000 }),
	sync: () =>
		api.post<{ status: string; registered: number }>(
			'/mail/sync',
			{},
			{ timeout: 245_000 }
		),
	changePassword: (input: ChangePasswordInput) => authApi.changePassword(input),
}
