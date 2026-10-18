import {
	AppShell,
	Badge,
	Burger,
	Button,
	Container,
	Group,
	NavLink,
	Stack,
	Text,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import {
	IconLayoutDashboard,
	IconInbox,
	IconAlertTriangle,
	IconChartBar,
	IconSettings,
	IconLogout,
} from '@tabler/icons-react'
import { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../shared/authGuard'
export function DashboardLayout() {
	const location = useLocation()
	const navigate = useNavigate()
	const { user, logout } = useAuth()
	const [opened, { toggle, close }] = useDisclosure(false)
	const [loggingOut, setLoggingOut] = useState(false)
	const navigation = [
		{ label: 'Обзор', href: '/', icon: IconLayoutDashboard },
		{ label: 'Письма', href: '/mail', icon: IconInbox },
		{ label: 'Проблемы', href: '/problems', icon: IconAlertTriangle },
		{ label: 'Отчёты', href: '/reports', icon: IconChartBar },
		{
			label: 'Настройки IMAP и аккаунта',
			href: '/settings',
			icon: IconSettings,
		},
	]
	return (
		<AppShell
			header={{ height: 60 }}
			navbar={{ width: 255, breakpoint: 'sm', collapsed: { mobile: !opened } }}
			padding="md"
		>
			<AppShell.Header>
				<Group h="100%" px="lg" justify="space-between">
					<Group>
						<Burger
							opened={opened}
							onClick={toggle}
							hiddenFrom="sm"
							size="sm"
						/>
						<IconInbox size={24} />
						<Text fw={700}>Mail Manager</Text>
					</Group>
					<Group>
						<Badge variant="light">{user?.username ?? 'admin'}</Badge>
						<Button
							variant="subtle"
							color="gray"
							leftSection={<IconLogout size={17} />}
							loading={loggingOut}
							onClick={async () => {
								setLoggingOut(true)
								try {
									await logout()
									navigate('/login', { replace: true })
								} catch {
									navigate('/login', { replace: true })
								} finally {
									setLoggingOut(false)
								}
							}}
						>
							Выйти
						</Button>
					</Group>
				</Group>
			</AppShell.Header>
			<AppShell.Navbar p="sm">
				<Stack gap={4}>
					{navigation.map((item) => (
						<NavLink
							key={item.href}
							component={Link}
							to={item.href}
							label={item.label}
							leftSection={<item.icon size={18} />}
							active={location.pathname === item.href}
							onClick={close}
						/>
					))}
				</Stack>
			</AppShell.Navbar>
			<AppShell.Main>
				<Container size="xl" py="md">
					<Outlet />
				</Container>
			</AppShell.Main>
		</AppShell>
	)
}
