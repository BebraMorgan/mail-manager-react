import { mailApi, type ClassificationFilters } from '../../../shared/api/mail'
import { api } from '../../../shared/api/client/api'
import type {
	Classification,
	MailCategory,
	Importance,
	SpamVerdict,
	ActionType,
	Page,
} from '../../../shared/types'
import type { MailFilters } from '../model/types'

export interface ClassificationTaxonomy {
	version: number
	categories: MailCategory[]
	importances: Importance[]
	spam_verdicts: SpamVerdict[]
	action_types: ActionType[]
	labels_ru: {
		categories: Record<MailCategory, string>
		importance: Record<Importance, string>
		spam_verdict: Record<SpamVerdict, string>
		action_types: Record<ActionType, string>
	}
}

export function makeClassificationParams(
	filters: MailFilters,
	page: number,
	pageSize: number
): ClassificationFilters {
	return {
		limit: pageSize,
		offset: (page - 1) * pageSize,
		...(filters.q.trim() ? { q: filters.q.trim() } : {}),
		...(filters.category ? { category: filters.category } : {}),
		...(filters.importance ? { importance: filters.importance } : {}),
		...(filters.spam_verdict ? { spam_verdict: filters.spam_verdict } : {}),
		...(filters.needs_review
			? { needs_review: filters.needs_review === 'true' }
			: {}),
		...(filters.include_in_report
			? { include_in_report: filters.include_in_report === 'true' }
			: {}),
	}
}

export const mailPageApi = {
	list: (
		filters: MailFilters,
		page: number,
		pageSize: number
	): Promise<Page<Classification>> =>
		mailApi.classifications(makeClassificationParams(filters, page, pageSize)),
	taxonomy: () => api.get<ClassificationTaxonomy>('/classification/schema'),
	details: mailApi.classification,
	content: mailApi.content,
	review: mailApi.updateClassification,
	retry: mailApi.classifyAgain,
	previewMove: mailApi.deletePreview,
	moveToTrash: mailApi.moveToTrash,
}
