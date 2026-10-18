import { useCallback, useState } from 'react'
import { notifications } from '@mantine/notifications'
import { problemsApi } from '../api/problems.api'
import { useProblemsStore } from '../store/problems.store'
import type { ReconciliationResolution } from '../model/types'

function message(error: unknown) {
	return error instanceof Error
		? error.message
		: 'Не удалось выполнить действие'
}

export function useProblemActions() {
	const [retryingId, setRetryingId] = useState<number | null>(null)
	const [reconcilingId, setReconcilingId] = useState<number | null>(null)

	const retry = useCallback(
		async (id: number) => {
			if (retryingId !== null) return
			setRetryingId(id)
			try {
				await problemsApi.retry(id)
				notifications.show({
					title: 'Задание добавлено в очередь',
					message: `Письмо #${id} обработает фоновый worker`,
					color: 'teal',
				})
				await useProblemsStore.getState().load()
			} catch (error) {
				notifications.show({
					title: 'Повтор не выполнен',
					message: message(error),
					color: 'red',
				})
			} finally {
				setRetryingId(null)
			}
		},
		[retryingId]
	)

	const reconcile = useCallback(
		async (
			id: number,
			resolution: ReconciliationResolution,
			password: string
		): Promise<boolean> => {
			if (reconcilingId !== null) return false
			setReconcilingId(id)
			try {
				await problemsApi.reconcile(id, resolution, password)
				notifications.show({
					title: 'Результат сверки сохранён',
					message: `Состояние письма #${id} обновлено в SQLite`,
					color: 'teal',
				})
				await useProblemsStore.getState().load()
				return true
			} catch (error) {
				notifications.show({
					title: 'Сверка не сохранена',
					message: message(error),
					color: 'red',
				})
				return false
			} finally {
				setReconcilingId(null)
			}
		},
		[reconcilingId]
	)

	return { retryingId, reconcilingId, retry, reconcile }
}
