import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { notifications } from '@mantine/notifications'
import { settingsApi } from '../api/settings.api'
import { logout as clearLocalSession } from '../../../shared/api/client/model/authSession'

export function useChangePassword() {
	const [busy, setBusy] = useState(false)
	const navigate = useNavigate()
	const change = async (
		current_password: string,
		new_password: string
	): Promise<boolean> => {
		setBusy(true)
		try {
			// The Go backend invalidates all refresh sessions and clears cookies on success.
			await settingsApi.changePassword({ current_password, new_password })
			clearLocalSession()
			notifications.show({
				color: 'teal',
				title: 'Пароль изменён',
				message: 'Все сессии завершены. Войди снова.',
			})
			navigate('/login', { replace: true })
			return true
		} catch (e) {
			notifications.show({
				color: 'red',
				title: 'Не удалось сменить пароль',
				message: e instanceof Error ? e.message : 'Ошибка',
			})
			return false
		} finally {
			setBusy(false)
		}
	}
	return { busy, change }
}
