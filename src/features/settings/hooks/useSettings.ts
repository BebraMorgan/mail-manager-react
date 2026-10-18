import { useEffect } from 'react'
import { notifications } from '@mantine/notifications'
import { useShallow } from 'zustand/react/shallow'
import { useSettingsStore } from '../store/settings.store'
import type { MailSettingsFormValues } from '../model/mailSettingsForm'
import {
	credentialsRequired,
	toSettingsRequest,
} from '../model/mailSettingsForm'

export function useSettings() {
	const state = useSettingsStore(
		useShallow((s) => ({
			settings: s.settings,
			folders: s.folders,
			loading: s.loading,
			saving: s.saving,
			syncing: s.syncing,
			foldersLoading: s.foldersLoading,
			error: s.error,
			foldersError: s.foldersError,
			load: s.load,
			save: s.save,
			loadFolders: s.loadFolders,
			sync: s.sync,
		}))
	)
	useEffect(() => {
		void state.load()
	}, [state])

	const save = async (values: MailSettingsFormValues): Promise<boolean> => {
		if (
			credentialsRequired(values, state.settings) &&
			!(values.auth_method === 'oauth2'
				? values.oauth_token.trim()
				: values.app_password.trim())
		) {
			notifications.show({
				color: 'red',
				title: 'Нет учётных данных',
				message:
					'Укажи OAuth-токен или пароль приложения для нового подключения.',
			})
			return false
		}
		try {
			await state.save(toSettingsRequest(values))
			notifications.show({
				color: 'teal',
				title: 'Сохранено',
				message: 'Настройки IMAP обновлены в SQLite.',
			})
			return true
		} catch (e) {
			notifications.show({
				color: 'red',
				title: 'Не удалось сохранить',
				message: e instanceof Error ? e.message : 'Ошибка сохранения',
			})
			return false
		}
	}

	const sync = async () => {
		try {
			const count = await state.sync()
			notifications.show({
				color: 'teal',
				title: 'Синхронизация завершена',
				message: `Найдено новых писем: ${count}. Обработка выполняется в фоне.`,
			})
		} catch (e) {
			notifications.show({
				color: 'red',
				title: 'Ошибка синхронизации',
				message: e instanceof Error ? e.message : 'IMAP недоступен',
			})
		}
	}

	return { ...state, save, sync }
}
