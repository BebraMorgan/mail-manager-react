import { Button, Group, Stack, Text, Title } from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { IconCalendar, IconDownload, IconRefresh } from '@tabler/icons-react'
import { previousUtcDate, utcToday } from '../model/reportUtils'

interface Props {
	date: string
	loading: boolean
	canExport: boolean
	onDate: (date: string) => void
	onRefresh: () => void
	onExportCsv: () => void
	onExportJson: () => void
}

export function ReportHeader({
	date,
	loading,
	canExport,
	onDate,
	onRefresh,
	onExportCsv,
	onExportJson,
}: Props) {
	return (
		<Stack gap="sm">
			<div>
				<Title order={2}>Отчёты</Title>
				<Text size="sm" c="dimmed">
					Сводка по дате получения письма (UTC). Только письма, отобранные для
					отчёта.
				</Text>
			</div>
			<Group align="end" gap="sm">
				<DatePickerInput
					label="Дата (UTC)"
					value={date}
					onChange={(value) => {
						if (value) onDate(value)
					}}
					maxDate={new Date()}
					leftSection={<IconCalendar size={16} />}
					valueFormat="DD.MM.YYYY"
					w={190}
				/>
				<Button
					variant="default"
					onClick={() => onDate(previousUtcDate(date, 1))}
				>
					Предыдущий день
				</Button>
				<Button variant="default" onClick={() => onDate(utcToday())}>
					Сегодня
				</Button>
				<Button
					variant="light"
					leftSection={<IconRefresh size={16} />}
					loading={loading}
					onClick={onRefresh}
				>
					Обновить
				</Button>
				<Button
					variant="default"
					leftSection={<IconDownload size={16} />}
					disabled={!canExport}
					onClick={onExportCsv}
				>
					CSV
				</Button>
				<Button variant="default" disabled={!canExport} onClick={onExportJson}>
					JSON
				</Button>
			</Group>
		</Stack>
	)
}
