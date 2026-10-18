import axios, {
	type AxiosInstance,
	type InternalAxiosRequestConfig,
} from 'axios'
import { toApiError } from './model/apiError'
import { getSessionVersion, logout } from './model/authSession'
import { API_BASE_URL } from './model/constants'

const readCsrf = (): string | null => {
	if (typeof document === 'undefined') return null
	const part = document.cookie.split('; ').find((s) => s.startsWith('mm_csrf='))
	if (!part) return null
	try {
		return decodeURIComponent(part.slice('mm_csrf='.length))
	} catch {
		return null
	}
}
const unsafe = (method?: string) =>
	!['GET', 'HEAD', 'OPTIONS'].includes((method ?? 'GET').toUpperCase())
let refreshPromise: Promise<void> | null = null

export function createHttpClient(baseURL: string): AxiosInstance {
	const client = axios.create({
		baseURL,
		timeout: 20_000,
		withCredentials: true,
	})
	// Standalone client: refresh itself must never trigger the main response interceptor.
	const refreshClient = axios.create({
		baseURL,
		timeout: 20_000,
		withCredentials: true,
	})
	client.interceptors.request.use((config) => {
		const version = getSessionVersion()
		if (
			config._sessionVersion !== undefined &&
			config._sessionVersion !== version
		) {
			throw new axios.CanceledError('Session changed')
		}
		config._sessionVersion = version
		if (unsafe(config.method)) {
			const csrf = readCsrf()
			if (csrf) config.headers.set('X-CSRF-Token', csrf)
		}
		return config
	})
	client.interceptors.response.use(
		(response) => {
			if (response.config._sessionVersion !== getSessionVersion())
				throw new axios.CanceledError('Session changed')
			return response
		},
		async (error: unknown) => {
			if (axios.isCancel(error)) return Promise.reject(error)
			if (!axios.isAxiosError(error)) return Promise.reject(toApiError(error))
			const config = error.config as InternalAxiosRequestConfig | undefined
			if (
				config?._sessionVersion !== undefined &&
				config._sessionVersion !== getSessionVersion()
			) {
				return Promise.reject(new axios.CanceledError('Session changed'))
			}
			const url = config?.url ?? ''
			const authEndpoint =
				/^\/?auth\/(login|logout|refresh|password)(?:\/|$)/.test(url)
			if (
				error.response?.status === 401 &&
				config &&
				!config._retryAfterRefresh &&
				!config.skipAuthRefresh &&
				!authEndpoint
			) {
				const session = getSessionVersion()
				if (!refreshPromise) {
					refreshPromise = (async () => {
						const csrf = readCsrf()
						await refreshClient.post(
							'/auth/refresh',
							{},
							{
								headers: csrf ? { 'X-CSRF-Token': csrf } : {},
							}
						)
					})().finally(() => {
						refreshPromise = null
					})
				}
				try {
					await refreshPromise
					if (session !== getSessionVersion())
						throw new axios.CanceledError('Session changed')
					config._retryAfterRefresh = true
					// CSRF could have rotated with the refresh cookies.
					return await client.request(config)
				} catch (refreshError) {
					if (axios.isCancel(refreshError)) return Promise.reject(refreshError)
					if (session === getSessionVersion()) {
						// Only rejected refresh invalidates the session; transient network failures do not.
						if (
							axios.isAxiosError(refreshError) &&
							[401, 403].includes(refreshError.response?.status ?? 0)
						)
							logout()
					}
					return Promise.reject(toApiError(refreshError))
				}
			}
			if (
				error.response?.status === 401 &&
				config?._retryAfterRefresh &&
				getSessionVersion() === config._sessionVersion
			)
				logout()
			return Promise.reject(toApiError(error))
		}
	)
	return client
}
export const httpClient = createHttpClient(API_BASE_URL)
