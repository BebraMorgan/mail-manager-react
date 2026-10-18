import { Card, Grid, Group, Stack, Text, ThemeIcon } from '@mantine/core'
import {
	IconAlertTriangle,
	IconArrowsExchange,
	IconClockExclamation,
	IconEyeCheck,
	IconListCheck,
} from '@tabler/icons-react'

interface Metrics {
	total: number
	retry: number
	skipped: number
	review: number
	reconcile: number
}

export function ProblemsSummary({ metrics }: { metrics: Metrics }) {
	const cards = [
		{
			label: 'Найдено проблем',
			value: metrics.total,
			icon: IconListCheck,
			color: 'blue',
		},
		{
			label: 'Повторные попытки',
			value: metrics.retry,
			icon: IconClockExclamation,
			color: 'orange',
		},
		{
			label: 'Пропущено',
			value: metrics.skipped,
			icon: IconAlertTriangle,
			color: 'red',
		},
		{
			label: 'Проверка человеком',
			value: metrics.review,
			icon: IconEyeCheck,
			color: 'yellow',
		},
		{
			label: 'Сверка IMAP',
			value: metrics.reconcile,
			icon: IconArrowsExchange,
			color: 'grape',
		},
	] as const
	return (
		<Grid>
			{cards.map(({ label, value, icon: Icon, color }) => (
				<Grid.Col key={label} span={{ base: 12, xs: 6, md: 4, lg: 2.4 }}>
					<Card withBorder radius="lg" p="md" h="100%">
						<Group justify="space-between" align="start" wrap="nowrap">
							<Stack gap={4}>
								<Text c="dimmed" size="xs">
									{label}
								</Text>
								<Text fw={750} fz={25} lh={1.2}>
									{value}
								</Text>
							</Stack>
							<ThemeIcon color={color} variant="light" size="lg" radius="md">
								<Icon size={18} />
							</ThemeIcon>
						</Group>
					</Card>
				</Grid.Col>
			))}
		</Grid>
	)
}
