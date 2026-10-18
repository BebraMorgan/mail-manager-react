import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button, Card, PasswordInput, Stack, Text, Title } from '@mantine/core'

const passwordSchema = z
	.object({
		current_password: z.string().min(1, 'Введи текущий пароль'),
		new_password: z.string().min(12, 'Минимум 12 символов'),
		confirm_password: z.string().min(1, 'Повтори новый пароль'),
	})
	.refine((v) => v.new_password === v.confirm_password, {
		path: ['confirm_password'],
		message: 'Пароли не совпадают',
	})
type PasswordForm = z.infer<typeof passwordSchema>

export function ChangePasswordForm({
	busy,
	onChange,
}: {
	busy: boolean
	onChange: (current: string, next: string) => Promise<boolean>
}) {
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<PasswordForm>({
		resolver: zodResolver(passwordSchema),
		defaultValues: {
			current_password: '',
			new_password: '',
			confirm_password: '',
		},
	})
	return (
		<Card withBorder radius="md" p="lg">
			<Stack gap="md">
				<div>
					<Title order={4}>Смена пароля администратора</Title>
					<Text size="sm" c="dimmed">
						После смены пароля все устройства потеряют доступ, потребуется новый
						вход.
					</Text>
				</div>
				<form
					onSubmit={(event) => {
						void handleSubmit(async (values) => {
							if (await onChange(values.current_password, values.new_password))
								reset()
						})(event)
					}}
				>
					<Stack gap="sm">
						<PasswordInput
							label="Текущий пароль"
							autoComplete="current-password"
							error={errors.current_password?.message}
							{...register('current_password')}
						/>
						<PasswordInput
							label="Новый пароль"
							autoComplete="new-password"
							error={errors.new_password?.message}
							{...register('new_password')}
						/>
						<PasswordInput
							label="Повтори новый пароль"
							autoComplete="new-password"
							error={errors.confirm_password?.message}
							{...register('confirm_password')}
						/>
						<Button type="submit" loading={busy} disabled={busy}>
							Сменить пароль и завершить сессию
						</Button>
					</Stack>
				</form>
			</Stack>
		</Card>
	)
}
