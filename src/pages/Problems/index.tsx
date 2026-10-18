import { useState } from 'react'
import { Alert, Group, Loader, Stack, Text, Title } from '@mantine/core'
import { IconAlertCircle, IconInfoCircle } from '@tabler/icons-react'
import type { ProblemMail } from '../../shared/types'
import { useProblems } from '../../features/problems/hooks/useProblems'
import { useProblemActions } from '../../features/problems/hooks/useProblemActions'
import { ProblemsSummary } from '../../features/problems/components/ProblemsSummary'
import { ProblemsToolbar } from '../../features/problems/components/ProblemsToolbar'
import { ProblemsTable } from '../../features/problems/components/ProblemsTable'
import { DeletionAudit } from '../../features/problems/components/DeletionAudit'
import { ReconcileModal } from '../../features/problems/components/ReconcileModal'
import { ProblemDetails } from '../../features/problems/components/ProblemDetails'
import { formatProblemDate } from '../../features/problems/model/types'

export function ProblemsPage() {
	const problems = useProblems()
	const actions = useProblemActions()
	const [opened, setOpened] = useState<ProblemMail | null>(null)
	const [reconciliation, setReconciliation] = useState<ProblemMail | null>(null)
	const initialLoading =
		problems.status === 'idle' || problems.status === 'loading'

	return (
		<Stack gap="lg">
			<Group justify="space-between" align="start">
				<div>
					<Title order={2}>Проблемные письма</Title>
					<Text c="dimmed" size="sm" mt={4}>
						Ошибки обработки, неопределённые решения модели и ручная сверка
						IMAP.
					</Text>
				</div>
				{problems.updatedAt && (
					<Text size="xs" c="dimmed">
						Обновлено: {formatProblemDate(problems.updatedAt)}
					</Text>
				)}
			</Group>

			<Alert variant="light" color="blue" icon={<IconInfoCircle size={18} />}>
				Отображаются не более 200 последних проблемных писем. Фильтры и поиск
				применяются только к загруженному списку; счётчики категорий могут
				пересекаться. Решение о перемещении писем в корзину всегда принимает
				человек.
			</Alert>

			<ProblemsSummary metrics={problems.metrics} />
			<ProblemsToolbar
				filter={problems.filter}
				search={problems.search}
				onFilter={problems.setFilter}
				onSearch={problems.setSearch}
				loading={problems.refreshing || initialLoading}
				onRefresh={() => {
					void problems.load()
				}}
			/>

			{initialLoading && (
				<Group>
					<Loader size="sm" />
					<Text c="dimmed" size="sm">
						Получаем список проблем…
					</Text>
				</Group>
			)}
			{problems.error && (
				<Alert
					color="red"
					title="Не удалось обновить список"
					icon={<IconAlertCircle size={18} />}
				>
					{problems.error}. Попробуйте обновить страницу или проверьте
					соединение с Go API.
				</Alert>
			)}

			{!initialLoading && (
				<>
					<Text size="sm" c="dimmed">
						Показано {problems.filtered.length} из {problems.items.length}{' '}
						загруженных писем
					</Text>
					<ProblemsTable
						items={problems.filtered}
						busyRetryId={actions.retryingId}
						onDetails={setOpened}
						onRetry={actions.retry}
						onReconcile={setReconciliation}
					/>
				</>
			)}

			{problems.auditError && (
				<Alert color="orange" title="Журнал IMAP недоступен">
					{problems.auditError}
				</Alert>
			)}
			<DeletionAudit items={problems.audit} />

			{opened && (
				<ProblemDetails
					key={opened.email_id}
					item={opened}
					retryingId={actions.retryingId}
					onRetry={actions.retry}
					onClose={() => {
						setOpened(null)
						void problems.load()
					}}
				/>
			)}
			{reconciliation && (
				<ReconcileModal
					key={reconciliation.email_id}
					item={reconciliation}
					busy={actions.reconcilingId === reconciliation.email_id}
					onClose={() => setReconciliation(null)}
					onSubmit={actions.reconcile}
				/>
			)}
		</Stack>
	)
}
