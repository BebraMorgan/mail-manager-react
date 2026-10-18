import { Alert, SimpleGrid, Stack, Text } from '@mantine/core'
import { IconAlertCircle, IconInfoCircle } from '@tabler/icons-react'
import { MailDrawer } from '../../features/mail/components/MailDrawer'
import { ReportHeader } from '../../features/reports/components/ReportHeader'
import { ReportMetrics } from '../../features/reports/components/ReportMetrics'
import { ReportCategorySummary } from '../../features/reports/components/ReportCategorySummary'
import { ReportMailList } from '../../features/reports/components/ReportMailList'
import { useReports } from '../../features/reports/hooks/useReports'

export function ReportsPage() {
	const state = useReports()
	return (
		<Stack gap="lg">
			<ReportHeader
				date={state.date}
				loading={state.loading}
				canExport={Boolean(state.report)}
				onDate={state.setDate}
				onRefresh={() => {
					void state.refresh()
				}}
				onExportCsv={state.exportCsv}
				onExportJson={state.exportJson}
			/>
			<Alert variant="light" color="blue" icon={<IconInfoCircle size={18} />}>
				Отчёт считается по дате получения письма в UTC, а не по локальному
				часовому поясу. В итоговый список попадают только сообщения с{' '}
				<Text span fw={600}>
					include_in_report
				</Text>
				. Классификация, спам и необходимость действий определяются моделью и
				могут требовать ручной проверки.
			</Alert>
			{state.error && (
				<Alert
					color="red"
					icon={<IconAlertCircle size={18} />}
					title="Ошибка получения отчёта"
				>
					{state.error}
				</Alert>
			)}
			<ReportMetrics
				metrics={state.metrics}
				loading={state.loading && !state.report}
			/>
			<SimpleGrid cols={{ base: 1, lg: 2 }}>
				<ReportCategorySummary counts={state.counts} />
				<Alert variant="light" color="gray" title="Как читать статистику">
					<Stack gap="xs">
						<Text size="sm">
							«Получено» включает письма без классификации, включая повторные
							попытки обработки.
						</Text>
						<Text size="sm">
							«Важных» и «Требуют действий» относятся только к отобранным в
							отчёт письмам.
						</Text>
						<Text size="sm">
							«Спам» и «На проверку» отражают все классификации выбранного дня.
						</Text>
					</Stack>
				</Alert>
			</SimpleGrid>
			<ReportMailList
				items={state.filtered}
				total={state.report?.items.length ?? 0}
				counts={state.counts}
				importance={state.importance}
				category={state.category}
				actionOnly={state.actionOnly}
				onImportance={state.setImportance}
				onCategory={state.setCategory}
				onActionOnly={state.setActionOnly}
				onOpen={state.setOpened}
			/>
			{state.opened && (
				<MailDrawer
					key={state.opened.email_id}
					item={state.opened}
					onClose={() => {
						state.setOpened(null)
						void state.refresh()
					}}
				/>
			)}
		</Stack>
	)
}
