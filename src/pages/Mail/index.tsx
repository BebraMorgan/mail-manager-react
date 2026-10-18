import { Alert, Group, Stack, Text, Title } from '@mantine/core'
import { IconInfoCircle } from '@tabler/icons-react'
import { useState } from 'react'
import { useMailPage } from '../../features/mail/hooks/useMailPage'
import { MailDrawer } from '../../features/mail/components/MailDrawer'
import { MailTable } from '../../features/mail/components/MailTable'
import { MailToolbar } from '../../features/mail/components/MailToolbar'
import { TrashModal } from '../../features/mail/components/TrashModal'

export function MailPage() {
	const mail = useMailPage()
	const [trashOpen, setTrashOpen] = useState(false)
	const item = mail.items.find((m) => m.email_id === mail.selectedMailId)
	return (
		<Stack gap="lg">
			<Group justify="space-between" align="start">
				<div>
					<Title order={2}>Письма</Title>
					<Text size="sm" c="dimmed" mt={4}>
						Классификации Qwen, ручная проверка и управление сообщениями в
						Яндекс Почте.
					</Text>
				</div>
			</Group>
			<Alert icon={<IconInfoCircle size={18} />} color="blue" variant="light">
				В таблице отображаются только письма с готовой классификацией.
				Непрочитанные и ожидающие обработки сообщения появятся после работы
				фонового worker. Перенос в корзину возможен только по вашему
				подтверждению.
			</Alert>
			<MailToolbar
				filters={mail.filters}
				search={mail.search}
				onSearch={mail.setSearch}
				onFilter={mail.setFilter}
				onClear={() => {
					mail.setSearch('')
					mail.clearFilters()
				}}
				refreshing={mail.refreshing}
				onRefresh={() => {
					void mail.load()
				}}
				selectedCount={mail.selectedIds.length}
				onTrash={() => setTrashOpen(true)}
			/>
			<MailTable
				items={mail.items}
				total={mail.total}
				page={mail.page}
				pageCount={mail.pageCount}
				pageSize={mail.pageSize}
				onPage={mail.setPage}
				onPageSize={mail.setPageSize}
				selectedIds={mail.selectedIds}
				selectableIds={mail.selectableIds}
				onToggle={mail.toggleSelected}
				onSelectVisible={mail.selectVisible}
				onClearSelection={mail.clearSelected}
				onOpen={mail.openMail}
				loading={mail.status === 'idle' || mail.status === 'loading'}
				refreshing={mail.refreshing}
				error={mail.error}
				onRetry={() => {
					void mail.load()
				}}
			/>
			{item && (
				<MailDrawer
					key={item.email_id}
					item={item}
					onClose={() => mail.openMail(null)}
				/>
			)}
			{trashOpen && (
				<TrashModal
					ids={mail.selectedIds}
					onClose={() => setTrashOpen(false)}
				/>
			)}
		</Stack>
	)
}
