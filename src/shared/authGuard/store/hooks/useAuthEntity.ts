import { useShallow } from 'zustand/react/shallow'
import { useAuthStore } from '../auth.store'
export const useAuthEntity = () => {
	const { status, user, login, logout, initAuth } = useAuthStore(
		useShallow((s) => ({
			status: s.status,
			user: s.user,
			login: s.login,
			logout: s.logout,
			initAuth: s.initAuth,
		}))
	)
	return {
		user,
		login,
		logout,
		initAuth,
		isInitialized: status !== 'idle' && status !== 'loading',
		isAuthenticated: status === 'authenticated',
		isLoading: status === 'idle' || status === 'loading',
		isUnauthenticated: status === 'unauthenticated',
	}
}
