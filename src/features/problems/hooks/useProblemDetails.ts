import { useEffect, useState } from 'react'
import { isApiError } from '../../../shared/api/client/model/apiError'
import type { Classification } from '../../../shared/types'
import { problemsApi } from '../api/problems.api'

export function useProblemDetails(id: number | null) {
	const [result, setResult] = useState<{
		id: number | null
		classification: Classification | null
		loading: boolean
		error: string | null
	}>({ id: null, classification: null, loading: false, error: null })

	useEffect(() => {
		if (id === null) return
		let alive = true
		void problemsApi.classification(id).then(
			(classification) => {
				if (alive)
					setResult({ id, classification, loading: false, error: null })
			},
			(error: unknown) => {
				if (!alive) return
				if (isApiError(error) && error.status === 404) {
					setResult({ id, classification: null, loading: false, error: null })
				} else {
					setResult({
						id,
						classification: null,
						loading: false,
						error:
							error instanceof Error
								? error.message
								: 'Ошибка загрузки классификации',
					})
				}
			}
		)
		return () => {
			alive = false
		}
	}, [id])

	if (id !== result.id) {
		return { classification: null, loading: id !== null, error: null }
	}
	return {
		classification: result.classification,
		loading: result.loading,
		error: result.error,
	}
}
