import type { AxiosRequestConfig } from 'axios'
import { httpClient } from './http'
import type { ApiClient } from './model/types'

export const api: ApiClient = {
	async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
		const { data } = await httpClient.get<T>(url, config)

		return data
	},

	async post<T>(
		url: string,
		data?: unknown,
		config?: AxiosRequestConfig
	): Promise<T> {
		const { data: response } = await httpClient.post<T>(url, data, config)

		return response
	},

	async put<T>(
		url: string,
		data?: unknown,
		config?: AxiosRequestConfig
	): Promise<T> {
		const { data: response } = await httpClient.put<T>(url, data, config)

		return response
	},

	async patch<T>(
		url: string,
		data?: unknown,
		config?: AxiosRequestConfig
	): Promise<T> {
		const { data: response } = await httpClient.patch<T>(url, data, config)

		return response
	},

	async delete<T = void>(url: string, config?: AxiosRequestConfig): Promise<T> {
		const { data } = await httpClient.delete<T>(url, config)

		return data
	},
}
