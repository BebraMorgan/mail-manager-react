import {
	Alert,
	Button,
	Group,
	Loader,
	SimpleGrid,
	Stack,
	Text,
	Title,
} from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'
import { MailSettingsForm } from '../../features/settings/components/MailSettingsForm'
import { ChangePasswordForm } from '../../features/settings/components/ChangePasswordForm'
import { MailSyncPanel } from '../../features/settings/components/MailSyncPanel'
import { useSettings } from '../../features/settings/hooks/useSettings'
import { useChangePassword } from '../../features/settings/hooks/useChangePassword'

export function SettingsPage() {
	const mail = useSettings()
	const password = useChangePassword()
	return (
		<Stack gap="lg">
			<Group justify="space-between" align="start">
				<div>
					<Title order={2}>Настройки</Title>
					<Text c="dimmed" size="sm">
						Подключение почты, синхронизация, безопасность администратора.
					</Text>
				</div>
				<Button
					variant="default"
					loading={mail.loading}
					onClick={() => {
						void mail.load()
					}}
				>
					Обновить
				</Button>
			</Group>
			{mail.loading && !mail.settings && (
				<Group>
					<Loader size="sm" />
					<Text c="dimmed">Загружаем настройки…</Text>
				</Group>
			)}
			{mail.error && (
				<Alert
					icon={<IconAlertCircle size={18} />}
					color="red"
					title="Не удалось получить настройки"
				>
					{mail.error}
				</Alert>
			)}
			{!mail.loading && mail.settings !== null && (
				<MailSettingsForm
					settings={mail.settings}
					folders={mail.folders}
					saving={mail.saving}
					loadingFolders={mail.foldersLoading}
					foldersError={mail.foldersError}
					onLoadFolders={() => {
						void mail.loadFolders()
					}}
					onSave={mail.save}
				/>
			)}
			<SimpleGrid cols={{ base: 1, lg: 2 }}>
				<MailSyncPanel
					configured={mail.settings?.configured === true}
					syncing={mail.syncing}
					onSync={() => {
						void mail.sync()
					}}
				/>
				<ChangePasswordForm busy={password.busy} onChange={password.change} />
			</SimpleGrid>
		</Stack>
	)
}
