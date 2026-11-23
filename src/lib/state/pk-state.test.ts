import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
	loadV1Dex,
	readRealExports,
	seedV1LocalStorage
} from '../../../tests/helpers/v1-fixtures.ts'
import type { DexSave } from '../models/data-models.ts'

// pkState and appState are module singletons that read localStorage on construction.
// Every test gets fresh instances via resetModules + dynamic import.
async function loadState() {
	vi.resetModules()
	const { pkState } = await import('./pk-state.svelte.ts')
	const { appState } = await import('./app-state.svelte.ts')
	const { storageHandler } = await import('./storage-handler.ts')
	return { pkState, appState, storageHandler }
}

function storedDex(id: string): DexSave {
	return JSON.parse(localStorage.getItem(`dex:${id}`)!)
}

beforeEach(() => {
	vi.spyOn(console, 'log').mockImplementation(() => {})
})

afterEach(() => {
	vi.useRealTimers()
})

describe('startup', () => {
	it('creates and selects the national system default on first start', async () => {
		const { pkState, appState } = await loadState()

		const dex = pkState.getPokedex()
		expect(dex.id).toBe('preset-national-normal-female-forms-gigantamax')
		expect(dex.meta.isSystemDefault).toBe(true)
		expect(dex.state.boxes).toHaveLength(65)
		expect(appState.getSelectedPokedexId()).toBe(dex.id)
		expect(pkState.getPokedexIndexList()).toHaveLength(1)
	})

	it('restores an existing v1 session', async () => {
		const ids = seedV1LocalStorage()
		const { pkState, appState } = await loadState()

		expect(pkState.getPokedex().id).toBe(ids.gen1Filled)
		expect(pkState.getPokemon('0025-pikachu')).toMatchObject({
			shiny: true,
			originalTrainer: 'Ash'
		})
		expect(pkState.getPokedexIndexList()).toHaveLength(4)
		expect(appState.getAppSettings()).toMatchObject({ language: 'de', badgeDisplay: 'ball' })
	})

	describe.skipIf(readRealExports().length === 0)('real exports from /.testdata', () => {
		it.each(readRealExports())('loads $file as the active dex', async ({ raw }) => {
			const dex = JSON.parse(raw) as DexSave
			localStorage.setItem(`dex:${dex.id}`, raw)
			localStorage.setItem('selectedDex', dex.id)
			const { pkState } = await loadState()

			const state = pkState.getCurrentPokedexState()
			const caught = Object.values(state.pokemon).filter((p) => p.captured).length
			expect(pkState.getPokedex().id).toBe(dex.id)
			expect(caught).toBe(dex.meta.totalCaught)
		})
	})
})

describe('updatePokemon', () => {
	it('applies the app defaults on the first edit and marks the entry as customized', async () => {
		const { gen1Filled } = seedV1LocalStorage()
		const { pkState, appState } = await loadState()
		appState.updateAppDefaults({ ball: '02-great-ball', caughtIn: 'Sword' })

		pkState.updatePokemon('0007-squirtle', { captured: true })

		const expected = {
			captured: true,
			ball: '02-great-ball',
			caughtIn: 'Sword',
			isCustomized: true
		}
		expect(pkState.getPokemon('0007-squirtle')).toMatchObject(expected)
		expect(storedDex(gen1Filled).state.pokemon['0007-squirtle']).toMatchObject(expected)
	})

	it('does not apply the defaults again for customized entries', async () => {
		seedV1LocalStorage()
		const { pkState, appState } = await loadState()
		appState.updateAppDefaults({ ball: '02-great-ball' })

		pkState.updatePokemon('0004-charmander', { shiny: true })

		expect(pkState.getPokemon('0004-charmander')).toMatchObject({
			ball: '03-ultra-ball',
			shiny: true
		})
	})

	it('implicitly captures a pokemon when another field is edited', async () => {
		seedV1LocalStorage()
		const { pkState } = await loadState()

		pkState.updatePokemon('0007-squirtle', { comment: 'Notiz' })

		expect(pkState.getPokemon('0007-squirtle')).toMatchObject({ captured: true, comment: 'Notiz' })
	})

	it('can release a pokemon without losing its customization', async () => {
		seedV1LocalStorage()
		const { pkState } = await loadState()

		pkState.updatePokemon('0004-charmander', { captured: false })

		expect(pkState.getPokemon('0004-charmander')).toMatchObject({
			captured: false,
			isCustomized: true,
			ball: '03-ultra-ball'
		})
	})

	it('updates the counters of the index list', async () => {
		const { gen1Filled } = seedV1LocalStorage()
		const { pkState } = await loadState()

		pkState.updatePokemon('0007-squirtle', { captured: true })
		pkState.updatePokemon('0008-wartortle', { shiny: true })

		const entry = pkState.getPokedexIndexList().find((e) => e.dexSaveId === gen1Filled)
		expect(entry).toMatchObject({ totalCaughtPokemon: 10, totalShinyPokemon: 2 })
	})

	it('keeps the selected pokemon in sync', async () => {
		seedV1LocalStorage()
		const { pkState } = await loadState()
		pkState.updateSelectedPokemon('0001-bulbasaur')

		pkState.updatePokemon('0001-bulbasaur', { comment: 'Neu' })

		expect(pkState.getSelectedPokemon().comment).toBe('Neu')
	})

	it('throws for pokemon that are not part of the dex', async () => {
		seedV1LocalStorage()
		const { pkState } = await loadState()

		expect(() => pkState.updatePokemon('0252-treecko', { captured: true })).toThrow(
			'does not exist in the current Pokedex'
		)
	})
})

