import { Button, Group, Stack, Text, Title } from '@mantine/core'
import { IconRefresh, IconLoader } from '@tabler/icons-react'
import { formatLastUpdated } from '../model/selectors'

interface DashboardHeaderProps {
	lastUpdatedAt: string | null
	refreshing: boolean
	syncing: boolean
	canSync: boolean
	onRefresh: () => void
	onSync: () => void
}

export function DashboardHeader({
	lastUpdatedAt,
	refreshing,
	syncing,
	canSync,
	onRefresh,
	onSync,
}: DashboardHeaderProps) {
	return (
		<Group justify="space-between" align="flex-start" gap="md">
			<Stack gap={5}>
				<Title order={1} size="h2">
					Обзор почты
				</Title>
				<Text c="dimmed" size="sm">
					Состояние очереди, важные сообщения и события, требующие внимания.
				</Text>
				<Text c="dimmed" size="xs">
					{formatLastUpdated(lastUpdatedAt)}
				</Text>
			</Stack>
			<Group gap="xs">
				<Button
					variant="default"
					leftSection={<IconRefresh size={17} />}
					loading={refreshing}
					onClick={onRefresh}
				>
					Обновить
				</Button>
				<Button
					leftSection={<IconLoader size={17} />}
					loading={syncing}
					disabled={!canSync}
					onClick={onSync}
				>
					Проверить почту
				</Button>
			</Group>
		</Group>
	)
}
