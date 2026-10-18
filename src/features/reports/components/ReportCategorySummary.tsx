import { Card, Group, Progress, Stack, Text, Title } from '@mantine/core'
import type { CategoryCount } from '../model/reportUtils'

export function ReportCategorySummary({ counts }: { counts: CategoryCount[] }) {
	const total = counts.reduce((sum, item) => sum + item.count, 0)
	return (
		<Card withBorder radius="md" p="lg">
			<Stack gap="md">
				<Title order={4}>Категории писем в отчёте</Title>
				{counts.length === 0 && (
					<Text c="dimmed" size="sm">
						Нет писем за выбранный день
					</Text>
				)}
				{counts.map((item) => (
					<Stack key={item.category} gap={4}>
						<Group justify="space-between">
							<Text size="sm">{item.label}</Text>
							<Text size="sm" fw={600}>
								{item.count}
							</Text>
						</Group>
						<Progress value={total ? (item.count / total) * 100 : 0} />
					</Stack>
				))}
			</Stack>
		</Card>
	)
}
