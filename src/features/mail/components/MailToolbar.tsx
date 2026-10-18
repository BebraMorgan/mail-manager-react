import {
	ActionIcon,
	Button,
	Group,
	Paper,
	Select,
	SimpleGrid,
	Stack,
	Text,
	TextInput,
	Tooltip,
} from '@mantine/core'
import {
	IconFilterOff,
	IconRefresh,
	IconSearch,
	IconTrash,
} from '@tabler/icons-react'
import type { MailFilters } from '../model/types'
import { CATEGORY_LABELS, IMPORTANCE_LABELS, SPAM_LABELS } from '../model/types'

interface Props {
	filters: MailFilters
	search: string
	onSearch: (value: string) => void
	onFilter: <K extends keyof MailFilters>(key: K, value: MailFilters[K]) => void
	onClear: () => void
	refreshing: boolean
	onRefresh: () => void
	selectedCount: number
	onTrash: () => void
}
export function MailToolbar({
	filters,
	search,
	onSearch,
	onFilter,
	onClear,
	refreshing,
	onRefresh,
	selectedCount,
	onTrash,
}: Props) {
	return (
		<Paper withBorder radius="md" p="md">
			<Stack gap="md">
				<Group justify="space-between" align="center">
					<Text fw={600}>Поиск и фильтры</Text>
					<Group gap="xs">
						{selectedCount > 0 && (
							<Button
								color="red"
								variant="light"
								leftSection={<IconTrash size={16} />}
								onClick={onTrash}
							>
								В корзину ({selectedCount})
							</Button>
						)}
						<Tooltip label="Сбросить фильтры">
							<ActionIcon
								size="lg"
								variant="subtle"
								color="gray"
								aria-label="Сбросить фильтры"
								onClick={onClear}
							>
								<IconFilterOff size={18} />
							</ActionIcon>
						</Tooltip>
						<Tooltip label="Обновить список">
							<ActionIcon
								size="lg"
								variant="light"
								loading={refreshing}
								aria-label="Обновить список"
								onClick={onRefresh}
							>
								<IconRefresh size={18} />
							</ActionIcon>
						</Tooltip>
					</Group>
				</Group>
				<TextInput
					value={search}
					onChange={(event) => onSearch(event.currentTarget.value)}
					leftSection={<IconSearch size={16} />}
					placeholder="Тема, отправитель или краткое содержание"
					aria-label="Поиск писем"
					maxLength={120}
				/>
				<SimpleGrid cols={{ base: 1, xs: 2, md: 4 }} spacing="sm">
					<Select
						label="Категория"
						clearable
						data={Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
							value,
							label,
						}))}
						value={filters.category || null}
						onChange={(value) =>
							onFilter('category', (value ?? '') as MailFilters['category'])
						}
					/>
					<Select
						label="Важность"
						clearable
						data={Object.entries(IMPORTANCE_LABELS).map(([value, label]) => ({
							value,
							label,
						}))}
						value={filters.importance || null}
						onChange={(value) =>
							onFilter('importance', (value ?? '') as MailFilters['importance'])
						}
					/>
					<Select
						label="Спам"
						clearable
						data={Object.entries(SPAM_LABELS).map(([value, label]) => ({
							value,
							label,
						}))}
						value={filters.spam_verdict || null}
						onChange={(value) =>
							onFilter(
								'spam_verdict',
								(value ?? '') as MailFilters['spam_verdict']
							)
						}
					/>
					<Select
						label="Требуется проверка"
						clearable
						value={filters.needs_review || null}
						data={[
							{ value: 'true', label: 'Да' },
							{ value: 'false', label: 'Нет' },
						]}
						onChange={(value) =>
							onFilter(
								'needs_review',
								(value ?? '') as MailFilters['needs_review']
							)
						}
					/>
				</SimpleGrid>
				<Group gap="xs" justify="flex-end">
					<Button
						size="compact-sm"
						variant={filters.include_in_report === 'true' ? 'filled' : 'light'}
						color="blue"
						onClick={() =>
							onFilter(
								'include_in_report',
								filters.include_in_report === 'true' ? '' : 'true'
							)
						}
					>
						Только в отчёте
					</Button>
					<Button
						size="compact-sm"
						variant={filters.needs_review === 'true' ? 'filled' : 'light'}
						color="orange"
						onClick={() =>
							onFilter(
								'needs_review',
								filters.needs_review === 'true' ? '' : 'true'
							)
						}
					>
						На проверку
					</Button>
				</Group>
			</Stack>
		</Paper>
	)
}
