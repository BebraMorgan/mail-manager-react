import { useState } from 'react'
import { notifications } from '@mantine/notifications'
import type { ManualClassification, MoveResponse } from '../../../shared/types'
import { mailPageApi } from '../api/mail.api'
import { useMailStore } from '../store/mail.store'

function describe(error: unknown): string {
	return error instanceof Error ? error.message : 'Запрос не выполнен'
}

export function useMailActions() {
	const [saving, setSaving] = useState(false)
	const [retrying, setRetrying] = useState(false)
	const [moving, setMoving] = useState(false)

	const review = async (id: number, decision: ManualClassification) => {
		setSaving(true)
		try {
			await mailPageApi.review(id, decision)
			await useMailStore.getState().load()
			notifications.show({
				color: 'teal',
				title: 'Сохранено',
				message: 'Классификация изменена вручную',
			})
		} catch (error) {
			notifications.show({
				color: 'red',
				title: 'Не удалось сохранить',
				message: describe(error),
			})
			throw error
		} finally {
			setSaving(false)
		}
	}

	const retry = async (id: number) => {
		setRetrying(true)
		try {
			await mailPageApi.retry(id)
			await useMailStore.getState().load()
			notifications.show({
				color: 'teal',
				title: 'Письмо в очереди',
				message: 'Повторную классификацию выполнит фоновый worker',
			})
		} catch (error) {
			notifications.show({
				color: 'red',
				title: 'Не удалось повторить',
				message: describe(error),
			})
			throw error
		} finally {
			setRetrying(false)
		}
	}

	const moveToTrash = async (
		ids: number[],
		password: string
	): Promise<MoveResponse> => {
		setMoving(true)
		try {
			const result = await mailPageApi.moveToTrash(ids, password)
			const completed = result.items.filter((item) =>
				['moved_to_trash', 'already_deleted'].includes(item.status)
			)
			useMailStore.getState().removeSelected(completed.map((item) => item.id))
			await useMailStore.getState().load()
			notifications.show({
				color: completed.length === result.items.length ? 'teal' : 'orange',
				title:
					completed.length === result.items.length
						? 'Перенос выполнен'
						: 'Перенос выполнен частично',
				message: `Обработано успешно: ${completed.length} из ${result.items.length}. Проверьте статусы каждого письма.`,
			})
			return result
		} catch (error) {
			notifications.show({
				color: 'red',
				title: 'Ошибка переноса',
				message: describe(error),
			})
			throw error
		} finally {
			setMoving(false)
		}
	}

	return { saving, retrying, moving, review, retry, moveToTrash }
}
