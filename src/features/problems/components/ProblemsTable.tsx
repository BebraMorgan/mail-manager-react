import {
	Alert,
	Button,
	Card,
	Group,
	Loader,
	ScrollArea,
	Stack,
	Table,
	Text,
} from '@mantine/core'
import { modals } from '@mantine/modals'
import {
	IconArrowsExchange,
	IconEye,
	IconRefresh,
	IconInbox,
} from '@tabler/icons-react'
import type { ProblemMail } from '../../../shared/types'
import { ProblemBadges } from './ProblemBadges'

interface Props {
	items: ProblemMail[]
	busyRetryId: number | null
	onDetails: (item: ProblemMail) => void
	onRetry: (id: number) => Promise<void>
	onReconcile: (item: ProblemMail) => void
}

function confirmRetry(
	item: ProblemMail,
	onRetry: (id: number) => Promise<void>
) {
	modals.openConfirmModal({
		title: 'Повторить классификацию?',
		children: (
			<Text size="sm">
				Письмо #{item.email_id} будет повторно отправлено в очередь Qwen. Ошибка
				может повториться, если причина не устранена.
			</Text>
		),
		labels: { confirm: 'Поставить в очередь', cancel: 'Отмена' },
		confirmProps: { color: 'blue' },
		onConfirm: () => {
			void onRetry(item.email_id)
		},
	})
}

export function ProblemsTable({
	items,
	busyRetryId,
	onDetails,
	onRetry,
	onReconcile,
}: Props) {
	if (!items.length)
		return (
			<Card withBorder radius="lg" p="xl">
				<Stack gap="xs" align="center" py="lg">
					<IconInbox size={30} color="var(--mantine-color-dimmed)" />
					<Text fw={600}>Совпадений нет</Text>
					<Text size="sm" c="dimmed" ta="center">
						Нет проблемных писем для выбранного фильтра.
					</Text>
				</Stack>
			</Card>
		)

	return (
		<Card withBorder radius="lg" p={0}>
			<ScrollArea type="auto">
				<Table
					verticalSpacing="md"
					horizontalSpacing="lg"
					highlightOnHover
					miw={900}
				>
					<Table.Thead>
						<Table.Tr>
							<Table.Th>Письмо</Table.Th>
							<Table.Th>Состояние</Table.Th>
							<Table.Th>Причина</Table.Th>
							<Table.Th>Попытки</Table.Th>
							<Table.Th style={{ textAlign: 'right' }}>Действия</Table.Th>
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>
						{items.map((item) => {
							const active = item.deletion_state === 'active'
							const canRetry =
								active &&
								item.status !== 'processing' &&
								item.status !== 'pending'
							return (
								<Table.Tr key={item.email_id}>
									<Table.Td>
										<Stack gap={3} maw={290}>
											<Text fw={600} size="sm" lineClamp={2}>
												{item.subject || '(Без темы)'}
											</Text>
											<Text c="dimmed" size="xs" lineClamp={1}>
												{item.sender}
											</Text>
											<Text c="dimmed" size="xs">
												#{item.email_id}
											</Text>
										</Stack>
									</Table.Td>
									<Table.Td>
										<ProblemBadges item={item} />
									</Table.Td>
									<Table.Td>
										<Text
											size="sm"
											c={item.last_error ? undefined : 'dimmed'}
											maw={320}
											style={{ overflowWrap: 'anywhere' }}
										>
											{item.last_error ||
												(item.needs_review
													? 'Qwen отметила письмо для проверки'
													: item.importance === 'uncertain'
														? 'Важность не определена'
														: '—')}
										</Text>
									</Table.Td>
									<Table.Td>
										<Text size="sm" ta="center">
											{item.attempts}
										</Text>
									</Table.Td>
									<Table.Td>
										<Group justify="flex-end" gap="xs" wrap="nowrap">
											{item.deletion_state === 'unknown' ? (
												<Button
													size="xs"
													color="orange"
													variant="light"
													leftSection={<IconArrowsExchange size={15} />}
													onClick={() => onReconcile(item)}
												>
													Сверить
												</Button>
											) : item.deletion_state === 'moving' ? (
												<Alert color="orange" variant="light" p="xs">
													<Text size="xs">Операция ещё не завершена</Text>
												</Alert>
											) : null}
											{active && (
												<Button
													size="xs"
													variant="subtle"
													leftSection={<IconEye size={15} />}
													onClick={() => onDetails(item)}
												>
													Открыть
												</Button>
											)}
											{canRetry && (
												<Button
													size="xs"
													variant="light"
													color="blue"
													leftSection={
														busyRetryId === item.email_id ? (
															<Loader size={14} />
														) : (
															<IconRefresh size={15} />
														)
													}
													disabled={busyRetryId !== null}
													onClick={() => confirmRetry(item, onRetry)}
												>
													Повторить
												</Button>
											)}
										</Group>
									</Table.Td>
								</Table.Tr>
							)
						})}
					</Table.Tbody>
				</Table>
			</ScrollArea>
		</Card>
	)
}
