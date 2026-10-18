import type { PropsWithChildren } from 'react'
export interface CurrentUser {
	id: number
	username: string
	active: boolean
	created_at: string
}
export interface LoginCredentials {
	username: string
	password: string
}
export interface ChangePasswordInput {
	current_password: string
	new_password: string
}
export type AuthStatus =
	'idle' | 'loading' | 'authenticated' | 'unauthenticated'
export interface AuthContextValue {
	isInitialized: boolean
	isAuthenticated: boolean
	isLoading: boolean
	isUnauthenticated: boolean
	user: CurrentUser | null
	login: (credentials: LoginCredentials) => Promise<void>
	logout: () => Promise<void>
	initAuth: () => Promise<void>
}
export interface AuthProviderProps extends PropsWithChildren {
	value?: AuthContextValue
}
