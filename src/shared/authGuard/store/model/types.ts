import type {
	AuthStatus,
	CurrentUser,
	LoginCredentials,
} from '../../model/types'
export interface AuthState {
	status: AuthStatus
	user: CurrentUser | null
	login: (credentials: LoginCredentials) => Promise<void>
	logout: () => Promise<void>
	initAuth: () => Promise<void>
}
