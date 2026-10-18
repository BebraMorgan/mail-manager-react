import {
	Badge,
	Card,
	Divider,
	Group,
	Progress,
	RingProgress,
	Stack,
	Text,
	Title,
} from '@mantine/core'
import type { QueueStats } from '../../../shared/types'
import { PanelSkeleton } from './PanelState'

interface QueueOverviewProps {
	queue: QueueStats | null
	percentage: number | null
	loading: boolean
}

export function QueueOverview({
	queue,
	percentage,
	loading,
}: QueueOverviewProps) {
	return (
		<Card withBorder radius="lg" padding="lg" h="100%">
			<Stack gap="md" h="100%">
				<Group justify="space-between">
					<Title order={3} size="h4">
						Очередь обработки
					</Title>
					<Badge color="gray" variant="light">
						Все письма
					</Badge>
				</Group>

				{loading && !queue ? (
					<PanelSkeleton />
				) : queue ? (
					<>
						<Group justify="space-between" align="center" wrap="nowrap">
							<Stack gap={6}>
								<Text c="dimmed" size="sm">
									Доля завершённых заданий
								</Text>
								<Title order={2} size="2rem">
									{percentage ?? 0}%
								</Title>
								<Text size="xs" c="dimmed">
									{queue.completed.toLocaleString('ru-RU')} из{' '}
									{queue.total.toLocaleString('ru-RU')}
								</Text>
							</Stack>
							<RingProgress
								size={125}
								thickness={12}
								roundCaps
								sections={[{ value: percentage ?? 0, color: 'teal' }]}
								label={
									<Text size="sm" fw={700} ta="center">
										{queue.total === 0 ? 'Нет задач' : `${percentage ?? 0}%`}
									</Text>
								}
							/>
						</Group>
						<Progress
							value={percentage ?? 0}
							color="teal"
							radius="xl"
							size="sm"
						/>
						<Divider />
						<Stack gap="xs">
							<Group justify="space-between">
								<Text size="sm">Ожидают</Text>
								<Text fw={600}>{queue.pending}</Text>
							</Group>
							<Group justify="space-between">
								<Text size="sm">Обрабатываются</Text>
								<Text fw={600}>{queue.processing}</Text>
							</Group>
							<Group justify="space-between">
								<Text size="sm">Повторные попытки</Text>
								<Text fw={600} c={queue.retry ? 'orange' : undefined}>
									{queue.retry}
								</Text>
							</Group>
							<Group justify="space-between">
								<Text size="sm">Пропущены</Text>
								<Text fw={600} c={queue.skipped ? 'red' : undefined}>
									{queue.skipped}
								</Text>
							</Group>
						</Stack>
					</>
				) : (
					<Text c="dimmed" size="sm">
						Статистика очереди временно недоступна.
					</Text>
				)}
			</Stack>
		</Card>
	)
}
