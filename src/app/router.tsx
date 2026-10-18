import { lazy } from 'react'
import { Route, Routes } from 'react-router-dom'

import { AuthWrapper } from './AuthWrapper'
import { RouteSuspense } from './RouteSuspense'

import { DashboardLayout } from '../pages/layouts/Dashboard'

const LoginPage = lazy(() =>
	import('../pages/auth/Login').then((module) => ({
		default: module.LoginPage,
	}))
)

const NotFoundPage = lazy(() =>
	import('../pages/NotFound').then((module) => ({
		default: module.NotFoundPage,
	}))
)

const DashboardPage = lazy(() =>
	import('../pages/Dashboard').then((module) => ({
		default: module.DashboardPage,
	}))
)

const MailPage = lazy(() =>
	import('../pages/Mail').then((module) => ({
		default: module.MailPage,
	}))
)

const ProblemsPage = lazy(() =>
	import('../pages/Problems').then((module) => ({
		default: module.ProblemsPage,
	}))
)

const ReportsPage = lazy(() =>
	import('../pages/Reports').then((module) => ({
		default: module.ReportsPage,
	}))
)

const SettingsPage = lazy(() =>
	import('../pages/Settings').then((module) => ({
		default: module.SettingsPage,
	}))
)

export function AppRouter() {
	return (
		<Routes>
			<Route element={<RouteSuspense fullScreen />}>
				<Route path="/login" element={<LoginPage />} />
				<Route path="*" element={<NotFoundPage />} />
			</Route>

			<Route element={<AuthWrapper />}>
				<Route element={<DashboardLayout />}>
					<Route element={<RouteSuspense />}>
						<Route index element={<DashboardPage />} />
						<Route path="mail" element={<MailPage />} />
						<Route path="problems" element={<ProblemsPage />} />
						<Route path="reports" element={<ReportsPage />} />
						<Route path="settings" element={<SettingsPage />} />
					</Route>
				</Route>
			</Route>
		</Routes>
	)
}
