import { useCallback, useEffect } from 'react'
import { notifications } from '@mantine/notifications'
import { isApiError } from '../../../shared/api/client/model/apiError'
import { useShallow } from 'zustand/react/shallow'
import { useDashboardStore } from '../store/dashboard.store'
import { DASHBOARD_POLL_MS } from '../model/types'
import { getDashboardMetrics } from '../model/selectors'

export function useDashboard() {
	const {
		status,
		data,
		refreshing,
		syncing,
		failedSources,
		lastUpdatedAt,
		load,
		sync,
	} = useDashboardStore(
		useShallow((s) => ({
			status: s.status,
			data: s.data,
			refreshing: s.refreshing,
			syncing: s.syncing,
			failedSources: s.failedSources,
			lastUpdatedAt: s.lastUpdatedAt,
			load: s.load,
			sync: s.sync,
		}))
	)

	useEffect(() => {
		void load()
		const timer = window.setInterval(() => {
			if (!document.hidden) void load()
		}, DASHBOARD_POLL_MS)

		const refreshOnReturn = () => {
			if (!document.hidden) void load()
		}
		document.addEventListener('visibilitychange', refreshOnReturn)
		return () => {
			window.clearInterval(timer)
			document.removeEventListener('visibilitychange', refreshOnReturn)
		}
	}, [load])

	const refresh = useCallback(() => {
		void load()
	}, [load])

	const synchronize = useCallback(async () => {
		try {
			const registered = await sync()
			notifications.show({
				color: 'teal',
				title: 'Синхронизация завершена',
				message: `Новых писем зарегистрировано: ${registered}. Классификация выполняется в фоне.`,
			})
		} catch (error) {
			notifications.show({
				color: 'red',
				title: 'Не удалось синхронизировать почту',
				message:
					isApiError(error) && error.status === 409
						? 'Синхронизация уже выполняется. Дождитесь её завершения.'
						: error instanceof Error
							? error.message
							: 'Ошибка запроса к IMAP.',
			})
		}
	}, [sync])

	return {
		status,
		data,
		metrics: getDashboardMetrics(data),
		refreshing,
		syncing,
		failedSources,
		lastUpdatedAt,
		refresh,
		synchronize,
	}
}
