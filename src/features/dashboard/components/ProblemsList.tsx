import {
	Anchor,
	Badge,
	Card,
	Divider,
	Group,
	Stack,
	Text,
	Title,
} from '@mantine/core'
import { Link } from 'react-router-dom'
import type { ProblemMail } from '../model/types'
import { PanelEmpty, PanelSkeleton } from './PanelState'

interface ProblemsListProps {
	items: ProblemMail[] | null
	loading: boolean
}

function problemLabel(item: ProblemMail): string {
	if (item.deletion_state === 'unknown' || item.deletion_state === 'moving') {
		return 'Сверить перемещение'
	}
	if (item.status === 'skipped') return 'Пропущено'
	if (item.status === 'retry') return 'Повторная попытка'
	if (item.needs_review || item.importance === 'uncertain')
		return 'Нужна проверка'
	return 'Проверить'
}

export function ProblemsList({ items, loading }: ProblemsListProps) {
	return (
		<Card withBorder radius="lg" padding="lg" h="100%">
			<Stack gap="md">
				<Group justify="space-between" gap="sm">
					<Title order={3} size="h4">
						Требуют внимания
					</Title>
					<Anchor component={Link} to="/problems" size="sm">
						Все проблемы
					</Anchor>
				</Group>
				{loading && !items ? (
					<PanelSkeleton rows={5} />
				) : items === null ? (
					<PanelEmpty message="Не удалось получить проблемные письма." />
				) : items.length === 0 ? (
					<PanelEmpty message="Сейчас нет писем, требующих ручной проверки." />
				) : (
					<Stack gap={0}>
						{items.map((item, index) => (
							<div key={item.email_id}>
								{index > 0 && <Divider my="sm" />}
								<Stack gap={5}>
									<Group gap="xs" justify="space-between">
										<Badge
											color={
												item.deletion_state !== 'active' ? 'red' : 'orange'
											}
											size="sm"
											variant="light"
										>
											{problemLabel(item)}
										</Badge>
										{item.attempts > 0 && (
											<Text size="xs" c="dimmed">
												Попыток: {item.attempts}
											</Text>
										)}
									</Group>
									<Text fw={600} size="sm" lineClamp={1}>
										{item.subject || 'Без темы'}
									</Text>
									<Text size="xs" c="dimmed" lineClamp={1}>
										{item.sender}
									</Text>
									{item.last_error && (
										<Text size="xs" c="dimmed" lineClamp={2}>
											{item.last_error}
										</Text>
									)}
								</Stack>
							</div>
						))}
					</Stack>
				)}
			</Stack>
		</Card>
	)
}
