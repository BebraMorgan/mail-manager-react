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
import type { Classification } from '../../../shared/types'
import { categoryLabels, formatReceivedAt } from '../model/selectors'
import { PanelEmpty, PanelSkeleton } from './PanelState'

interface ImportantListProps {
	items: Classification[] | null
	loading: boolean
}

export function ImportantList({ items, loading }: ImportantListProps) {
	return (
		<Card withBorder radius="lg" padding="lg" h="100%">
			<Stack gap="md">
				<Group justify="space-between" gap="sm">
					<Title order={3} size="h4">
						Высокий приоритет
					</Title>
					<Anchor component={Link} to="/mail" size="sm">
						Все письма
					</Anchor>
				</Group>
				{loading && !items ? (
					<PanelSkeleton rows={5} />
				) : items === null ? (
					<PanelEmpty message="Не удалось получить важные письма." />
				) : items.length === 0 ? (
					<PanelEmpty message="Писем с высокой важностью пока нет." />
				) : (
					<Stack gap={0}>
						{items.map((item, index) => (
							<div key={item.email_id}>
								{index > 0 && <Divider my="sm" />}
								<Stack gap={5}>
									<Group gap="xs">
										<Badge size="xs" color="red" variant="light">
											Важно
										</Badge>
										<Badge size="xs" color="gray" variant="light">
											{categoryLabels[item.category] ?? item.category}
										</Badge>
										{item.needs_review && (
											<Badge size="xs" color="orange">
												Проверить
											</Badge>
										)}
									</Group>
									<Text size="sm" fw={600} lineClamp={1}>
										{item.subject || 'Без темы'}
									</Text>
									<Text size="xs" c="dimmed" lineClamp={1}>
										{item.sender || 'Отправитель не указан'}
									</Text>
									{item.summary && (
										<Text size="xs" lineClamp={2}>
											{item.summary}
										</Text>
									)}
									<Text size="xs" c="dimmed">
										{formatReceivedAt(item.received_at)}
									</Text>
								</Stack>
							</div>
						))}
					</Stack>
				)}
			</Stack>
		</Card>
	)
}
