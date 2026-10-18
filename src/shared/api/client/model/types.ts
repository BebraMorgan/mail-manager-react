import type { AxiosRequestConfig } from 'axios'
declare module 'axios' {
	interface AxiosRequestConfig {
		_sessionVersion?: number
		_retryAfterRefresh?: boolean
		skipAuthRefresh?: boolean
	}
}
export interface ApiClient {
	get<T>(url: string, config?: AxiosRequestConfig): Promise<T>
	post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>
	put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>
	patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>
	delete<T = void>(url: string, config?: AxiosRequestConfig): Promise<T>
}
