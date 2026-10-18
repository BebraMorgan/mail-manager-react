import { api } from '../../api/client'
import type {
	ChangePasswordInput,
	CurrentUser,
	LoginCredentials,
} from '../model/types'
export const authApi = {
	async login(credentials: LoginCredentials): Promise<CurrentUser> {
		await api.post<{ status: 'ok' }>('/auth/login', credentials, {
			skipAuthRefresh: true,
		})
		return api.get<CurrentUser>('/auth/me')
	},
	me: () => api.get<CurrentUser>('/auth/me'),
	logout: () =>
		api.post<{ status: 'ok' }>('/auth/logout', {}, { skipAuthRefresh: true }),
	changePassword: (input: ChangePasswordInput) =>
		api.post<{ status: 'ok' }>('/auth/password', input),
}
