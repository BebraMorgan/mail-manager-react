import {
	Card,
	Group,
	SimpleGrid,
	Skeleton,
	Stack,
	Text,
	ThemeIcon,
} from '@mantine/core'
import {
	IconAlertTriangle,
	IconChecklist,
	IconClockHour4,
	IconMail,
} from '@tabler/icons-react'
import type { ComponentType } from 'react'
import type { DashboardMetrics } from '../model/types'

type DashboardMetric = {
	title: string
	value: number | null
	description: string
	color: string
	icon: ComponentType<{ size?: number; stroke?: number }>
}

interface MetricCardsProps {
	metrics: DashboardMetrics
	loading: boolean
}

export function MetricCards({ metrics, loading }: MetricCardsProps) {
	const cards: DashboardMetric[] = [
		{
			title: 'Завершено',
			value: metrics.processed,
			description: 'Всего классификаций в очереди',
			color: 'teal',
			icon: IconChecklist,
		},
		{
			title: 'Ожидают обработки',
			value: metrics.pending,
			description: 'Ожидание и текущая обработка',
			color: 'blue',
			icon: IconClockHour4,
		},
		{
			title: 'Ошибки и пропуски',
			value: metrics.errors,
			description: 'Статусы retry и skipped',
			color: 'orange',
			icon: IconAlertTriangle,
		},
		{
			title: 'Новых сегодня',
			value: metrics.receivedToday,
			description: 'Получено за календарный день UTC',
			color: 'violet',
			icon: IconMail,
		},
	]

	return (
		<SimpleGrid cols={{ base: 1, xs: 2, lg: 4 }} spacing="md">
			{cards.map((item) => (
				<Card key={item.title} withBorder radius="lg" padding="lg">
					<Stack gap="sm">
						<Group justify="space-between" align="start" wrap="nowrap">
							<Text size="sm" c="dimmed" fw={500}>
								{item.title}
							</Text>
							<ThemeIcon
								variant="light"
								color={item.color}
								radius="md"
								size="lg"
							>
								<item.icon size={19} stroke={1.8} />
							</ThemeIcon>
						</Group>
						{loading && item.value === null ? (
							<Skeleton height={40} width={95} />
						) : (
							<Text fw={750} size="2rem" lh={1.1}>
								{item.value === null ? '—' : item.value.toLocaleString('ru-RU')}
							</Text>
						)}
						<Text c="dimmed" size="xs">
							{item.description}
						</Text>
					</Stack>
				</Card>
			))}
		</SimpleGrid>
	)
}
