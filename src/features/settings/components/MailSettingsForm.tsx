import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm, useWatch } from 'react-hook-form'
import {
	Alert,
	Button,
	Card,
	Checkbox,
	Group,
	NumberInput,
	PasswordInput,
	Select,
	Stack,
	Text,
	TextInput,
	Title,
} from '@mantine/core'
import { IconAlertTriangle, IconFolder, IconRefresh } from '@tabler/icons-react'
import type { MailSettings } from '../../../shared/types'
import type { ImapFolder } from '../api/settings.api'
import {
	DEFAULT_MAIL_SETTINGS,
	formFromSettings,
	mailSettingsSchema,
	type MailSettingsFormValues,
} from '../model/mailSettingsForm'

interface Props {
	settings: MailSettings | null
	folders: ImapFolder[]
	saving: boolean
	loadingFolders: boolean
	foldersError: string | null
	onLoadFolders: () => void
	onSave: (input: MailSettingsFormValues) => Promise<boolean>
}

export function MailSettingsForm({
	settings,
	folders,
	saving,
	loadingFolders,
	foldersError,
	onLoadFolders,
	onSave,
}: Props) {
	const [confirmed, setConfirmed] = useState(false)
	const form = useForm<MailSettingsFormValues>({
		resolver: zodResolver(mailSettingsSchema),
		defaultValues: DEFAULT_MAIL_SETTINGS,
	})
	const {
		control,
		register,
		reset,
		handleSubmit,
		formState: { errors, isDirty },
	} = form

	const authMethod = useWatch({
		control,
		name: 'auth_method',
	})

	const allowDelete = useWatch({
		control,
		name: 'allow_delete',
	})

	useEffect(() => {
		reset(formFromSettings(settings))
	}, [settings, reset])

	return (
		<Card withBorder radius="md" p="lg">
			<Stack gap="md">
				<div>
					<Title order={4}>Подключение Яндекс Почты</Title>
					<Text size="sm" c="dimmed">
						Настройки хранятся на сервере в SQLite. Пароль и токен не читаются
						обратно из API.
					</Text>
				</div>
				{settings?.configured ? (
					<Alert variant="light" color="teal">
						Почта настроена: {settings.username}. Оставь поле секрета пустым,
						чтобы сохранить прежний. Если в базе уже есть письма, смена аккаунта
						или исходной папки потребует новой базы разработки.
					</Alert>
				) : (
					<Alert variant="light" color="blue">
						Подключение ещё не настроено. Для первого сохранения потребуется
						токен OAuth или пароль приложения.
					</Alert>
				)}
				<form
					onSubmit={(event) => {
						void handleSubmit(async (values) => {
							const ok = await onSave(values)
							if (ok) {
								reset({ ...values, oauth_token: '', app_password: '' })
								setConfirmed(false)
							}
						})(event)
					}}
				>
					<Stack gap="md">
						<Group grow align="start">
							<Controller
								name="host"
								control={control}
								render={({ field }) => (
									<Select
										label="IMAP хост"
										data={[
											{ value: 'imap.yandex.ru', label: 'imap.yandex.ru' },
											{ value: 'imap.yandex.com', label: 'imap.yandex.com' },
										]}
										value={field.value}
										onChange={(v) => {
											if (v) field.onChange(v)
										}}
										error={errors.host?.message}
									/>
								)}
							/>
							<Controller
								name="port"
								control={control}
								render={({ field }) => (
									<NumberInput
										label="Порт TLS"
										min={1}
										max={65535}
										value={field.value}
										onChange={(v) => field.onChange(v)}
										error={errors.port?.message}
									/>
								)}
							/>
						</Group>
						<TextInput
							label="Почтовый адрес"
							autoComplete="username"
							placeholder="name@yandex.ru"
							error={errors.username?.message}
							{...register('username')}
						/>
						<Controller
							name="auth_method"
							control={control}
							render={({ field }) => (
								<Select
									label="Авторизация IMAP"
									value={field.value}
									onChange={(v) => {
										if (v) field.onChange(v)
									}}
									data={[
										{ value: 'oauth2', label: 'OAuth2' },
										{ value: 'app_password', label: 'Пароль приложения' },
									]}
								/>
							)}
						/>
						{authMethod === 'oauth2' ? (
							<PasswordInput
								label="OAuth-токен"
								autoComplete="off"
								placeholder="Оставь пустым, чтобы не менять"
								error={errors.oauth_token?.message}
								{...register('oauth_token')}
							/>
						) : (
							<PasswordInput
								label="Пароль приложения"
								autoComplete="new-password"
								placeholder="Оставь пустым, чтобы не менять"
								error={errors.app_password?.message}
								{...register('app_password')}
							/>
						)}
						<Group grow align="start">
							<TextInput
								label="Исходная папка"
								placeholder="INBOX"
								error={errors.folder?.message}
								{...register('folder')}
							/>
							<TextInput
								label="Корзина IMAP"
								placeholder="Определяется сервером"
								error={errors.trash_folder?.message}
								{...register('trash_folder')}
							/>
						</Group>
						<Group justify="space-between" align="start">
							<Button
								type="button"
								variant="light"
								leftSection={<IconFolder size={16} />}
								onClick={onLoadFolders}
								loading={loadingFolders}
								disabled={!settings?.configured}
							>
								Показать папки с сервера
							</Button>
							<Text size="xs" c="dimmed">
								Список папок доступен после сохранения правильных учётных
								данных.
							</Text>
						</Group>
						{foldersError && <Alert color="orange">{foldersError}</Alert>}
						{folders.length > 0 && (
							<Group grow align="start">
								<Controller
									name="folder"
									control={control}
									render={({ field }) => (
										<Select
											label="Выбрать исходную папку из IMAP"
											placeholder="Выберите папку"
											searchable
											clearable
											data={folders.map((f) => ({
												value: f.name,
												label: f.name,
											}))}
											value={field.value || null}
											onChange={(v) => field.onChange(v ?? '')}
											error={errors.folder?.message}
										/>
									)}
								/>
								<Controller
									name="trash_folder"
									control={control}
									render={({ field }) => (
										<Select
											label="Выбрать корзину из IMAP"
											placeholder="Выберите папку"
											searchable
											clearable
											data={folders.map((f) => ({
												value: f.name,
												label: f.name,
											}))}
											value={field.value || null}
											onChange={(v) => field.onChange(v ?? '')}
											error={errors.trash_folder?.message}
										/>
									)}
								/>
							</Group>
						)}
						<Group grow align="start">
							<Controller
								name="poll_interval_seconds"
								control={control}
								render={({ field }) => (
									<NumberInput
										label="Интервал синхронизации, сек"
										min={10}
										max={86400}
										value={field.value}
										onChange={field.onChange}
										error={errors.poll_interval_seconds?.message}
									/>
								)}
							/>
							<Controller
								name="fetch_limit"
								control={control}
								render={({ field }) => (
									<NumberInput
										label="Лимит за синхронизацию"
										min={1}
										max={500}
										value={field.value}
										onChange={field.onChange}
										error={errors.fetch_limit?.message}
									/>
								)}
							/>
							<Controller
								name="max_message_bytes"
								control={control}
								render={({ field }) => (
									<NumberInput
										label="Лимит размера письма, байт"
										min={1024}
										max={50_000_000}
										value={field.value}
										onChange={field.onChange}
										error={errors.max_message_bytes?.message}
									/>
								)}
							/>
						</Group>
						<Controller
							name="allow_delete"
							control={control}
							render={({ field }) => (
								<Checkbox
									label="Разрешить перенос писем в Корзину через IMAP MOVE"
									checked={field.value}
									onChange={(e) => {
										field.onChange(e.currentTarget.checked)
										setConfirmed(false)
									}}
								/>
							)}
						/>
						{allowDelete && (
							<Alert
								color="orange"
								title="Разрешение на удаление"
								icon={<IconAlertTriangle size={18} />}
							>
								Перемещение выполняется только по ручному запросу, с
								подтверждением и паролем администратора. Убедись, что выбрана
								правильная корзина и OAuth разрешает запись.
							</Alert>
						)}
						{allowDelete && (
							<Checkbox
								checked={confirmed}
								onChange={(e) => setConfirmed(e.currentTarget.checked)}
								label="Я проверил(а) папку Корзины и понимаю последствия включения IMAP MOVE"
							/>
						)}
						<Group justify="flex-end">
							<Button
								type="submit"
								loading={saving}
								disabled={saving || (allowDelete && !confirmed)}
								leftSection={<IconRefresh size={16} />}
							>
								{isDirty
									? 'Сохранить настройки'
									: 'Сохранить / подтвердить настройки'}
							</Button>
						</Group>
					</Stack>
				</form>
			</Stack>
		</Card>
	)
}
