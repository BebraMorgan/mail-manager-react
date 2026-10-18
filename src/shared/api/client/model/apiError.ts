import axios, { type AxiosError } from 'axios'

export type ApiErrorKind =
	| 'network'
	| 'timeout'
	| 'validation'
	| 'unauthorized'
	| 'forbidden'
	| 'not_found'
	| 'conflict'
	| 'server'
	| 'unknown'

export type ApiFieldErrors = Record<string, string>

const MESSAGES: Record<ApiErrorKind, string> = {
	network: 'Нет соединения с сервером. Проверьте подключение к интернету.',
	timeout: 'Сервер не ответил вовремя. Попробуйте ещё раз.',
	validation: 'Проверьте правильность заполнения полей.',
	unauthorized: 'Сессия истекла. Войдите в аккаунт снова.',
	forbidden: 'Недостаточно прав для выполнения действия.',
	not_found: 'Запрашиваемые данные не найдены.',
	conflict: 'Данные конфликтуют с уже существующими.',
	server: 'Ошибка на сервере. Попробуйте позже.',
	unknown: 'Произошла непредвиденная ошибка. Попробуйте ещё раз.',
}

const FORM_LEVEL_KEYS = new Set([
	'detail',
	'non_field_errors',
	'message',
	'code',
])

const MAX_SERVER_MESSAGE_LENGTH = 300

export class ApiError extends Error {
	readonly kind: ApiErrorKind
	readonly status: number | null
	readonly fieldErrors: ApiFieldErrors
	readonly data: unknown

	constructor(params: {
		kind: ApiErrorKind
		status: number | null
		message: string
		fieldErrors?: ApiFieldErrors
		data?: unknown
		cause?: unknown
	}) {
		super(params.message, { cause: params.cause })

		this.name = 'ApiError'
		this.kind = params.kind
		this.status = params.status
		this.fieldErrors = params.fieldErrors ?? {}
		this.data = params.data
	}

	get isValidation(): boolean {
		return this.kind === 'validation' || this.kind === 'conflict'
	}
}

export const isApiError = (error: unknown): error is ApiError =>
	error instanceof ApiError

const isReadableMessage = (value: unknown): value is string =>
	typeof value === 'string' &&
	value.trim().length > 0 &&
	value.length <= MAX_SERVER_MESSAGE_LENGTH &&
	!/<[a-z!/][\s\S]*>/i.test(value)

const firstMessage = (value: unknown): string | undefined => {
	if (isReadableMessage(value)) {
		return value
	}

	if (Array.isArray(value)) {
		return value.find(isReadableMessage)
	}

	return undefined
}

const collectFieldErrors = (
	data: unknown,
	prefix = '',
	result: ApiFieldErrors = {}
): ApiFieldErrors => {
	if (!data || typeof data !== 'object' || Array.isArray(data)) {
		return result
	}

	for (const [key, value] of Object.entries(data)) {
		if (!prefix && FORM_LEVEL_KEYS.has(key)) {
			continue
		}

		const path = prefix ? `${prefix}.${key}` : key
		const message = firstMessage(value)

		if (message) {
			result[path] = message
			continue
		}

		if (Array.isArray(value)) {
			value.forEach((item, index) => {
				collectFieldErrors(item, `${path}.${index}`, result)
			})
			continue
		}

		collectFieldErrors(value, path, result)
	}

	return result
}

const getFormLevelMessage = (data: unknown): string | undefined => {
	if (isReadableMessage(data)) {
		return data
	}

	if (Array.isArray(data)) {
		return firstMessage(data)
	}

	if (!data || typeof data !== 'object') {
		return undefined
	}

	const record = data as Record<string, unknown>

	return (
		firstMessage(record.non_field_errors) ??
		firstMessage(record.detail) ??
		firstMessage(record.message) ??
		firstMessage(record.error)
	)
}

const getKindByStatus = (status: number): ApiErrorKind => {
	if (status === 400 || status === 422) return 'validation'
	if (status === 401) return 'unauthorized'
	if (status === 403) return 'forbidden'
	if (status === 404) return 'not_found'
	if (status === 409) return 'conflict'
	if (status === 408) return 'timeout'
	if (status >= 500) return 'server'

	return 'unknown'
}

const fromAxiosError = (error: AxiosError): ApiError => {
	const { response } = error

	if (!response) {
		const isTimeout =
			error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT'

		return new ApiError({
			kind: isTimeout ? 'timeout' : 'network',
			status: null,
			message: MESSAGES[isTimeout ? 'timeout' : 'network'],
			cause: error,
		})
	}

	const { status, data } = response
	const kind = getKindByStatus(status)

	if (kind === 'validation' || kind === 'conflict') {
		const fieldErrors = collectFieldErrors(data)
		const formMessage = getFormLevelMessage(data)

		return new ApiError({
			kind,
			status,
			message: formMessage ?? MESSAGES[kind],
			fieldErrors,
			data,
			cause: error,
		})
	}

	return new ApiError({
		kind,
		status,
		message: MESSAGES[kind],
		data,
		cause: error,
	})
}

export const toApiError = (error: unknown): ApiError => {
	if (isApiError(error)) {
		return error
	}

	if (axios.isAxiosError(error)) {
		return fromAxiosError(error)
	}

	const isPlainError = error instanceof Error && error.name === 'Error'

	return new ApiError({
		kind: 'unknown',
		status: null,
		message:
			isPlainError && isReadableMessage(error.message)
				? error.message
				: MESSAGES.unknown,
		cause: error,
	})
}
