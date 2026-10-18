import { useState, type FC } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
	Alert,
	Button,
	Card,
	Center,
	PasswordInput,
	Stack,
	Text,
	TextInput,
	Title,
} from '@mantine/core'
import { IconLock } from '@tabler/icons-react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../shared/authGuard'
import { isApiError } from '../../../shared/api/client/model/apiError'

const schema = z.object({
	username: z.string().trim().min(1, 'Введите имя пользователя'),
	password: z.string().min(1, 'Введите пароль'),
})
type Values = z.infer<typeof schema>
export const LoginPage: FC = () => {
	const { login, isAuthenticated, isLoading } = useAuth()
	const location = useLocation()
	const navigate = useNavigate()
	const [error, setError] = useState('')
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<Values>({
		resolver: zodResolver(schema),
		defaultValues: { username: 'admin', password: '' },
	})
	const rawFrom = (location.state as { from?: { pathname?: string } } | null)
		?.from?.pathname
	const destination =
		rawFrom?.startsWith('/') &&
		!rawFrom.startsWith('//') &&
		rawFrom !== '/login'
			? rawFrom
			: '/'
	if (isAuthenticated) return <Navigate to={destination} replace />
	return (
		<Center mih="100vh" p="md">
			<Card w="100%" maw={420} p="xl" radius="lg" withBorder>
				<Stack gap="lg">
					<Stack gap={4}>
						<Title order={2}>Mail Manager</Title>
						<Text c="dimmed" size="sm">
							Вход администратора
						</Text>
					</Stack>
					{error && (
						<Alert color="red" title="Не удалось войти">
							{error}
						</Alert>
					)}
					<form
						onSubmit={handleSubmit(async (values) => {
							setError('')
							try {
								await login(values)
								navigate(destination, { replace: true })
							} catch (err) {
								setError(
									isApiError(err) && err.status === 401
										? 'Неверное имя пользователя или пароль'
										: err instanceof Error
											? err.message
											: 'Ошибка авторизации'
								)
							}
						})}
					>
						<Stack>
							<TextInput
								label="Имя пользователя"
								autoComplete="username"
								error={errors.username?.message}
								{...register('username')}
							/>
							<PasswordInput
								label="Пароль"
								autoComplete="current-password"
								error={errors.password?.message}
								{...register('password')}
							/>
							<Button
								type="submit"
								leftSection={<IconLock size={18} />}
								loading={isSubmitting || isLoading}
								fullWidth
							>
								Войти
							</Button>
						</Stack>
					</form>
				</Stack>
			</Card>
		</Center>
	)
}
