import type {
	Classification,
	Importance,
	MailCategory,
	SpamVerdict,
} from '../../../shared/types'

export interface MailFilters {
	q: string
	category: MailCategory | ''
	importance: Importance | ''
	spam_verdict: SpamVerdict | ''
	needs_review: '' | 'true' | 'false'
	include_in_report: '' | 'true' | 'false'
}

export const DEFAULT_MAIL_FILTERS: MailFilters = {
	q: '',
	category: '',
	importance: '',
	spam_verdict: '',
	needs_review: '',
	include_in_report: '',
}

export const CATEGORY_LABELS: Record<MailCategory, string> = {
	personal: 'Личное',
	work: 'Работа',
	finance: 'Финансы',
	security: 'Безопасность',
	shopping: 'Покупки',
	delivery: 'Доставка',
	account: 'Аккаунт',
	social: 'Соцсети',
	newsletter: 'Рассылка',
	promotion: 'Реклама',
	notification: 'Уведомление',
	other: 'Другое',
	uncertain: 'Не определено',
}
export const IMPORTANCE_LABELS: Record<Importance, string> = {
	high: 'Высокая',
	medium: 'Средняя',
	low: 'Низкая',
	uncertain: 'Не определена',
}
export const SPAM_LABELS: Record<SpamVerdict, string> = {
	spam: 'Спам',
	not_spam: 'Не спам',
	uncertain: 'Сомнительно',
}

export function formatMailDate(value: string) {
	if (!value) return '—'
	const date = new Date(value)
	if (Number.isNaN(date.getTime())) return '—'
	return new Intl.DateTimeFormat('ru-RU', {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	}).format(date)
}

export const canMoveMail = (mail: Classification) =>
	mail.deletion_state === 'active'
