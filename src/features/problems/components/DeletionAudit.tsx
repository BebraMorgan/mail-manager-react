import {
	Badge,
	Card,
	Group,
	ScrollArea,
	Stack,
	Table,
	Text,
	Title,
} from '@mantine/core'
import type { DeletionAuditEntry } from '../model/types'
import { formatProblemDate } from '../model/types'

function label(status: string): string {
	const values: Record<string, string> = {
		success: 'Успешно',
		failed: 'Ошибка',
		unknown: 'Не определено',
		pending: 'В процессе',
		started: 'Начато',
	}
	return values[status] ?? status
}

export function DeletionAudit({ items }: { items: DeletionAuditEntry[] }) {
	return (
		<Card withBorder radius="lg" p="lg">
			<Stack gap="md">
				<div>
					<Title order={3} size="h4">
						Журнал операций с письмами
					</Title>
					<Text c="dimmed" size="sm">
						Последние 50 записей. Журнал фиксирует действия и результаты, но не
						подтверждает текущее расположение письма в Яндексе.
					</Text>
				</div>
				{items.length === 0 ? (
					<Text c="dimmed" size="sm">
						Записей пока нет.
					</Text>
				) : (
					<ScrollArea type="auto">
						<Table striped highlightOnHover miw={550}>
							<Table.Thead>
								<Table.Tr>
									<Table.Th>Время</Table.Th>
									<Table.Th>Письмо</Table.Th>
									<Table.Th>Результат</Table.Th>
									<Table.Th>Код / детали</Table.Th>
								</Table.Tr>
							</Table.Thead>
							<Table.Tbody>
								{items.map((entry) => (
									<Table.Tr key={entry.id}>
										<Table.Td>
											<Text size="sm">
												{formatProblemDate(entry.created_at)}
											</Text>
										</Table.Td>
										<Table.Td>
											<Text size="sm">#{entry.email_id}</Text>
										</Table.Td>
										<Table.Td>
											<Group gap="xs">
												<Badge
													color={
														entry.status === 'success'
															? 'teal'
															: entry.status === 'failed'
																? 'red'
																: 'orange'
													}
													variant="light"
												>
													{label(entry.status)}
												</Badge>
											</Group>
										</Table.Td>
										<Table.Td>
											<Text size="xs" style={{ overflowWrap: 'anywhere' }}>
												{entry.error_code || '—'}
											</Text>
										</Table.Td>
									</Table.Tr>
								))}
							</Table.Tbody>
						</Table>
					</ScrollArea>
				)}
			</Stack>
		</Card>
	)
}
