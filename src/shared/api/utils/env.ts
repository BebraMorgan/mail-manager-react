type ServerUrlEnvKey =
	| 'VITE_API_BASE_URL'
	| 'VITE_APP_BASE_URL'
	| 'VITE_CHAT_BASE_URL'
	| 'VITE_CHAT_WS_URL'

export const readEnvUrl = (key: ServerUrlEnvKey): string => {
	const value = import.meta.env[key]?.trim()

	if (!value) {
		throw new Error(
			`Переменная окружения ${key} не задана. Скопируйте .env.example в .env и укажите адрес сервера.`
		)
	}

	return value.replace(/\/+$/, '')
}
