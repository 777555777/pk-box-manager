/**
 * Small app settings stay in localStorage: they are needed synchronously on start.
 * Keys and formats are unchanged from v1.
 */
import type { EntryData } from '../dex/types.ts'
import { DEFAULT_BALL } from '../dex/types.ts'
import type { MarksType } from '../models/marks-models.ts'
import type { RibbonsType } from '../models/ribbons-models.ts'

export type BadgeDisplayMode = false | 'ball' | 'comment' | 'ribbon' | 'mark'
export type SidebarSection = 'catch' | 'ribbon' | 'mark' | 'stats'
export type WikiLink = 'bulbapedia' | 'pokewiki' | 'bisafans' | 'wikidex'

export interface AppSettings {
	language: 'en' | 'de'
	boxSprites: 'default' | 'scaled'
	font: 'pixel' | 'system'
	badgeCycleOption: 'default' | 'filter'
	badgeDisplay: BadgeDisplayMode
	conditionalBadgeDisplay: {
		ribbon: RibbonsType
		mark: MarksType
	}
	sidebarExpanded: SidebarSection[]
	wikiLinkConfig: WikiLink[]
}

/** Values applied when a pokemon is edited for the first time. */
export type AppDefaults = Omit<EntryData, 'captured' | 'ability'>

const SETTINGS_KEY = 'appSettings'
const DEFAULTS_KEY = 'appDefaults'
const SELECTED_DEX_KEY = 'selectedDex'

export function defaultAppSettings(): AppSettings {
	return {
		language: 'en',
		boxSprites: 'default',
		font: 'pixel',
		badgeCycleOption: 'default',
		badgeDisplay: false,
		conditionalBadgeDisplay: {
			ribbon: '001-national-ribbon',
			mark: 'absent-minded-mark'
		},
		sidebarExpanded: ['catch'],
		wikiLinkConfig: ['bulbapedia', 'pokewiki', 'bisafans']
	}
}

export function initialAppDefaults(): AppDefaults {
	return {
		ball: DEFAULT_BALL,
		shiny: false,
		caughtIn: '',
		comment: '',
		originalTrainer: '',
		ribbons: [],
		marks: []
	}
}

function readJson(key: string): Record<string, unknown> | undefined {
	const raw = localStorage.getItem(key)
	if (raw === null) return undefined
	try {
		const parsed = JSON.parse(raw)
		return typeof parsed === 'object' && parsed !== null ? parsed : undefined
	} catch {
		console.error(`Ignoring corrupt localStorage entry "${key}"`)
		return undefined
	}
}

export function saveAppSettings(settings: AppSettings): void {
	localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

/** Loads the settings, merges in defaults added by newer app versions and writes them back. */
export function loadAppSettings(): AppSettings {
	const stored = readJson(SETTINGS_KEY)
	const defaults = defaultAppSettings()
	const settings: AppSettings = {
		...defaults,
		...stored,
		conditionalBadgeDisplay: {
			...defaults.conditionalBadgeDisplay,
			...(stored?.conditionalBadgeDisplay as object | undefined)
		}
	}
	if (JSON.stringify(stored) !== JSON.stringify(settings)) saveAppSettings(settings)
	return settings
}

export function saveAppDefaults(defaults: AppDefaults): void {
	localStorage.setItem(DEFAULTS_KEY, JSON.stringify(defaults))
}

export function loadAppDefaults(): AppDefaults {
	const stored = readJson(DEFAULTS_KEY)
	const defaults: AppDefaults = { ...initialAppDefaults(), ...stored }
	if (JSON.stringify(stored) !== JSON.stringify(defaults)) saveAppDefaults(defaults)
	return defaults
}

export function loadSelectedDexId(): string | null {
	return localStorage.getItem(SELECTED_DEX_KEY)
}

export function saveSelectedDexId(dexId: string): void {
	localStorage.setItem(SELECTED_DEX_KEY, dexId)
}
