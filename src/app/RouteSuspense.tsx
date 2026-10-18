import { Suspense } from 'react'
import { Center, Loader, Stack, Text } from '@mantine/core'
import { Outlet } from 'react-router-dom'

interface RouteSuspenseProps {
	fullScreen?: boolean
}

export function RouteSuspense({ fullScreen = false }: RouteSuspenseProps) {
	return (
		<Suspense
			fallback={
				<Center mih={fullScreen ? '100dvh' : 300}>
					<Stack align="center" gap="sm">
						<Loader size="md" type="dots" />
						<Text size="sm" c="dimmed">
							Загрузка страницы...
						</Text>
					</Stack>
				</Center>
			}
		>
			<Outlet />
		</Suspense>
	)
}
