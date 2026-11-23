import { afterEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_SELECTED_DEX, storageHandler } from './storage-handler.ts'
import { getAllPossibleTags, getDexConfig } from '../data/pokedex-config-utils.ts'
import { defaultAppSettings } from '../null-state-helper.ts'
import { initialAppDefaults } from '../init-dex-helper.ts'
import {
	loadV1Dex,
	loadV1Session,
	readV1DexRaw,
	seedV1LocalStorage
} from '../../../tests/helpers/v1-fixtures.ts'

afterEach(() => {
	vi.useRealTimers()
})

function freezeTime(now: number) {
	vi.useFakeTimers({ toFake: ['Date'], now })
}

describe('pokedex persistence', () => {
	it('reproduces the stored format of the v1 fixtures exactly', () => {
		const fixture = loadV1Dex('gen1-empty-all-tags')
		freezeTime(fixture.meta.createdAt)

		const id = storageHandler.initPokedex(
			getDexConfig('generation-1', ['normal', 'female', 'forms'])
		)

		expect(id).toBe(fixture.id)
		expect(localStorage.getItem(`dex:${id}`)).toBe(readV1DexRaw('gen1-empty-all-tags'))
	})

	it('makes only the first national preset the system default', () => {
		freezeTime(1_000)
		const first = storageHandler.initPokedex(getDexConfig('national', getAllPossibleTags()))
		const second = storageHandler.initPokedex(getDexConfig('national', ['normal']))
		const gen1 = storageHandler.initPokedex(getDexConfig('generation-1', ['normal']))

		expect(first).toBe(DEFAULT_SELECTED_DEX)
		expect(storageHandler.loadPokedex(first)?.meta.isSystemDefault).toBe(true)
		expect(second).toBe('preset-national-normal-1000')
		expect(storageHandler.loadPokedex(second)?.meta.isSystemDefault).toBe(false)
		expect(storageHandler.loadPokedex(gen1)?.meta.isSystemDefault).toBe(false)
	})

	it('recalculates counters and timestamps on save', () => {
		const dex = loadV1Dex('gen1-filled')
		dex.meta.totalCaught = 0
		dex.state.pokemon['0007-squirtle'].captured = true
		dex.state.pokemon['0007-squirtle'].shiny = true
		freezeTime(2_000_000_000_000)

		storageHandler.savePokedex(dex)
		const saved = storageHandler.loadPokedex(dex.id)!

		expect(saved.meta).toMatchObject({
			createdAt: loadV1Dex('gen1-filled').meta.createdAt, // kept
			updatedAt: 2_000_000_000_000,
			totalPokemon: 151,
			totalCaught: 9,
			totalShiny: 2
		})
	})

	it('returns undefined for missing or corrupt saves', () => {
		localStorage.setItem('dex:broken', '{ nope')

		expect(storageHandler.loadPokedex('missing')).toBeUndefined()
		expect(storageHandler.loadPokedex('broken')).toBeUndefined()
	})

	it('removes saves', () => {
		const { gen3 } = seedV1LocalStorage()

		expect(storageHandler.removePokedex(gen3)).toBe(true)
		expect(storageHandler.removePokedex(gen3)).toBe(false)
		expect(localStorage.getItem(`dex:${gen3}`)).toBeNull()
	})

	it('detects modified saves', () => {
		const { gen1Empty, gen1Filled } = seedV1LocalStorage()

		expect(storageHandler.hasModifiedPokedex(gen1Empty)).toBe(false)
		expect(storageHandler.hasModifiedPokedex(gen1Filled)).toBe(true)
		expect(storageHandler.hasModifiedPokedex('missing')).toBe(false)
	})

	it('loads every stored pokedex', () => {
		seedV1LocalStorage()

		expect(storageHandler.loadEveryPokedex()).toHaveLength(4)
	})
})

describe('pokedex index', () => {
	it('lists all stored dexes with their counters', () => {
		const ids = seedV1LocalStorage()
		localStorage.setItem('dex:broken', '{ nope')
		vi.spyOn(console, 'error').mockImplementation(() => {})

		const index = storageHandler.loadPokedexIndex()

		expect(index).toHaveLength(4)
		expect(index.find((entry) => entry.dexSaveId === ids.gen1Filled)).toMatchObject({
			displayName: 'Kanto Living',
			tags: ['normal'],
			coverImage: 'gen-1.png',
			totalPokemon: 151,
			totalCaughtPokemon: 8,
			totalShinyPokemon: 1,
			isSystemDefault: false
		})
		expect(index.find((entry) => entry.dexSaveId === ids.national)?.isSystemDefault).toBe(true)
	})

	// Known v1 bug: the index reads timestamps from config (always 0) instead of meta.
	it.fails('exposes the save timestamps', () => {
		const { gen1Filled } = seedV1LocalStorage()
		const entry = storageHandler.loadPokedexIndex().find((e) => e.dexSaveId === gen1Filled)

		expect(entry?.updatedAt).toBe(loadV1Dex('gen1-filled').meta.updatedAt)
	})
})

