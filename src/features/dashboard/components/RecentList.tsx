import {
	Anchor,
	Badge,
	Card,
	Group,
	ScrollArea,
	Table,
	Text,
	Title,
} from '@mantine/core'
import { Link } from 'react-router-dom'
import type { Classification } from '../../../shared/types'
import {
	categoryLabels,
	formatReceivedAt,
	importanceLabels,
} from '../model/selectors'
import { PanelEmpty, PanelSkeleton } from './PanelState'

interface RecentListProps {
	items: Classification[] | null
	loading: boolean
}

export function RecentList({ items, loading }: RecentListProps) {
	return (
		<Card withBorder radius="lg" padding="lg">
			<Group justify="space-between" mb="md" gap="sm">
				<Title order={3} size="h4">
					Последние классификации
				</Title>
				<Anchor component={Link} to="/mail" size="sm">
					К списку писем
				</Anchor>
			</Group>
			{loading && !items ? (
				<PanelSkeleton rows={5} />
			) : items === null ? (
				<PanelEmpty message="Не удалось загрузить последние классификации." />
			) : items.length === 0 ? (
				<PanelEmpty message="Классификаций пока нет. Проверьте настройки почты и запустите синхронизацию." />
			) : (
				<ScrollArea>
					<Table striped highlightOnHover verticalSpacing="sm" miw={670}>
						<Table.Thead>
							<Table.Tr>
								<Table.Th>Письмо</Table.Th>
								<Table.Th>Категория</Table.Th>
								<Table.Th>Важность</Table.Th>
								<Table.Th>Дата</Table.Th>
							</Table.Tr>
						</Table.Thead>
						<Table.Tbody>
							{items.map((item) => (
								<Table.Tr key={item.email_id}>
									<Table.Td>
										<Text fw={600} size="sm" lineClamp={1} maw={370}>
											{item.subject || 'Без темы'}
										</Text>
										<Text c="dimmed" size="xs" lineClamp={1} maw={370}>
											{item.sender}
										</Text>
									</Table.Td>
									<Table.Td>
										<Badge color="gray" variant="light">
											{categoryLabels[item.category] ?? item.category}
										</Badge>
									</Table.Td>
									<Table.Td>
										<Badge
											variant="light"
											color={
												item.importance === 'high'
													? 'red'
													: item.importance === 'medium'
														? 'blue'
														: item.importance === 'uncertain'
															? 'orange'
															: 'gray'
											}
										>
											{importanceLabels[item.importance] ?? item.importance}
										</Badge>
									</Table.Td>
									<Table.Td>
										<Text size="xs" c="dimmed">
											{formatReceivedAt(item.received_at)}
										</Text>
									</Table.Td>
								</Table.Tr>
							))}
						</Table.Tbody>
					</Table>
				</ScrollArea>
			)}
		</Card>
	)
}
