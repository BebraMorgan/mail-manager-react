import { Badge, Group } from '@mantine/core'
import type { Classification } from '../../../shared/types'
import { CATEGORY_LABELS, IMPORTANCE_LABELS, SPAM_LABELS } from '../model/types'

export function MailBadges({
	item,
	compact = false,
}: {
	item: Classification
	compact?: boolean
}) {
	return (
		<Group gap={5} wrap="wrap">
			<Badge variant="light" color="indigo" size="sm">
				{CATEGORY_LABELS[item.category] ?? item.category}
			</Badge>
			<Badge
				variant="light"
				color={
					item.importance === 'high'
						? 'red'
						: item.importance === 'uncertain'
							? 'orange'
							: item.importance === 'medium'
								? 'yellow'
								: 'gray'
				}
				size="sm"
			>
				{IMPORTANCE_LABELS[item.importance] ?? item.importance}
			</Badge>
			{item.spam_verdict !== 'not_spam' && (
				<Badge
					color={item.spam_verdict === 'spam' ? 'red' : 'orange'}
					variant="outline"
					size="sm"
				>
					{SPAM_LABELS[item.spam_verdict]}
				</Badge>
			)}
			{item.needs_review && (
				<Badge variant="outline" color="orange" size="sm">
					Проверить
				</Badge>
			)}
			{!compact && item.action_required && (
				<Badge variant="dot" color="blue" size="sm">
					Нужно действие
				</Badge>
			)}
			{!compact && item.manual_override && (
				<Badge variant="outline" color="teal" size="sm">
					Исправлено вручную
				</Badge>
			)}
			{item.deletion_state !== 'active' && (
				<Badge variant="outline" color="red" size="sm">
					{item.deletion_state}
				</Badge>
			)}
		</Group>
	)
}
