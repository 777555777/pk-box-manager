import { describe, expect, it, vi } from 'vitest'
import {
	defaultAppSettings,
	initialAppDefaults,
	loadAppDefaults,
	loadAppSettings,
	loadSelectedDexId,
	saveSelectedDexId
} from './settings-storage.ts'
import { loadV1Session, seedV1LocalStorage } from '../../../tests/helpers/v1-fixtures.ts'

describe('app settings', () => {
	it('initialises defaults on first load', () => {
		expect(loadAppSettings()).toEqual(defaultAppSettings())
		expect(JSON.parse(localStorage.getItem('appSettings')!)).toEqual(defaultAppSettings())
	})

	it('loads the settings of a v1 session unchanged', () => {
		seedV1LocalStorage()

		expect(loadAppSettings()).toEqual(JSON.parse(loadV1Session().localStorage.appSettings))
	})

	it('merges settings of older app versions with new defaults and writes them back', () => {
		localStorage.setItem(
			'appSettings',
			JSON.stringify({ language: 'de', conditionalBadgeDisplay: { mark: 'angry-mark' } })
		)

		const settings = loadAppSettings()

		expect(settings).toEqual({
			...defaultAppSettings(),
			language: 'de',
			conditionalBadgeDisplay: { ribbon: '001-national-ribbon', mark: 'angry-mark' }
		})
		expect(JSON.parse(localStorage.getItem('appSettings')!)).toEqual(settings)
	})

	it('ignores corrupt settings', () => {
		vi.spyOn(console, 'error').mockImplementation(() => {})
		localStorage.setItem('appSettings', '{ nope')

		expect(loadAppSettings()).toEqual(defaultAppSettings())
	})
})

describe('app defaults', () => {
	it('initialises defaults on first load', () => {
		expect(loadAppDefaults()).toEqual(initialAppDefaults())
		expect(localStorage.getItem('appDefaults')).not.toBeNull()
	})

	it('merges fields missing in older app versions', () => {
		localStorage.setItem('appDefaults', JSON.stringify({ ball: '02-great-ball' }))

		expect(loadAppDefaults()).toEqual({ ...initialAppDefaults(), ball: '02-great-ball' })
	})

	it('returns fresh objects', () => {
		initialAppDefaults().ribbons.push('x')
		defaultAppSettings().wikiLinkConfig.pop()

		expect(initialAppDefaults().ribbons).toEqual([])
		expect(defaultAppSettings().wikiLinkConfig).toHaveLength(3)
	})
})

describe('selected dex', () => {
	it('keeps the v1 key', () => {
		expect(loadSelectedDexId()).toBeNull()

		saveSelectedDexId('abc')

		expect(localStorage.getItem('selectedDex')).toBe('abc')
		expect(loadSelectedDexId()).toBe('abc')
	})
})
