import { useEffect } from 'react'
import type { AuthProviderProps } from '../model/types'
import { useAuthEntity } from '../store/hooks/useAuthEntity'
import { useAuthStore } from '../store/auth.store'
import { AuthContext } from './AuthContext'
export const AuthProvider = ({ value, children }: AuthProviderProps) => {
	const storeValue = useAuthEntity()
	useEffect(() => {
		if (!value)
			void useAuthStore
				.getState()
				.initAuth()
				.catch(() => {
					/* unavailable backend: can retry after reload */
				})
	}, [value])
	return (
		<AuthContext.Provider value={value ?? storeValue}>
			{children}
		</AuthContext.Provider>
	)
}
