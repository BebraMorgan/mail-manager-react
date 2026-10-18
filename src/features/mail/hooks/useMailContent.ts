import { useEffect, useState } from 'react'
import { getSessionVersion } from '../../../shared/api/client/model/authSession'
import { mailPageApi } from '../api/mail.api'
import type { MailContent } from '../../../shared/api/mail'

export function useMailContent(id: number | null) {
	const [content, setContent] = useState<MailContent | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	useEffect(() => {
		if (id === null) return
		let active = true
		const version = getSessionVersion()
		void (async () => {
			try {
				const data = await mailPageApi.content(id)
				if (active && version === getSessionVersion()) setContent(data)
			} catch (cause) {
				if (active && version === getSessionVersion()) {
					setError(
						cause instanceof Error
							? cause.message
							: 'Не удалось получить письмо из IMAP'
					)
				}
			} finally {
				if (active && version === getSessionVersion()) setLoading(false)
			}
		})()
		return () => {
			active = false
		}
	}, [id])
	return { content, loading: id !== null && loading, error }
}
