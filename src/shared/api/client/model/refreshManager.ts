import { api } from '../api'
import { logout } from './authSession'
import { ApiError } from './apiError'

export class AuthSessionManager {
	static async checkSession(): Promise<boolean> {
		try {
			await api.get('/api/auth/me')
			return true
		} catch (error) {
			if (error instanceof ApiError && error.status === 401) {
				logout()
				return false
			}

			throw error
		}
	}
}
