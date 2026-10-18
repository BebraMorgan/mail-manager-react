const ACCESS_KEY = 'app_access_token'
const REFRESH_KEY = 'app_refresh_token'

export const setAuthToken = (token: string) => {
	localStorage.setItem(ACCESS_KEY, token)
}

export const getAuthToken = (): string | null => {
	return localStorage.getItem(ACCESS_KEY)
}

export const clearAuthToken = () => {
	localStorage.removeItem(ACCESS_KEY)
}

export const setRefreshToken = (token: string) => {
	localStorage.setItem(REFRESH_KEY, token)
}

export const getRefreshToken = (): string | null => {
	return localStorage.getItem(REFRESH_KEY)
}

export const clearRefreshToken = () => {
	localStorage.removeItem(REFRESH_KEY)
}

export const clearAllTokens = () => {
	clearAuthToken()
	clearRefreshToken()
}
