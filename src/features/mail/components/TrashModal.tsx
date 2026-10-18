import {
	Alert,
	Badge,
	Button,
	Checkbox,
	Divider,
	Group,
	Loader,
	Modal,
	PasswordInput,
	ScrollArea,
	Stack,
	Text,
} from '@mantine/core'
import { IconAlertTriangle, IconTrash } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { getSessionVersion } from '../../../shared/api/client/model/authSession'
import { mailPageApi } from '../api/mail.api'
import { useMailActions } from '../hooks/useMailActions'
import type { DeletePreview } from '../../../shared/api/mail'
import type { MoveResponse } from '../../../shared/types'

type Props = { ids: number[]; onClose: () => void }
const describeMoveStatus: Record<string, string> = {
	moved_to_trash: 'Перенесено в корзину',
	already_deleted: 'Уже удалено',
	not_found: 'Не найдено',
	invalid_id: 'Некорректный ID',
	conflict: 'Конфликт',
	needs_reconciliation: 'Требует ручной сверки',
	moved_on_server_db_error: 'Перенесено, но произошла ошибка БД',
	imap_move_unsupported: 'IMAP MOVE не поддерживается',
	uidvalidity_changed: 'UIDVALIDITY изменился',
	uid_not_found: 'Не найдено на IMAP',
	database_error: 'Ошибка базы данных',
}

export function TrashModal({ ids, onClose }: Props) {
	// Selection is frozen upon opening; it must not silently change before confirmation.
	const [requestedIds] = useState(() => [...new Set(ids)].slice(0, 100))
	const [preview, setPreview] = useState<DeletePreview | null>(null)
	const [previewError, setPreviewError] = useState<string | null>(null)
	const [password, setPassword] = useState('')
	const [confirmed, setConfirmed] = useState(false)
	const [result, setResult] = useState<MoveResponse | null>(null)
	const [submitError, setSubmitError] = useState<string | null>(null)
	const { moving, moveToTrash } = useMailActions()

	useEffect(() => {
		const version = getSessionVersion()
		let active = true
		void mailPageApi
			.previewMove(requestedIds)
			.then((value) => {
				if (active && version === getSessionVersion()) setPreview(value)
			})
			.catch((error: unknown) => {
				if (active && version === getSessionVersion())
					setPreviewError(
						error instanceof Error
							? error.message
							: 'Не удалось получить предварительный список'
					)
			})
		return () => {
			active = false
		}
	}, [requestedIds])

	const eligible =
		preview?.items.filter((item) => item.status === 'active') ?? []
	const allowed = Boolean(
		preview?.enabled &&
		preview.destination_configured &&
		eligible.length === requestedIds.length
	)
	const submit = async () => {
		setSubmitError(null)
		try {
			const response = await moveToTrash(requestedIds, password)
			setPassword('')
			setResult(response)
		} catch (error) {
			setSubmitError(
				error instanceof Error
					? error.message
					: 'Операция не завершена. Проверьте состояние почты перед повторением.'
			)
		}
	}
	return (
		<Modal
			opened
			onClose={moving ? () => {} : onClose}
			closeOnClickOutside={!moving}
			closeOnEscape={!moving}
			title={
				<Text fw={700}>
					{result
						? 'Результаты переноса'
						: `Перенос ${requestedIds.length} писем в корзину`}
				</Text>
			}
			size="lg"
			centered
		>
			<Stack gap="md">
				{!preview && !previewError && (
					<Group>
						<Loader size="sm" />
						<Text size="sm">Проверяем письма перед переносом…</Text>
					</Group>
				)}
				{previewError && (
					<Alert color="red" title="Предпросмотр недоступен">
						{previewError}
					</Alert>
				)}
				{!result && preview && (
					<>
						<Alert
							color="orange"
							icon={<IconAlertTriangle size={20} />}
							title="Только ручное действие"
						>
							Письма будут перемещены в IMAP-корзину, не удалены безвозвратно.
							Для операции необходимы разрешение на удаление и пароль
							администратора.
						</Alert>
						<ScrollArea.Autosize mah={220}>
							<Stack gap="xs">
								{preview.items.map((item) => (
									<Group key={item.id} justify="space-between" wrap="nowrap">
										<Stack gap={0} style={{ minWidth: 0 }}>
											<Text size="sm" fw={600} lineClamp={1}>
												{item.subject || `Письмо #${item.id}`}
											</Text>
											<Text size="xs" c="dimmed" lineClamp={1}>
												{item.sender || `ID ${item.id}`}
											</Text>
										</Stack>
										<Badge
											color={item.status === 'active' ? 'teal' : 'orange'}
											variant="light"
										>
											{item.status}
										</Badge>
									</Group>
								))}
							</Stack>
						</ScrollArea.Autosize>
						{!preview.enabled && (
							<Alert color="red">Перенос отключён в настройках почты.</Alert>
						)}
						{!preview.destination_configured && (
							<Alert color="red">В настройках не указана папка корзины.</Alert>
						)}
						{eligible.length !== requestedIds.length && (
							<Alert color="orange">
								Некоторые письма уже недоступны. Сними выделение и выбери только
								активные письма.
							</Alert>
						)}
						<PasswordInput
							label="Пароль администратора"
							autoComplete="off"
							value={password}
							onChange={(e) => setPassword(e.currentTarget.value)}
							disabled={!allowed || moving}
						/>
						<Checkbox
							checked={confirmed}
							onChange={(event) => setConfirmed(event.currentTarget.checked)}
							disabled={!allowed || moving}
							label={`Подтверждаю перенос ${requestedIds.length} писем в корзину`}
						/>
						{submitError && (
							<Alert color="red" title="Операция не подтверждена">
								{submitError}
							</Alert>
						)}
						<Group justify="flex-end">
							<Button variant="default" disabled={moving} onClick={onClose}>
								Отмена
							</Button>
							<Button
								color="red"
								leftSection={<IconTrash size={17} />}
								loading={moving}
								disabled={!allowed || !confirmed || password.length === 0}
								onClick={() => {
									void submit()
								}}
							>
								Переместить в корзину
							</Button>
						</Group>
					</>
				)}
				{result && (
					<>
						<Alert
							color={
								result.items.every((item) =>
									['moved_to_trash', 'already_deleted'].includes(item.status)
								)
									? 'teal'
									: 'orange'
							}
							title="Проверь результаты каждого письма"
						>
							При статусе «Требует ручной сверки» не повторяй перенос
							автоматически — сначала проверь папки IMAP.
						</Alert>
						<Divider />
						<Stack gap="xs">
							{result.items.map((item) => (
								<Group key={item.id} justify="space-between" wrap="nowrap">
									<Text size="sm">Письмо #{item.id}</Text>
									<Badge
										variant="light"
										color={
											['moved_to_trash', 'already_deleted'].includes(
												item.status
											)
												? 'teal'
												: 'orange'
										}
									>
										{describeMoveStatus[item.status] ?? item.status}
									</Badge>
								</Group>
							))}
						</Stack>
						<Button onClick={onClose}>Закрыть</Button>
					</>
				)}
			</Stack>
		</Modal>
	)
}
