import {
	Button,
	Group,
	SegmentedControl,
	Stack,
	TextInput,
} from '@mantine/core'
import { IconRefresh, IconSearch } from '@tabler/icons-react'
import type { ProblemFilter } from '../model/types'

interface Props {
	filter: ProblemFilter
	search: string
	loading: boolean
	onFilter: (filter: ProblemFilter) => void
	onSearch: (value: string) => void
	onRefresh: () => void
}

export function ProblemsToolbar({
	filter,
	search,
	loading,
	onFilter,
	onSearch,
	onRefresh,
}: Props) {
	return (
		<Stack gap="sm">
			<Group justify="space-between" align="end" gap="sm">
				<TextInput
					label="Поиск в проблемных письмах"
					placeholder="Тема, отправитель, ID или ошибка"
					leftSection={<IconSearch size={16} />}
					value={search}
					onChange={(event) => onSearch(event.currentTarget.value)}
					miw={240}
					style={{ flex: 1 }}
				/>
				<Button
					leftSection={<IconRefresh size={16} />}
					variant="default"
					loading={loading}
					onClick={onRefresh}
				>
					Обновить
				</Button>
			</Group>
			<SegmentedControl
				fullWidth
				value={filter}
				onChange={(value) => onFilter(value as ProblemFilter)}
				data={[
					{ value: 'all', label: 'Все' },
					{ value: 'retry', label: 'Ошибки' },
					{ value: 'skipped', label: 'Пропущены' },
					{ value: 'review', label: 'Проверить' },
					{ value: 'reconcile', label: 'Сверка IMAP' },
				]}
			/>
		</Stack>
	)
}
