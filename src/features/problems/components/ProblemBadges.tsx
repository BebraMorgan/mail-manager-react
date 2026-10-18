import { Badge, Group } from '@mantine/core'
import type { ProblemMail } from '../../../shared/types'
import { isHumanReviewNeeded } from '../model/types'

export function ProblemBadges({ item }: { item: ProblemMail }) {
	return (
		<Group gap={6} wrap="wrap">
			{item.deletion_state === 'unknown' && (
				<Badge color="red" variant="light">
					Сверить IMAP
				</Badge>
			)}
			{item.deletion_state === 'moving' && (
				<Badge color="orange" variant="light">
					MOVE выполняется / прерван
				</Badge>
			)}
			{item.deletion_state === 'active' && item.status === 'retry' && (
				<Badge color="orange" variant="light">
					Ошибка: повтор
				</Badge>
			)}
			{item.deletion_state === 'active' && item.status === 'skipped' && (
				<Badge color="red" variant="light">
					Пропущено
				</Badge>
			)}
			{item.deletion_state === 'active' && isHumanReviewNeeded(item) && (
				<Badge color="yellow" variant="light">
					Нужна проверка
				</Badge>
			)}
		</Group>
	)
}
