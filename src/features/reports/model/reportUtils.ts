import type {
	Classification,
	DailyReport,
	MailCategory,
} from '../../../shared/types'
import { CATEGORY_LABELS } from '../../mail/model/types'

/** Dates and the backend daily report are expressed in UTC, not browser local time. */
export const utcToday = () => new Date().toISOString().slice(0, 10)

export function previousUtcDate(date: string, days: number): string {
	const parsed = new Date(`${date}T12:00:00Z`)
	parsed.setUTCDate(parsed.getUTCDate() - days)
	return parsed.toISOString().slice(0, 10)
}

export interface CategoryCount {
	category: MailCategory
	label: string
	count: number
}

export function categoryCounts(items: Classification[]): CategoryCount[] {
	const counts = new Map<MailCategory, number>()
	items.forEach((item) =>
		counts.set(item.category, (counts.get(item.category) ?? 0) + 1)
	)
	return Array.from(counts, ([category, count]) => ({
		category,
		label: CATEGORY_LABELS[category] ?? category,
		count,
	})).sort((a, b) => b.count - a.count)
}

export function reportMetrics(report: DailyReport | null) {
	const entries = report?.items ?? []
	return {
		total: report?.total_received ?? 0,
		classified: report?.classified ?? 0,
		unprocessed: report?.unprocessed ?? 0,
		spam: report?.spam ?? 0,
		needsReview: report?.needs_review ?? 0,
		inReport: entries.length,
		high: entries.filter((item) => item.importance === 'high').length,
		actions: entries.filter((item) => item.action_required).length,
	}
}

/**
 * Detects spreadsheet formulas, including those
 * preceded by whitespace or control characters.
 */
const isCsvFormula = (value: string): boolean => {
	let index = 0

	while (index < value.length) {
		const char = value[index]
		const code = value.charCodeAt(index)

		// Skip whitespace and ASCII control characters.
		if (code <= 31 || char.trim() === '') {
			index++
			continue
		}

		return char === '=' || char === '+' || char === '-' || char === '@'
	}

	return false
}

const csvCell = (value: string | number | boolean): string => {
	const raw = String(value)

	// Prevent formula execution in spreadsheet applications.
	const safe = isCsvFormula(raw) ? `'${raw}` : raw

	// Escape double quotes according to CSV rules.
	return `"${safe.replaceAll('"', '""')}"`
}

export function reportCsv(report: DailyReport): string {
	const header = [
		'ID',
		'Дата UTC',
		'Отправитель',
		'Тема',
		'Категория',
		'Важность',
		'Спам',
		'Требует действия',
		'Тип действия',
		'Описание',
		'Причина',
		'На проверку',
	]
	const rows = report.items.map((item) => [
		item.email_id,
		item.received_at,
		item.sender,
		item.subject,
		item.category,
		item.importance,
		item.spam_verdict,
		item.action_required,
		item.action_type,
		item.summary,
		item.reason,
		item.needs_review,
	])
	return (
		'\uFEFF' +
		[header, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n')
	)
}

export function downloadReport(report: DailyReport, format: 'csv' | 'json') {
	const payload =
		format === 'csv' ? reportCsv(report) : JSON.stringify(report, null, 2)
	const blob = new Blob([payload], {
		type:
			format === 'csv'
				? 'text/csv;charset=utf-8'
				: 'application/json;charset=utf-8',
	})
	const url = URL.createObjectURL(blob)
	const anchor = document.createElement('a')
	anchor.href = url
	anchor.download = `mail-report-${report.date}.${format}`
	document.body.append(anchor)
	anchor.click()
	anchor.remove()
	window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
