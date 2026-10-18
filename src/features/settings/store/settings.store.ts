import { create } from 'zustand'
import type { MailSettings } from '../../../shared/types'
import {
	getSessionVersion,
	subscribeSessionReset,
} from '../../../shared/api/client/model/authSession'
import { settingsApi, type ImapFolder } from '../api/settings.api'
import type { SetMailSettings } from '../../../shared/types'

interface SettingsState {
	settings: MailSettings | null
	folders: ImapFolder[]
	loading: boolean
	saving: boolean
	syncing: boolean
	foldersLoading: boolean
	error: string | null
	foldersError: string | null
	load: () => Promise<void>
	save: (values: SetMailSettings) => Promise<void>
	loadFolders: () => Promise<void>
	sync: () => Promise<number>
	reset: () => void
}
let generation = 0
let loadPromise: Promise<void> | null = null

export const useSettingsStore = create<SettingsState>((set, get) => ({
	settings: null,
	folders: [],
	loading: false,
	saving: false,
	syncing: false,
	foldersLoading: false,
	error: null,
	foldersError: null,
	reset() {
		generation++
		loadPromise = null
		set({
			settings: null,
			folders: [],
			loading: false,
			saving: false,
			syncing: false,
			foldersLoading: false,
			error: null,
			foldersError: null,
		})
	},
	async load() {
		if (loadPromise) return loadPromise
		const id = generation
		const session = getSessionVersion()
		set({ loading: true, error: null })
		const task = (async () => {
			try {
				const settings = await settingsApi.load()
				if (id === generation && session === getSessionVersion())
					set({ settings, loading: false })
			} catch (e) {
				if (id === generation && session === getSessionVersion())
					set({
						loading: false,
						error: e instanceof Error ? e.message : 'Ошибка настроек',
					})
			}
		})()
		loadPromise = task
		try {
			await task
		} finally {
			if (loadPromise === task) loadPromise = null
		}
	},
	async save(values) {
		const id = generation
		const session = getSessionVersion()
		if (get().saving) throw new Error('Сохранение уже выполняется')
		set({ saving: true })
		try {
			await settingsApi.save(values)
			const current = await settingsApi.load()
			if (id === generation && session === getSessionVersion()) {
				set({ settings: current, error: null, folders: [], foldersError: null })
			}
		} finally {
			if (id === generation && session === getSessionVersion())
				set({ saving: false })
		}
	},
	async loadFolders() {
		if (!get().settings?.configured || get().foldersLoading) return
		const id = generation
		const session = getSessionVersion()
		set({ foldersLoading: true, foldersError: null })
		try {
			const result = await settingsApi.folders()
			if (id === generation && session === getSessionVersion())
				set({ folders: result.items, foldersLoading: false })
		} catch (e) {
			if (id === generation && session === getSessionVersion())
				set({
					foldersLoading: false,
					foldersError:
						e instanceof Error ? e.message : 'Не удалось получить IMAP-папки',
				})
		}
	},
	async sync() {
		if (get().syncing) throw new Error('Синхронизация уже выполняется')
		const id = generation
		const session = getSessionVersion()
		set({ syncing: true })
		try {
			const result = await settingsApi.sync()
			return result.registered
		} finally {
			if (id === generation && session === getSessionVersion())
				set({ syncing: false })
		}
	},
}))

subscribeSessionReset(() => useSettingsStore.getState().reset())
