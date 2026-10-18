import { create } from 'zustand'
import { authApi } from '../api/auth'
import {
	startSession,
	setLogoutHandler,
	getSessionVersion,
} from '../../api/client/model/authSession'
import { isApiError } from '../../api/client/model/apiError'
import type { AuthState } from './model/types'
let initializing: Promise<void> | null = null
export const useAuthStore = create<AuthState>((set, get) => ({
	status: 'idle',
	user: null,
	async initAuth() {
		if (initializing) return initializing
		if (get().status !== 'idle') return
		const version = getSessionVersion()
		set({ status: 'loading' })
		initializing = (async () => {
			try {
				const user = await authApi.me()
				if (version === getSessionVersion())
					set({ status: 'authenticated', user })
			} catch (error) {
				if (version === getSessionVersion())
					set({ status: 'unauthenticated', user: null })
				if (!isApiError(error) || error.kind !== 'unauthorized') throw error
			}
		})().finally(() => {
			initializing = null
		})
		return initializing
	},
	async login(credentials) {
		startSession()
		const version = getSessionVersion()
		set({ status: 'loading', user: null })
		try {
			const user = await authApi.login(credentials)
			if (version === getSessionVersion())
				set({ status: 'authenticated', user })
		} catch (error) {
			if (version === getSessionVersion())
				set({ status: 'unauthenticated', user: null })
			throw error
		}
	},
	async logout() {
		try {
			await authApi.logout()
		} finally {
			startSession()
			set({ status: 'unauthenticated', user: null })
		}
	},
}))
setLogoutHandler(() =>
	useAuthStore.setState({ status: 'unauthenticated', user: null })
)