describe('ribbons and marks', () => {
	it('toggles ribbons', async () => {
		seedV1LocalStorage()
		const { pkState } = await loadState()

		pkState.toggleRibbon('0025-pikachu', '002-earth-ribbon')
		pkState.toggleRibbon('0025-pikachu', '001-national-ribbon')

		expect(pkState.getPokemon('0025-pikachu').ribbons).toEqual([
			'003-champion-ribbon',
			'002-earth-ribbon'
		])
	})

	it('toggles marks', async () => {
		seedV1LocalStorage()
		const { pkState } = await loadState()

		pkState.toggleMark('0025-pikachu', 'absent-minded-mark')
		pkState.toggleMark('0025-pikachu', 'angry-mark')

		expect(pkState.getPokemon('0025-pikachu').marks).toEqual(['angry-mark'])
	})
})

describe('resetting', () => {
	it('resets a single pokemon to its null state', async () => {
		const { gen1Filled } = seedV1LocalStorage()
		const { pkState } = await loadState()

		pkState.resetPokemon('0025-pikachu')

		const expected = {
			captured: false,
			shiny: false,
			ribbons: [],
			marks: [],
			originalTrainer: '',
			isCustomized: false
		}
		expect(pkState.getPokemon('0025-pikachu')).toMatchObject(expected)
		expect(storedDex(gen1Filled).state.pokemon['0025-pikachu']).toMatchObject(expected)
	})

	it('resets a whole dex including wallpapers', async () => {
		const { gen1Filled } = seedV1LocalStorage()
		const { pkState } = await loadState()

		pkState.resetPokedex(gen1Filled)

		const dex = pkState.getPokedex()
		expect(Object.values(dex.state.pokemon).some((p) => p.captured || p.isCustomized)).toBe(false)
		expect(dex.state.boxes.every((box) => box.settings.wallpaper === '01-forest')).toBe(true)
		expect(storedDex(gen1Filled).meta.totalCaught).toBe(0)
	})
})

describe('switching, creating and deleting', () => {
	it('switches the active dex and persists the selection', async () => {
		const ids = seedV1LocalStorage()
		const { pkState, appState } = await loadState()

		pkState.switchPokedex(pkState.loadPokedex(ids.gen3))

		expect(pkState.getPokedex().config.displayName).toBe('Hoenn Formen')
		expect(appState.getSelectedPokedexId()).toBe(ids.gen3)
		expect(localStorage.getItem('selectedDex')).toBe(ids.gen3)
	})

	it('creates a new dex from a config', async () => {
		seedV1LocalStorage()
		const { pkState } = await loadState()
		const { getDexConfig } = await import('../data/pokedex-config-utils.ts')

		const created = pkState.initPokedex({
			...getDexConfig('generation-2', ['normal']),
			displayName: 'Johto'
		})

		expect(created.config.displayName).toBe('Johto')
		expect(pkState.getPokedexIndexList()).toHaveLength(5)
	})

	it('falls back to the system default when the active dex is deleted', async () => {
		const ids = seedV1LocalStorage()
		const { pkState } = await loadState()

		pkState.deletePokedex(ids.gen1Filled)

		expect(pkState.getPokedex().id).toBe(ids.national)
		expect(localStorage.getItem('selectedDex')).toBe(ids.national)
		expect(localStorage.getItem(`dex:${ids.gen1Filled}`)).toBeNull()
		expect(pkState.getPokedexIndexList()).toHaveLength(3)
	})

	it('throws when a dex is missing', async () => {
		const { pkState } = await loadState()

		expect(() => pkState.loadPokedex('missing')).toThrow('not found in storage')
	})
})

describe('box settings', () => {
	it('updates the wallpaper in memory and in storage', async () => {
		const { gen1Filled } = seedV1LocalStorage()
		const { pkState } = await loadState()

		pkState.updateBoxSettings('box-001', { wallpaper: '09-beach' })

		expect(pkState.getCurrentPokedexState().boxes[0].settings.wallpaper).toBe('09-beach')
		expect(storedDex(gen1Filled).state.boxes[0].settings.wallpaper).toBe('09-beach')
	})
})

describe('v1 fixture sanity', () => {
	it('loads the legacy national dex without originalTrainer fields', async () => {
		const legacy = loadV1Dex('national-all-tags-legacy')
		localStorage.setItem(`dex:${legacy.id}`, JSON.stringify(legacy))
		const { pkState } = await loadState()

		const charizard = pkState.getPokemon('0006-charizard-gigantamax')
		expect(charizard).toMatchObject({ captured: true, ball: '02-great-ball', caughtIn: 'Sword' })
		expect(charizard).not.toHaveProperty('originalTrainer')
	})
})
