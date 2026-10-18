import { Button, Card, Group, Stack, Text, Title } from '@mantine/core'
import { IconRefresh } from '@tabler/icons-react'

export function MailSyncPanel({
	configured,
	syncing,
	onSync,
}: {
	configured: boolean
	syncing: boolean
	onSync: () => void
}) {
	return (
		<Card withBorder radius="md" p="lg">
			<Stack gap="sm">
				<Title order={4}>Ручная синхронизация</Title>
				<Text size="sm" c="dimmed">
					Проверяет новые письма на сервере. Qwen классифицирует их в фоне.
					Запрос может выполняться несколько минут.
				</Text>
				<Group>
					<Button
						variant="light"
						leftSection={<IconRefresh size={16} />}
						loading={syncing}
						disabled={!configured || syncing}
						onClick={onSync}
					>
						Синхронизировать сейчас
					</Button>
				</Group>
				{!configured && (
					<Text c="orange" size="xs">
						Сначала сохрани учётные данные IMAP.
					</Text>
				)}
			</Stack>
		</Card>
	)
}
