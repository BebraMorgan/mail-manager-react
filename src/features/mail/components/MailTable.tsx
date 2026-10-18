import {
	Alert,
	Badge,
	Button,
	Checkbox,
	Group,
	LoadingOverlay,
	Pagination,
	Paper,
	Select,
	Stack,
	Table,
	Text,
	Tooltip,
} from '@mantine/core'
import { IconAlertCircle, IconInbox } from '@tabler/icons-react'
import type { Classification } from '../../../shared/types'
import { formatMailDate } from '../model/types'
import { MailBadges } from './MailBadges'

interface Props {
	items: Classification[]
	total: number
	page: number
	pageCount: number
	pageSize: number
	onPage: (page: number) => void
	onPageSize: (size: number) => void
	selectedIds: number[]
	selectableIds: number[]
	onToggle: (id: number) => void
	onSelectVisible: (ids: number[], checked: boolean) => void
	onClearSelection: () => void
	onOpen: (id: number) => void
	loading: boolean
	refreshing: boolean
	error: string | null
	onRetry: () => void
}

export function MailTable({
	items,
	total,
	page,
	pageCount,
	pageSize,
	onPage,
	onPageSize,
	selectedIds,
	selectableIds,
	onToggle,
	onSelectVisible,
	onClearSelection,
	onOpen,
	loading,
	refreshing,
	error,
	onRetry,
}: Props) {
	const allChecked =
		selectableIds.length > 0 &&
		selectableIds.every((id) => selectedIds.includes(id))
	const partlyChecked = selectableIds.some((id) => selectedIds.includes(id))
	return (
		<Paper withBorder radius="md" pos="relative">
			<LoadingOverlay
				visible={loading || refreshing}
				zIndex={10}
				overlayProps={{ radius: 'md', blur: 1 }}
			/>
			<Stack gap={0}>
				<Group px="md" py="sm" justify="space-between" wrap="wrap">
					<Text size="sm" c="dimmed">
						Всего классифицированных:{' '}
						<Text component="span" fw={700} c="inherit">
							{total}
						</Text>
					</Text>
					<Group gap="xs">
						{selectedIds.length > 0 && (
							<>
								<Badge variant="light">
									Выбрано: {selectedIds.length} / 100
								</Badge>
								<Button
									size="compact-xs"
									variant="subtle"
									onClick={onClearSelection}
								>
									Снять выделение
								</Button>
							</>
						)}
						<Select
							size="xs"
							w={105}
							aria-label="Писем на странице"
							data={['10', '20', '50', '100']}
							value={String(pageSize)}
							onChange={(value) => {
								if (value) onPageSize(Number(value))
							}}
						/>
					</Group>
				</Group>
				{error && (
					<Alert
						mx="md"
						mb="sm"
						color="red"
						title="Не удалось загрузить письма"
						icon={<IconAlertCircle size={18} />}
					>
						<Group justify="space-between" align="center">
							<Text size="sm">{error}</Text>
							<Button variant="light" size="xs" onClick={onRetry}>
								Повторить
							</Button>
						</Group>
					</Alert>
				)}
				{items.length === 0 && !loading && !error ? (
					<Stack py="xl" align="center" gap="xs">
						<IconInbox size={36} color="gray" />
						<Text fw={600}>Писем не найдено</Text>
						<Text size="sm" c="dimmed">
							Попробуй изменить фильтры или запустить синхронизацию.
						</Text>
					</Stack>
				) : (
					<Table.ScrollContainer minWidth={990}>
						<Table highlightOnHover verticalSpacing="md" horizontalSpacing="md">
							<Table.Thead>
								<Table.Tr>
									<Table.Th w={35}>
										<Checkbox
											aria-label="Выбрать письма на странице"
											checked={allChecked}
											indeterminate={!allChecked && partlyChecked}
											disabled={selectableIds.length === 0}
											onChange={(event) =>
												onSelectVisible(
													selectableIds,
													event.currentTarget.checked
												)
											}
										/>
									</Table.Th>
									<Table.Th>Отправитель и тема</Table.Th>
									<Table.Th>Классификация</Table.Th>
									<Table.Th>Решение модели</Table.Th>
									<Table.Th w={150}>Дата</Table.Th>
								</Table.Tr>
							</Table.Thead>
							<Table.Tbody>
								{items.map((item) => (
									<Table.Tr
										key={item.email_id}
										onClick={() => onOpen(item.email_id)}
										style={{ cursor: 'pointer' }}
									>
										<Table.Td onClick={(event) => event.stopPropagation()}>
											<Tooltip
												label={
													item.deletion_state === 'active'
														? 'Выбрать для переноса в корзину'
														: 'Недоступно для переноса'
												}
											>
												<Checkbox
													aria-label={`Выбрать письмо ${item.email_id}`}
													disabled={item.deletion_state !== 'active'}
													checked={selectedIds.includes(item.email_id)}
													onChange={() => onToggle(item.email_id)}
												/>
											</Tooltip>
										</Table.Td>
										<Table.Td style={{ maxWidth: 300 }}>
											<Text fw={600} size="sm" lineClamp={1}>
												{item.subject || '(Без темы)'}
											</Text>
											<Text size="xs" c="dimmed" lineClamp={1}>
												{item.sender || 'Отправитель неизвестен'}
											</Text>
										</Table.Td>
										<Table.Td>
											<MailBadges item={item} compact />
										</Table.Td>
										<Table.Td style={{ maxWidth: 320 }}>
											<Text size="sm" lineClamp={2}>
												{item.summary || 'Нет краткого описания'}
											</Text>
										</Table.Td>
										<Table.Td>
											<Text size="xs" c="dimmed">
												{formatMailDate(item.received_at)}
											</Text>
										</Table.Td>
									</Table.Tr>
								))}
							</Table.Tbody>
						</Table>
					</Table.ScrollContainer>
				)}
				<Group justify="space-between" px="md" py="md" wrap="wrap">
					<Text size="xs" c="dimmed">
						{total === 0
							? '0 писем'
							: `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} из ${total}`}
					</Text>
					<Pagination
						value={page}
						onChange={onPage}
						total={pageCount}
						size="sm"
						withEdges
						disabled={loading || refreshing}
					/>
				</Group>
			</Stack>
		</Paper>
	)
}
