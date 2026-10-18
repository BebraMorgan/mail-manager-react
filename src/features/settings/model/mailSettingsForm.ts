import { z } from 'zod'
import type { MailSettings, SetMailSettings } from '../../../shared/types'

export const mailSettingsSchema = z
	.object({
		host: z.enum(['imap.yandex.ru', 'imap.yandex.com']),
		port: z.coerce.number().int().min(1).max(65535),
		username: z
			.string()
			.trim()
			.min(1, 'Укажи почтовый адрес')
			.email('Укажи корректный почтовый адрес'),
		auth_method: z.enum(['oauth2', 'app_password']),
		oauth_token: z.string(),
		app_password: z.string(),
		folder: z.string().trim().min(1, 'Укажи исходную папку'),
		trash_folder: z.string().trim(),
		allow_delete: z.boolean(),
		poll_interval_seconds: z.coerce.number().int().min(10).max(86400),
		fetch_limit: z.coerce.number().int().min(1).max(500),
		max_message_bytes: z.coerce.number().int().min(1024).max(50_000_000),
	})
	.superRefine((value, ctx) => {
		if (
			value.allow_delete &&
			(!value.trash_folder || value.trash_folder === value.folder)
		) {
			ctx.addIssue({
				code: 'custom',
				path: ['trash_folder'],
				message: 'Корзина должна отличаться от исходной папки',
			})
		}
	})

export type MailSettingsFormValues = z.infer<typeof mailSettingsSchema>

export const DEFAULT_MAIL_SETTINGS: MailSettingsFormValues = {
	host: 'imap.yandex.ru',
	port: 993,
	username: '',
	auth_method: 'oauth2',
	oauth_token: '',
	app_password: '',
	folder: 'INBOX',
	trash_folder: '',
	allow_delete: false,
	poll_interval_seconds: 300,
	fetch_limit: 30,
	max_message_bytes: 1048576,
}

export function formFromSettings(
	settings: MailSettings | null
): MailSettingsFormValues {
	if (!settings?.configured) {
		return { ...DEFAULT_MAIL_SETTINGS }
	}

	return {
		host:
			settings.host === 'imap.yandex.com'
				? 'imap.yandex.com'
				: 'imap.yandex.ru',
		port: settings.port ?? 993,
		username: settings.username ?? '',
		auth_method:
			settings.auth_method === 'app_password' ? 'app_password' : 'oauth2',
		oauth_token: '',
		app_password: '',
		folder: settings.folder ?? 'INBOX',
		trash_folder: settings.trash_folder ?? '',
		allow_delete: settings.allow_delete ?? false,
		poll_interval_seconds: settings.poll_interval_seconds ?? 300,
		fetch_limit: settings.fetch_limit ?? 30,
		max_message_bytes: settings.max_message_bytes ?? 1048576,
	}
}

export function credentialsRequired(
	input: MailSettingsFormValues,
	previous: MailSettings | null
): boolean {
	return !(
		previous?.configured &&
		previous.host === input.host &&
		previous.username === input.username &&
		previous.auth_method === input.auth_method
	)
}

export function toSettingsRequest(
	input: MailSettingsFormValues
): SetMailSettings {
	return {
		...input,
		oauth_token: input.auth_method === 'oauth2' ? input.oauth_token.trim() : '',
		app_password:
			input.auth_method === 'app_password' ? input.app_password : '',
	}
}
