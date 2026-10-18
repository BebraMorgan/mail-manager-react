import { useEffect, useRef } from 'react'
import {
	Alert,
	Button,
	Card,
	Checkbox,
	Divider,
	Group,
	NumberInput,
	PasswordInput,
	Select,
	SimpleGrid,
	Stack,
	Text,
	TextInput,
	Title,
} from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm, useWatch } from 'react-hook-form'

import {
	formFromSettings,
	mailSettingsSchema,
	type MailSettingsFormValues,
} from '../model/mailSettingsForm'
import type { MailSettings } from '../../../shared/types'
import type { ImapFolder } from '../api/settings.api'

interface MailSettingsFormProps {
	settings: MailSettings | null
	folders: ImapFolder[]
	saving: boolean
	loadingFolders: boolean
	foldersError: string | null
	onLoadFolders: () => void
	onSave: (values: MailSettingsFormValues) => Promise<boolean>
}

const hostOptions = [
	{ value: 'imap.yandex.ru', label: 'imap.yandex.ru' },
	{ value: 'imap.yandex.com', label: 'imap.yandex.com' },
]

const authOptions = [
	{ value: 'oauth2', label: 'OAuth 2.0' },
	{ value: 'app_password', label: 'Пароль приложения' },
]

export function MailSettingsForm({
	settings,
	folders,
	saving,
	loadingFolders,
	foldersError,
	onLoadFolders,
	onSave,
}: MailSettingsFormProps) {
	const {
		control,
		handleSubmit,
		reset,
		getValues,
		formState: { errors, isDirty, isSubmitting, dirtyFields },
	} = useForm<MailSettingsFormValues>({
		resolver: zodResolver(mailSettingsSchema),
		defaultValues: formFromSettings(settings),
		mode: 'onSubmit',
		reValidateMode: 'onChange',
	})

	const authMethod = useWatch({
		control,
		name: 'auth_method',
	})

	const allowDelete = useWatch({
		control,
		name: 'allow_delete',
	})

	const lastSettingsRef = useRef(settings)

	useEffect(() => {
		if (lastSettingsRef.current === settings) {
			return
		}

		lastSettingsRef.current = settings

		reset(formFromSettings(settings), {
			keepDirtyValues: true,
		})
	}, [settings, reset])

	const submit = handleSubmit(async (values) => {
		const saved = await onSave(values)

		if (saved) {
			reset({
				...getValues(),
				oauth_token: '',
				app_password: '',
			})
		}
	})

	const busy = saving || isSubmitting

	return (
		<Card withBorder radius="md" p="lg">
			<Stack gap="lg">
				<div>
					<Title order={4}>Настройки почтового подключения</Title>

					<Text size="sm" c="dimmed">
						Параметры IMAP сохраняются в SQLite. Учётные данные обрабатываются
						Go backend.
					</Text>
				</div>

				<form
					onSubmit={(event) => {
						void submit(event)
					}}
				>
					<Stack gap="md">
						<SimpleGrid cols={{ base: 1, sm: 2 }}>
							<Controller
								name="host"
								control={control}
								render={({ field, fieldState }) => (
									<Select
										label="IMAP-сервер"
										data={hostOptions}
										allowDeselect={false}
										required
										name={field.name}
										value={field.value}
										onChange={(value) => {
											if (value !== null) {
												field.onChange(value)
											}
										}}
										onBlur={field.onBlur}
										error={fieldState.error?.message}
									/>
								)}
							/>

							<Controller
								name="port"
								control={control}
								render={({ field, fieldState }) => (
									<NumberInput
										label="Порт IMAP"
										min={1}
										max={65535}
										required
										value={field.value}
										onChange={field.onChange}
										onBlur={field.onBlur}
										error={fieldState.error?.message}
									/>
								)}
							/>
						</SimpleGrid>

						<Controller
							name="username"
							control={control}
							render={({ field, fieldState }) => (
								<TextInput
									label="Почтовый адрес"
									placeholder="name@yandex.ru"
									autoComplete="username"
									type="email"
									required
									name={field.name}
									ref={field.ref}
									value={field.value}
									onChange={field.onChange}
									onBlur={field.onBlur}
									error={fieldState.error?.message}
								/>
							)}
						/>

						<Controller
							name="auth_method"
							control={control}
							render={({ field, fieldState }) => (
								<Select
									label="Способ авторизации"
									data={authOptions}
									allowDeselect={false}
									required
									name={field.name}
									value={field.value}
									onChange={(value) => {
										if (value !== null) {
											field.onChange(value)
										}
									}}
									onBlur={field.onBlur}
									error={fieldState.error?.message}
								/>
							)}
						/>

						{authMethod === 'oauth2' ? (
							<Controller
								name="oauth_token"
								control={control}
								render={({ field, fieldState }) => (
									<PasswordInput
										label="OAuth-токен"
										description={
											settings?.configured
												? 'Оставь пустым, чтобы сохранить текущий токен, если подключение не изменилось.'
												: 'Укажи OAuth-токен для первого подключения.'
										}
										autoComplete="off"
										name={field.name}
										ref={field.ref}
										value={field.value}
										onChange={field.onChange}
										onBlur={field.onBlur}
										error={fieldState.error?.message}
									/>
								)}
							/>
						) : (
							<Controller
								name="app_password"
								control={control}
								render={({ field, fieldState }) => (
									<PasswordInput
										label="Пароль приложения"
										description={
											settings?.configured
												? 'Оставь пустым, чтобы сохранить текущий пароль, если подключение не изменилось.'
												: 'Укажи пароль приложения Яндекс Почты.'
										}
										autoComplete="off"
										name={field.name}
										ref={field.ref}
										value={field.value}
										onChange={field.onChange}
										onBlur={field.onBlur}
										error={fieldState.error?.message}
									/>
								)}
							/>
						)}

						<Divider label="Папки IMAP" labelPosition="left" />

						<Group justify="space-between" align="center">
							<Text size="sm" c="dimmed">
								Можно получить список папок с сервера.
							</Text>

							<Button
								type="button"
								variant="default"
								size="xs"
								loading={loadingFolders}
								disabled={busy}
								onClick={onLoadFolders}
							>
								Загрузить папки
							</Button>
						</Group>

						{foldersError && (
							<Alert color="red" icon={<IconAlertCircle size={16} />}>
								{foldersError}
							</Alert>
						)}

						<SimpleGrid cols={{ base: 1, sm: 2 }}>
							<Controller
								name="folder"
								control={control}
								render={({ field, fieldState }) => (
									<TextInput
										label="Исходная папка"
										placeholder="INBOX"
										required
										name={field.name}
										ref={field.ref}
										value={field.value}
										onChange={field.onChange}
										onBlur={field.onBlur}
										error={fieldState.error?.message}
									/>
								)}
							/>

							<Controller
								name="trash_folder"
								control={control}
								render={({ field, fieldState }) => (
									<TextInput
										label="Папка корзины"
										placeholder="Trash"
										description="Нужна для ручного удаления писем."
										name={field.name}
										ref={field.ref}
										value={field.value}
										onChange={field.onChange}
										onBlur={field.onBlur}
										error={fieldState.error?.message}
									/>
								)}
							/>
						</SimpleGrid>

						{folders.length > 0 && (
							<Stack gap={4}>
								<Text size="xs" fw={500}>
									Папки, полученные от IMAP-сервера:
								</Text>

								{folders.map((folder, index) => (
									<Text
										key={index}
										size="xs"
										c="dimmed"
										style={{
											overflowWrap: 'anywhere',
										}}
									>
										{JSON.stringify(folder)}
									</Text>
								))}
							</Stack>
						)}

						<Divider label="Параметры синхронизации" labelPosition="left" />

						<SimpleGrid cols={{ base: 1, sm: 3 }}>
							<Controller
								name="poll_interval_seconds"
								control={control}
								render={({ field, fieldState }) => (
									<NumberInput
										label="Интервал, сек."
										min={10}
										max={86400}
										required
										value={field.value}
										onChange={field.onChange}
										onBlur={field.onBlur}
										error={fieldState.error?.message}
									/>
								)}
							/>

							<Controller
								name="fetch_limit"
								control={control}
								render={({ field, fieldState }) => (
									<NumberInput
										label="Лимит писем"
										min={1}
										max={500}
										required
										value={field.value}
										onChange={field.onChange}
										onBlur={field.onBlur}
										error={fieldState.error?.message}
									/>
								)}
							/>

							<Controller
								name="max_message_bytes"
								control={control}
								render={({ field, fieldState }) => (
									<NumberInput
										label="Максимум байт"
										min={1024}
										max={50_000_000}
										required
										value={field.value}
										onChange={field.onChange}
										onBlur={field.onBlur}
										error={fieldState.error?.message}
									/>
								)}
							/>
						</SimpleGrid>

						<Divider label="Удаление писем" labelPosition="left" />

						<Controller
							name="allow_delete"
							control={control}
							render={({ field }) => (
								<Checkbox
									label="Разрешить ручное перемещение писем в корзину"
									description="Автоматическое удаление писем не выполняется."
									checked={field.value}
									onChange={(event) => {
										field.onChange(event.currentTarget.checked)
									}}
								/>
							)}
						/>

						{allowDelete && (
							<Alert color="yellow">
								Убедись, что указана правильная папка корзины. Удаление требует
								отдельного подтверждения.
							</Alert>
						)}

						<Group justify="flex-end">
							<Button type="submit" loading={busy} disabled={busy}>
								Сохранить настройки
							</Button>
						</Group>

						{isDirty && Object.keys(dirtyFields).length > 0 && (
							<Text size="xs" c="dimmed">
								Есть несохранённые изменения.
							</Text>
						)}

						{Object.keys(errors).length > 0 && (
							<Text size="xs" c="red">
								Проверь поля, отмеченные ошибками.
							</Text>
						)}
					</Stack>
				</form>
			</Stack>
		</Card>
	)
}
