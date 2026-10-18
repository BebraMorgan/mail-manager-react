import { useState } from 'react'
import {
	Alert,
	Button,
	Checkbox,
	Group,
	Modal,
	PasswordInput,
	Radio,
	Stack,
	Text,
} from '@mantine/core'
import { IconAlertTriangle } from '@tabler/icons-react'
import type { ProblemMail } from '../../../shared/types'
import type { ReconciliationResolution } from '../model/types'

interface Props {
	item: ProblemMail
	busy: boolean
	onClose: () => void
	onSubmit: (
		id: number,
		resolution: ReconciliationResolution,
		password: string
	) => Promise<boolean>
}

const isResolution = (value: string): value is ReconciliationResolution =>
	value === 'in_inbox' || value === 'moved_to_trash'

export function ReconcileModal({ item, busy, onClose, onSubmit }: Props) {
	const [resolution, setResolution] = useState<ReconciliationResolution | null>(
		null
	)
	const [password, setPassword] = useState('')
	const [checked, setChecked] = useState(false)
	const canSave = checked && password.length > 0 && resolution !== null && !busy

	const submit = async () => {
		if (!canSave || resolution === null) return
		const ok = await onSubmit(item.email_id, resolution, password)
		if (ok) {
			setPassword('')
			onClose()
		}
	}

	return (
		<Modal
			opened
			onClose={busy ? () => {} : onClose}
			closeOnClickOutside={!busy}
			closeOnEscape={!busy}
			title={`Сверка IMAP — письмо #${item.email_id}`}
			centered
			size="lg"
		>
			<form
				onSubmit={(event) => {
					event.preventDefault()
					void submit()
				}}
			>
				<Stack gap="md">
					<Alert
						color="orange"
						title="Сначала проверь почтовый ящик"
						icon={<IconAlertTriangle size={18} />}
					>
						После сетевого сбоя сервер не знает, удалось ли переместить письмо.
						Интерфейс не повторяет MOVE. Проверь в Яндекс Почте, где фактически
						находится сообщение.
					</Alert>
					<Text fw={600}>{item.subject || 'Без темы'}</Text>
					<Text c="dimmed" size="sm">
						{item.sender}
					</Text>
					<Radio.Group
						label="Что ты подтвердил(а) в Яндекс Почте?"
						value={resolution ?? ''}
						onChange={(value) => {
							if (isResolution(value)) setResolution(value)
						}}
					>
						<Stack gap="xs" mt="xs">
							<Radio
								value="in_inbox"
								label="Письмо осталось в исходной IMAP-папке"
							/>
							<Radio
								value="moved_to_trash"
								label="Письмо находится в Корзине"
							/>
						</Stack>
					</Radio.Group>
					<Checkbox
						checked={checked}
						onChange={(event) => setChecked(event.currentTarget.checked)}
						label="Я проверил(а) письмо вручную в Яндекс Почте, а не сделал(а) предположение"
					/>
					<PasswordInput
						autoComplete="current-password"
						label="Пароль администратора"
						required
						value={password}
						onChange={(event) => setPassword(event.currentTarget.value)}
					/>
					<Text size="xs" c="dimmed">
						Изменяется только запись в SQLite. Этот запрос не перемещает и не
						удаляет письмо.
					</Text>
					<Group justify="flex-end">
						<Button
							type="button"
							variant="default"
							disabled={busy}
							onClick={onClose}
						>
							Отмена
						</Button>
						<Button
							type="submit"
							color="orange"
							disabled={!canSave}
							loading={busy}
						>
							Сохранить результат сверки
						</Button>
					</Group>
				</Stack>
			</form>
		</Modal>
	)
}
