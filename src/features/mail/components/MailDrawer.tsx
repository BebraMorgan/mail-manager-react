import {
	Alert,
	Badge,
	Box,
	Button,
	Divider,
	Drawer,
	Group,
	Loader,
	Paper,
	ScrollArea,
	Stack,
	Text,
	Title,
} from '@mantine/core'
import { modals } from '@mantine/modals'
import { IconAlertCircle, IconEdit, IconRefresh } from '@tabler/icons-react'
import { useState } from 'react'
import type {
	Classification,
	ManualClassification,
} from '../../../shared/types'
import { formatMailDate } from '../model/types'
import { useMailContent } from '../hooks/useMailContent'
import { useMailActions } from '../hooks/useMailActions'
import { MailBadges } from './MailBadges'
import { ClassificationForm } from './ClassificationForm'

interface Props {
	item: Classification
	onClose: () => void
}
export function MailDrawer({ item, onClose }: Props) {
	const [editing, setEditing] = useState(false)
	const { content, loading, error } = useMailContent(item.email_id)
	const { saving, retrying, review, retry } = useMailActions()
	const editable = item.deletion_state === 'active'
	const save = async (values: ManualClassification) => {
		await review(item.email_id, values)
		setEditing(false)
		onClose() // Reopen to see the latest classification from SQLite.
	}
	const askRetry = () =>
		modals.openConfirmModal({
			title: 'Повторить классификацию?',
			children: (
				<Text size="sm">
					Письмо #{item.email_id} будет поставлено в очередь Qwen. Результат
					появится после обработки.
				</Text>
			),
			labels: { confirm: 'Поставить в очередь', cancel: 'Отмена' },
			confirmProps: { color: 'blue' },
			onConfirm: () => {
				void retry(item.email_id)
					.then(onClose)
					.catch(() => {})
			},
		})

	return (
		<Drawer
			opened
			onClose={onClose}
			position="right"
			size="lg"
			title={<Text fw={700}>Письмо #{item.email_id}</Text>}
			padding="lg"
		>
			<Stack gap="md" pb="xl">
				<Box>
					<Title order={3} size="h4">
						{item.subject || '(Без темы)'}
					</Title>
					<Text size="sm" mt="xs">
						{item.sender}
					</Text>
					<Text size="xs" c="dimmed">
						{formatMailDate(item.received_at)}
					</Text>
				</Box>
				<MailBadges item={item} />
				<Divider />
				<Stack gap={5}>
					<Text fw={600} size="sm">
						Краткое содержание
					</Text>
					<Text size="sm">{item.summary}</Text>
					<Text size="sm" c="dimmed">
						Основание: {item.reason}
					</Text>
					{item.body_truncated && (
						<Alert variant="light" color="orange" title="Текст сокращён">
							Модель видела {item.processed_chars} из {item.original_chars}{' '}
							символов.
						</Alert>
					)}
				</Stack>
				<Group gap="xs">
					<Badge variant="outline">
						{item.include_in_report ? 'В отчёте' : 'Не в отчёте'}
					</Badge>
					<Badge variant="outline">
						{item.action_required
							? `Действие: ${item.action_type}`
							: 'Без действий'}
					</Badge>
				</Group>
				<Group align="center" gap="xs">
					<Button
						leftSection={<IconEdit size={16} />}
						variant="light"
						disabled={!editable}
						onClick={() => setEditing((s) => !s)}
					>
						{editing ? 'Скрыть редактор' : 'Исправить классификацию'}
					</Button>
					<Button
						leftSection={<IconRefresh size={16} />}
						variant="default"
						disabled={!editable || retrying}
						loading={retrying}
						onClick={askRetry}
					>
						Запустить Qwen повторно
					</Button>
				</Group>
				{editing && (
					<Paper p="md" withBorder radius="md">
						<ClassificationForm
							item={item}
							saving={saving}
							onSave={save}
							onCancel={() => setEditing(false)}
						/>
					</Paper>
				)}
				<Divider
					label="Текст письма (IMAP, только чтение)"
					labelPosition="center"
				/>
				{loading && (
					<Group>
						<Loader size="sm" />
						<Text size="sm" c="dimmed">
							Получаем письмо с IMAP-сервера…
						</Text>
					</Group>
				)}
				{error && (
					<Alert
						color="orange"
						icon={<IconAlertCircle size={17} />}
						title="Текст недоступен"
					>
						<Text size="sm">{error}</Text>
					</Alert>
				)}
				{content && (
					<ScrollArea.Autosize mah={560} type="auto">
						<Paper withBorder p="md" radius="md" bg="var(--mantine-color-body)">
							<Text
								size="sm"
								style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}
							>
								{content.body || 'Письмо не содержит доступного текста'}
							</Text>
						</Paper>
					</ScrollArea.Autosize>
				)}
				<Text size="xs" c="dimmed">
					Открытие письма не помечает его прочитанным. Ссылки и содержимое HTML
					не выполняются.
				</Text>
			</Stack>
		</Drawer>
	)
}
