import {
	Badge,
	Button,
	Card,
	Checkbox,
	Group,
	ScrollArea,
	Select,
	Stack,
	Table,
	Text,
	Title,
} from '@mantine/core'
import type { Classification } from '../../../shared/types'
import { MailBadges } from '../../mail/components/MailBadges'
import { formatMailDate, IMPORTANCE_LABELS } from '../../mail/model/types'
import type { ReportImportanceFilter } from '../hooks/useReports'
import type { CategoryCount } from '../model/reportUtils'

interface Props {
	items: Classification[]
	total: number
	counts: CategoryCount[]
	importance: ReportImportanceFilter
	category: string
	actionOnly: boolean
	onImportance: (v: ReportImportanceFilter) => void
	onCategory: (v: string) => void
	onActionOnly: (v: boolean) => void
	onOpen: (v: Classification) => void
}
const IMPORTANCE = ['all', 'high', 'medium', 'low', 'uncertain'] as const
function isImportance(value: string): value is ReportImportanceFilter {
	return IMPORTANCE.some((v) => v === value)
}
export function ReportMailList(props: Props) {
	return (
		<Card withBorder radius="md" p="lg">
			<Stack gap="md">
				<Title order={4}>Письма отчёта</Title>
				<Group align="end" gap="sm">
					<Select
						label="Важность"
						w={185}
						value={props.importance}
						data={[
							{ value: 'all', label: 'Все' },
							...(['high', 'medium', 'low', 'uncertain'] as const).map((v) => ({
								value: v,
								label: IMPORTANCE_LABELS[v],
							})),
						]}
						onChange={(v) => {
							if (v && isImportance(v)) props.onImportance(v)
						}}
					/>
					<Select
						label="Категория"
						w={210}
						value={props.category}
						data={[
							{ value: 'all', label: 'Все категории' },
							...props.counts.map((v) => ({
								value: v.category,
								label: v.label,
							})),
						]}
						onChange={(v) => props.onCategory(v ?? 'all')}
						searchable
					/>
					<Checkbox
						label="Только требующие действий"
						checked={props.actionOnly}
						onChange={(e) => props.onActionOnly(e.currentTarget.checked)}
						mb="xs"
					/>
				</Group>
				<Text c="dimmed" size="sm">
					Показано {props.items.length} из {props.total} писем, включённых в
					отчёт
				</Text>
				<ScrollArea>
					<Table striped highlightOnHover verticalSpacing="md" miw={740}>
						<Table.Thead>
							<Table.Tr>
								<Table.Th>Письмо</Table.Th>
								<Table.Th>Классификация</Table.Th>
								<Table.Th>Когда</Table.Th>
								<Table.Th />
							</Table.Tr>
						</Table.Thead>
						<Table.Tbody>
							{props.items.map((item) => (
								<Table.Tr key={item.email_id}>
									<Table.Td>
										<Stack gap={3}>
											<Text fw={600} lineClamp={1}>
												{item.subject || 'Без темы'}
											</Text>
											<Text size="xs" c="dimmed" lineClamp={1}>
												{item.sender}
											</Text>
											<Text size="sm" lineClamp={2}>
												{item.summary}
											</Text>
										</Stack>
									</Table.Td>
									<Table.Td>
										<MailBadges item={item} compact />
										{item.action_required && (
											<Badge mt={6} size="xs" variant="outline">
												Нужно действие
											</Badge>
										)}
									</Table.Td>
									<Table.Td>
										<Text size="xs" style={{ whiteSpace: 'nowrap' }}>
											{formatMailDate(item.received_at)}
										</Text>
									</Table.Td>
									<Table.Td>
										<Button
											size="xs"
											variant="light"
											onClick={() => props.onOpen(item)}
										>
											Открыть
										</Button>
									</Table.Td>
								</Table.Tr>
							))}
							{props.items.length === 0 && (
								<Table.Tr>
									<Table.Td colSpan={4}>
										<Text c="dimmed" ta="center" py="lg">
											Нет писем по выбранным фильтрам
										</Text>
									</Table.Td>
								</Table.Tr>
							)}
						</Table.Tbody>
					</Table>
				</ScrollArea>
				<Text size="xs" c="dimmed">
					Сервер ограничивает список отчёта 1000 письмами за день. CSV/JSON
					экспортирует полученный отчёт без фильтров.
				</Text>
			</Stack>
		</Card>
	)
}
