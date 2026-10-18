import {
	Badge,
	Card,
	Divider,
	Group,
	Progress,
	Stack,
	Text,
	Title,
} from '@mantine/core'
import type { DailyReport } from '../../../shared/types'
import { PanelSkeleton } from './PanelState'

interface TodayOverviewProps {
	report: DailyReport | null
	loading: boolean
}

export function TodayOverview({ report, loading }: TodayOverviewProps) {
	const percentage =
		report && report.total_received > 0
			? Math.round((report.classified / report.total_received) * 100)
			: 0

	return (
		<Card withBorder radius="lg" padding="lg" h="100%">
			<Stack gap="lg">
				<Group justify="space-between" gap="sm">
					<Title order={3} size="h4">
						За сегодня
					</Title>
					<Badge color="gray" variant="light">
						{report?.date ?? 'UTC'}
					</Badge>
				</Group>
				{loading && !report ? (
					<PanelSkeleton rows={5} />
				) : report ? (
					<>
						<Stack gap="xs">
							<Group align="baseline" justify="space-between">
								<Text c="dimmed" size="sm">
									Классифицировано сегодня
								</Text>
								<Text fw={650}>
									{report.classified} / {report.total_received}
								</Text>
							</Group>
							<Progress size="lg" radius="xl" value={percentage} color="blue" />
							<Text c="dimmed" size="xs">
								{percentage}% писем этого дня получили классификацию
							</Text>
						</Stack>
						<Divider />
						<Stack gap="sm">
							<Group justify="space-between">
								<Text size="sm">Ещё без классификации</Text>
								<Text fw={600}>{report.unprocessed}</Text>
							</Group>
							<Group justify="space-between">
								<Text size="sm">Отмечены как спам</Text>
								<Text fw={600}>{report.spam}</Text>
							</Group>
							<Group justify="space-between">
								<Text size="sm">Требуют проверки</Text>
								<Badge
									color={report.needs_review ? 'orange' : 'gray'}
									variant="light"
								>
									{report.needs_review}
								</Badge>
							</Group>
						</Stack>
						<Text c="dimmed" size="xs">
							День считается по UTC. Список писем включает только активные
							записи.
						</Text>
					</>
				) : (
					<Text c="dimmed" size="sm">
						Сводка за день временно недоступна.
					</Text>
				)}
			</Stack>
		</Card>
	)
}