describe('selected pokedex', () => {
	it('defaults to the national system default and persists it', () => {
		expect(storageHandler.loadSelectedPokedexId()).toBe(DEFAULT_SELECTED_DEX)
		expect(localStorage.getItem('selectedDex')).toBe(DEFAULT_SELECTED_DEX)
		expect(DEFAULT_SELECTED_DEX).toBe('preset-national-normal-female-forms-gigantamax')
	})

	it('loads the active pokedex', () => {
		const { gen1Filled } = seedV1LocalStorage()

		expect(storageHandler.loadActivePokedex()?.id).toBe(gen1Filled)
	})
})

describe('editPokemonStateEntry', () => {
	it('updates only allowed fields of the selected dex and persists them', () => {
		const { gen1Filled } = seedV1LocalStorage()

		const updated = storageHandler.editPokemonStateEntry('0007-squirtle', {
			...loadV1Dex('gen1-filled').state.pokemon['0007-squirtle'],
			captured: true,
			comment: 'Hallo',
			idEntry: { pokemonid: 'hacked', formid: null, id_national: 1 },
			notAllowed: 'x'
		} as never)

		const stored = storageHandler.loadPokedex(gen1Filled)!.state.pokemon['0007-squirtle']
		expect(updated).toEqual(stored)
		expect(stored).toMatchObject({ captured: true, comment: 'Hallo' })
		expect(stored.idEntry.pokemonid).toBe('squirtle')
		expect(stored).not.toHaveProperty('notAllowed')
	})

	it('returns undefined for unknown pokemon', () => {
		seedV1LocalStorage()
		vi.spyOn(console, 'error').mockImplementation(() => {})

		expect(storageHandler.editPokemonStateEntry('9999-missingno', {} as never)).toBeUndefined()
	})
})

describe('box settings', () => {
	it('updates the wallpaper of a box in the selected dex', () => {
		const { gen1Filled } = seedV1LocalStorage()

		storageHandler.updateBoxSettings('box-003', { wallpaper: '07-snow' })

		const boxes = storageHandler.loadPokedex(gen1Filled)!.state.boxes
		expect(boxes[2].settings.wallpaper).toBe('07-snow')
		expect(boxes[1].settings.wallpaper).toBe('05-crag')
	})

	it('throws for unknown boxes', () => {
		seedV1LocalStorage()

		expect(() => storageHandler.updateBoxSettings('box-999', { wallpaper: '07-snow' })).toThrow(
			'Box with ID "box-999" not found.'
		)
	})
})

describe('app settings', () => {
	it('initialises defaults on first load', () => {
		expect(storageHandler.loadAppSettings()).toEqual(defaultAppSettings)
		expect(JSON.parse(localStorage.getItem('appSettings')!)).toEqual(defaultAppSettings)
	})

	it('loads stored settings from a v1 session', () => {
		seedV1LocalStorage()
		const stored = JSON.parse(loadV1Session().localStorage.appSettings)

		expect(storageHandler.loadAppSettings()).toEqual(stored)
	})

	it('merges settings from older app versions with new defaults and writes them back', () => {
		localStorage.setItem(
			'appSettings',
			JSON.stringify({ language: 'de', conditionalBadgeDisplay: { mark: 'angry-mark' } })
		)

		const settings = storageHandler.loadAppSettings()

		expect(settings).toEqual({
			...defaultAppSettings,
			language: 'de',
			conditionalBadgeDisplay: { ribbon: '001-national-ribbon', mark: 'angry-mark' }
		})
		expect(JSON.parse(localStorage.getItem('appSettings')!)).toEqual(settings)
	})
})

describe('app defaults', () => {
	it('initialises defaults on first load', () => {
		expect(storageHandler.loadAppDefaults()).toEqual(initialAppDefaults)
		expect(localStorage.getItem('appDefaults')).not.toBeNull()
	})

	it('merges missing fields from older app versions', () => {
		localStorage.setItem('appDefaults', JSON.stringify({ ball: '02-great-ball' }))

		expect(storageHandler.loadAppDefaults()).toEqual({
			...initialAppDefaults,
			ball: '02-great-ball'
		})
	})
})

describe('import / export', () => {
	it('exports the stored save as JSON', () => {
		const { gen1Filled } = seedV1LocalStorage()

		expect(JSON.parse(storageHandler.exportPokedex(gen1Filled))).toEqual(loadV1Dex('gen1-filled'))
		vi.spyOn(console, 'error').mockImplementation(() => {})
		expect(storageHandler.exportPokedex('missing')).toBe('')
	})

	it('imports raw JSON without validation', () => {
		const dex = storageHandler.importPokedex(readV1DexRaw('gen3-forms'))

		expect(storageHandler.loadPokedex(dex.id)?.config.displayName).toBe('Hoenn Formen')
	})

	it('returns an empty object for broken imports', () => {
		vi.spyOn(console, 'error').mockImplementation(() => {})

		expect(storageHandler.importPokedex('{ nope')).toEqual({})
	})
})
