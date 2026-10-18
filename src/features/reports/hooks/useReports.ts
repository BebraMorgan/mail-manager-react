import { useEffect, useMemo, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import type { Classification } from '../../../shared/types'
import { useReportsStore } from '../store/reports.store'
import {
	categoryCounts,
	downloadReport,
	reportMetrics,
} from '../model/reportUtils'

export type ReportImportanceFilter =
	'all' | 'high' | 'medium' | 'low' | 'uncertain'

export function useReports() {
	const { date, report, loading, error, setDate, load } = useReportsStore(
		useShallow((state) => ({
			date: state.date,
			report: state.report,
			loading: state.loading,
			error: state.error,
			setDate: state.setDate,
			load: state.load,
		}))
	)
	const [importance, setImportance] = useState<ReportImportanceFilter>('all')
	const [category, setCategory] = useState<string>('all')
	const [actionOnly, setActionOnly] = useState(false)
	const [opened, setOpened] = useState<Classification | null>(null)

	useEffect(() => {
		void load()
	}, [date, load])
	const counts = useMemo(() => categoryCounts(report?.items ?? []), [report])
	const filtered = useMemo(
		() =>
			(report?.items ?? []).filter(
				(item) =>
					(importance === 'all' || item.importance === importance) &&
					(category === 'all' || item.category === category) &&
					(!actionOnly || item.action_required)
			),
		[report, importance, category, actionOnly]
	)

	return {
		date,
		report,
		loading,
		error,
		setDate,
		refresh: load,
		metrics: reportMetrics(report),
		counts,
		filtered,
		importance,
		setImportance,
		category,
		setCategory,
		actionOnly,
		setActionOnly,
		opened,
		setOpened,
		exportCsv: () => {
			if (report) downloadReport(report, 'csv')
		},
		exportJson: () => {
			if (report) downloadReport(report, 'json')
		},
	}
}
