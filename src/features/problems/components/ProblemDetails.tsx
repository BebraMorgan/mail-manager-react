import {
	Alert,
	Button,
	Drawer,
	Group,
	Loader,
	Stack,
	Text,
	Title,
} from '@mantine/core'
import { IconInfoCircle, IconRefresh } from '@tabler/icons-react'
import type { ProblemMail } from '../../../shared/types'
import { MailDrawer } from '../../mail/components/MailDrawer'
import { useProblemDetails } from '../hooks/useProblemDetails'

interface Props {
	item: ProblemMail
	onClose: () => void
	onRetry: (id: number) => Promise<void>
	retryingId: number | null
}

export function ProblemDetails({ item, onClose, onRetry, retryingId }: Props) {
	const { classification, loading, error } = useProblemDetails(item.email_id)
	if (classification && classification.deletion_state === 'active') {
		return <MailDrawer item={classification} onClose={onClose} />
	}

	return (
		<Drawer
			opened
			position="right"
			size="md"
			title={`Письмо #${item.email_id}`}
			onClose={onClose}
		>
			<Stack gap="md">
				<Title order={4}>{item.subject || 'Без темы'}</Title>
				<Text c="dimmed" size="sm">
					{item.sender}
				</Text>
				{loading && (
					<Group>
						<Loader size="sm" />
						<Text>Загружаем классификацию…</Text>
					</Group>
				)}
				{error && <Alert color="red">{error}</Alert>}
				{!loading && !error && !classification && (
					<Alert
						icon={<IconInfoCircle size={18} />}
						color="blue"
						title="Классификация ещё отсутствует"
					>
						Это письмо зарегистрировано, но результат Qwen пока не сохранён.
						Исправить классификацию вручную можно после завершения обработки.
					</Alert>
				)}
				{item.last_error && (
					<Alert color="orange" title="Последняя ошибка">
						{item.last_error}
					</Alert>
				)}
				{!loading && (
					<Button
						variant="light"
						leftSection={<IconRefresh size={16} />}
						disabled={
							retryingId !== null ||
							item.status === 'processing' ||
							item.status === 'pending' ||
							item.deletion_state !== 'active'
						}
						loading={retryingId === item.email_id}
						onClick={() => {
							void onRetry(item.email_id)
						}}
					>
						Поставить в очередь повторно
					</Button>
				)}
			</Stack>
		</Drawer>
	)
}
