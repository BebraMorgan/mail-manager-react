import { zodResolver } from '@hookform/resolvers/zod'
import {
	Button,
	Checkbox,
	Group,
	Select,
	Stack,
	Text,
	Textarea,
} from '@mantine/core'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import type {
	Classification,
	ManualClassification,
} from '../../../shared/types'
import { CATEGORY_LABELS, IMPORTANCE_LABELS, SPAM_LABELS } from '../model/types'

const schema = z
	.object({
		spam_verdict: z.enum(['spam', 'not_spam', 'uncertain']),
		category: z.enum([
			'personal',
			'work',
			'finance',
			'security',
			'shopping',
			'delivery',
			'account',
			'social',
			'newsletter',
			'promotion',
			'notification',
			'other',
			'uncertain',
		]),
		importance: z.enum(['low', 'medium', 'high', 'uncertain']),
		action_required: z.boolean(),
		action_type: z.enum([
			'none',
			'reply',
			'review',
			'payment',
			'deadline',
			'security',
			'other',
		]),
		summary: z
			.string()
			.trim()
			.min(1, 'Укажи краткое содержание')
			.max(240, 'Максимум 240 символов'),
		reason: z
			.string()
			.trim()
			.min(1, 'Укажи обоснование')
			.max(320, 'Максимум 320 символов'),
		include_in_report: z.boolean(),
	})
	.superRefine((value, ctx) => {
		if (!value.action_required && value.action_type !== 'none')
			ctx.addIssue({
				code: 'custom',
				path: ['action_type'],
				message: 'Без действия выбери «Не требуется»',
			})
		if (value.action_required && value.action_type === 'none')
			ctx.addIssue({
				code: 'custom',
				path: ['action_type'],
				message: 'Укажи тип действия',
			})
		if (value.spam_verdict === 'spam' && value.action_required)
			ctx.addIssue({
				code: 'custom',
				path: ['action_required'],
				message: 'Спам не может требовать действия',
			})
	})

interface Props {
	item: Classification
	saving: boolean
	onSave: (value: ManualClassification) => Promise<void>
	onCancel: () => void
}
export function ClassificationForm({ item, saving, onSave, onCancel }: Props) {
	const {
		control,
		register,
		handleSubmit,
		formState: { errors },
		setValue,
	} = useForm<ManualClassification>({
		resolver: zodResolver(schema),
		defaultValues: {
			spam_verdict: item.spam_verdict,
			category: item.category,
			importance: item.importance,
			action_required: item.action_required,
			action_type: item.action_type,
			summary: item.summary,
			reason: item.reason,
			include_in_report: item.include_in_report,
		},
	})
	const spam = useWatch({ control, name: 'spam_verdict' })
	const actionRequired = useWatch({ control, name: 'action_required' })
	return (
		<form
			onSubmit={handleSubmit(async (values) => {
				await onSave(values)
			})}
		>
			<Stack gap="sm">
				<Group grow align="start">
					<Controller
						control={control}
						name="category"
						render={({ field }) => (
							<Select
								label="Категория"
								required
								data={Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
									value,
									label,
								}))}
								value={field.value}
								onChange={(v) => field.onChange(v)}
								error={errors.category?.message}
							/>
						)}
					/>
					<Controller
						control={control}
						name="importance"
						render={({ field }) => (
							<Select
								label="Важность"
								required
								data={Object.entries(IMPORTANCE_LABELS).map(
									([value, label]) => ({ value, label })
								)}
								value={field.value}
								onChange={(v) => field.onChange(v)}
								error={errors.importance?.message}
							/>
						)}
					/>
				</Group>
				<Controller
					control={control}
					name="spam_verdict"
					render={({ field }) => (
						<Select
							label="Спам"
							required
							data={Object.entries(SPAM_LABELS).map(([value, label]) => ({
								value,
								label,
							}))}
							value={field.value}
							onChange={(v) => {
								field.onChange(v)
								if (v === 'spam') {
									setValue('action_required', false)
									setValue('action_type', 'none')
								}
							}}
							error={errors.spam_verdict?.message}
						/>
					)}
				/>
				<Controller
					control={control}
					name="action_required"
					render={({ field }) => (
						<Checkbox
							label="Требуется действие от получателя"
							checked={field.value}
							disabled={spam === 'spam'}
							onChange={(event) => {
								field.onChange(event.currentTarget.checked)
								if (!event.currentTarget.checked)
									setValue('action_type', 'none')
							}}
							error={errors.action_required?.message}
						/>
					)}
				/>
				<Controller
					control={control}
					name="action_type"
					render={({ field }) => (
						<Select
							label="Тип действия"
							disabled={!actionRequired}
							data={[
								{ value: 'none', label: 'Не требуется' },
								{ value: 'reply', label: 'Ответить' },
								{ value: 'payment', label: 'Оплатить' },
								{ value: 'deadline', label: 'Срок/задача' },
								{ value: 'security', label: 'Безопасность' },
								{ value: 'review', label: 'Проверить' },
								{ value: 'other', label: 'Другое' },
							]}
							value={field.value}
							onChange={(v) => field.onChange(v)}
							error={errors.action_type?.message}
						/>
					)}
				/>
				<Textarea
					label="Краткое содержание"
					required
					autosize
					minRows={2}
					maxRows={4}
					maxLength={240}
					{...register('summary')}
					error={errors.summary?.message}
				/>
				<Textarea
					label="Обоснование"
					required
					autosize
					minRows={2}
					maxRows={4}
					maxLength={320}
					{...register('reason')}
					error={errors.reason?.message}
				/>
				<Controller
					control={control}
					name="include_in_report"
					render={({ field }) => (
						<Checkbox
							label="Включать в отчёт"
							checked={field.value}
							onChange={(event) => field.onChange(event.currentTarget.checked)}
						/>
					)}
				/>
				<Text size="xs" c="dimmed">
					Правка сохраняется в SQLite и не изменяет письмо в IMAP.
				</Text>
				<Group justify="flex-end">
					<Button variant="default" onClick={onCancel}>
						Отмена
					</Button>
					<Button type="submit" loading={saving}>
						Сохранить
					</Button>
				</Group>
			</Stack>
		</form>
	)
}
