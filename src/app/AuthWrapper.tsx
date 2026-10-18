import { Center, Loader, Stack, Text } from '@mantine/core'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../shared/authGuard/hooks/useAuth'

export function AuthWrapper() {
	const location = useLocation()
	const auth = useAuth()
	if (auth.isLoading)
		return (
			<Center mih="100vh">
				<Stack align="center">
					<Loader />
					<Text c="dimmed">Проверка сессии…</Text>
				</Stack>
			</Center>
		)
	if (!auth.isAuthenticated)
		return <Navigate to="/login" replace state={{ from: location }} />
	return <Outlet />
}
