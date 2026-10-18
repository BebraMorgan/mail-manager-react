import type { DashboardData, DashboardMetrics } from './types'

export function getDashboardMetrics(data: DashboardData): DashboardMetrics {
	const queue = data.queue
	const today = data.today

	return {
		processed: queue?.completed ?? null,
		pending: queue ? queue.pending + queue.processing : null,
		errors: queue ? queue.retry + queue.skipped : null,
		receivedToday: today?.total_received ?? null,
		processingPercent: queue
			? queue.total > 0
				? Math.round((queue.completed / queue.total) * 100)
				: 0
			: null,
		processedToday: today?.classified ?? null,
		spamToday: today?.spam ?? null,
		needsReviewToday: today?.needs_review ?? null,
	}
}

export const dashboardSourceLabels: Record<
	import('./types').DashboardSource,
	string
> = {
	queue: 'очередь',
	today: 'сводка за день',
	recent: 'последние письма',
	important: 'важные письма',
	problems: 'проблемные письма',
	settings: 'настройки почты',
}

export const categoryLabels: Record<string, string> = {
	security: 'Безопасность',
	finance: 'Финансы',
	delivery: 'Доставка',
	shopping: 'Покупки',
	account: 'Аккаунт',
	work: 'Работа',
	personal: 'Личное',
	social: 'Соцсети',
	newsletter: 'Рассылка',
	promotion: 'Реклама',
	notification: 'Уведомление',
	other: 'Другое',
	uncertain: 'Не определено',
}

export const importanceLabels: Record<string, string> = {
	high: 'Высокая',
	medium: 'Средняя',
	low: 'Низкая',
	uncertain: 'Не определена',
}

export function formatReceivedAt(value: string): string {
	if (!value) return 'Дата неизвестна'
	const date = new Date(value)
	if (Number.isNaN(date.getTime())) return 'Дата неизвестна'
	return new Intl.DateTimeFormat('ru-RU', {
		day: 'numeric',
		month: 'short',
		hour: '2-digit',
		minute: '2-digit',
	}).format(date)
}

export function formatLastUpdated(value: string | null): string {
	if (!value) return 'Ещё не обновлялось'
	const date = new Date(value)
	if (Number.isNaN(date.getTime())) return 'Ещё не обновлялось'
	return `Обновлено в ${new Intl.DateTimeFormat('ru-RU', {
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
	}).format(date)}`
}
