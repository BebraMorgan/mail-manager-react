import {
	Card,
	Group,
	SimpleGrid,
	Skeleton,
	Stack,
	Text,
	Title,
} from '@mantine/core'
import type { ReturnTypeReportMetrics } from '../model/reportTypes'

const CARDS: {
	key: keyof ReturnTypeReportMetrics
	label: string
	detail: string
}[] = [
	{ key: 'total', label: 'Получено', detail: 'Письма в базе за день' },
	{ key: 'classified', label: 'Обработано', detail: 'Классифицировано Qwen' },
	{ key: 'unprocessed', label: 'Ожидают', detail: 'Без классификации' },
	{ key: 'inReport', label: 'В отчёте', detail: 'Отобранные сообщения' },
	{ key: 'spam', label: 'Спам', detail: 'По результатам модели' },
	{ key: 'needsReview', label: 'На проверку', detail: 'Сомнительные решения' },
	{ key: 'high', label: 'Важных в отчёте', detail: 'Высокий приоритет' },
	{
		key: 'actions',
		label: 'Требуют действий',
		detail: 'Явные запросы получателю',
	},
]

export function ReportMetrics({
	metrics,
	loading,
}: {
	metrics: ReturnTypeReportMetrics
	loading: boolean
}) {
	return (
		<SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
			{CARDS.map(({ key, label, detail }) => (
				<Card key={key} withBorder p="md" radius="md">
					<Stack gap={4}>
						<Group justify="space-between">
							<Text size="sm" c="dimmed">
								{label}
							</Text>
						</Group>
						{loading ? (
							<Skeleton height={32} width={64} />
						) : (
							<Title order={3}>{metrics[key]}</Title>
						)}
						<Text size="xs" c="dimmed">
							{detail}
						</Text>
					</Stack>
				</Card>
			))}
		</SimpleGrid>
	)
}
