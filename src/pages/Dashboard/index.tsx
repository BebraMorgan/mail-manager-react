import { Alert, Anchor, Button, SimpleGrid, Stack, Text } from '@mantine/core'
import { IconAlertCircle, IconInfoCircle } from '@tabler/icons-react'
import { Link } from 'react-router-dom'
import { DashboardHeader } from '../../features/dashboard/components/DashboardHeader'
import { ImportantList } from '../../features/dashboard/components/ImportantList'
import { MetricCards } from '../../features/dashboard/components/MetricCards'
import { ProblemsList } from '../../features/dashboard/components/ProblemsList'
import { QueueOverview } from '../../features/dashboard/components/QueueOverview'
import { RecentList } from '../../features/dashboard/components/RecentList'
import { TodayOverview } from '../../features/dashboard/components/TodayOverview'
import { useDashboard } from '../../features/dashboard/hooks/useDashboard'
import { dashboardSourceLabels } from '../../features/dashboard/model/selectors'

export function DashboardPage() {
	const {
		status,
		data,
		metrics,
		refreshing,
		syncing,
		failedSources,
		lastUpdatedAt,
		refresh,
		synchronize,
	} = useDashboard()

	const loading = status === 'idle' || status === 'loading'
	const completelyUnavailable = failedSources.length === 6 && !lastUpdatedAt

	return (
		<Stack gap="lg">
			<DashboardHeader
				lastUpdatedAt={lastUpdatedAt}
				refreshing={refreshing}
				syncing={syncing}
				canSync={data.settings?.configured === true}
				onRefresh={refresh}
				onSync={() => {
					void synchronize()
				}}
			/>

			{data.settings?.configured === false && (
				<Alert
					color="blue"
					variant="light"
					icon={<IconInfoCircle size={18} />}
					title="Почта ещё не настроена"
				>
					<Text size="sm">
						Перейдите в{' '}
						<Anchor component={Link} to="/settings">
							настройки IMAP
						</Anchor>
						, чтобы подключить Яндекс Почту. После этого здесь появятся
						результаты обработки.
					</Text>
				</Alert>
			)}

			{failedSources.length > 0 && (
				<Alert
					color="orange"
					icon={<IconAlertCircle size={18} />}
					title="Часть данных недоступна"
				>
					<Stack gap="xs">
						<Text size="sm">
							Не удалось загрузить:{' '}
							{failedSources
								.map((source) => dashboardSourceLabels[source])
								.join(', ')}
							.
							{completelyUnavailable
								? ' Проверьте подключение к API.'
								: ' Ниже показаны доступные или ранее загруженные данные.'}
						</Text>
						<Button variant="light" size="xs" color="orange" onClick={refresh}>
							Повторить запрос
						</Button>
					</Stack>
				</Alert>
			)}

			<MetricCards metrics={metrics} loading={loading} />

			<SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
				<QueueOverview
					queue={data.queue}
					percentage={metrics.processingPercent}
					loading={loading}
				/>
				<TodayOverview report={data.today} loading={loading} />
			</SimpleGrid>

			<SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
				<ImportantList items={data.important} loading={loading} />
				<ProblemsList items={data.problems} loading={loading} />
			</SimpleGrid>

			<RecentList items={data.recent} loading={loading} />
		</Stack>
	)
}
