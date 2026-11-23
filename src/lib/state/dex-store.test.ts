import { describe, expect, it, vi } from 'vitest'
import { DexStore, NULL_POKEMON_ID, type DexStoreOptions } from './dex-store.svelte.ts'
import { createMemoryRepository } from '../storage/memory-repository.ts'
import { migrateFromV1 } from '../storage/migrate-v1.ts'
import type { DexRepository } from '../storage/repository.ts'
import { catalog } from '../catalog/catalog.ts'
import { computeStats } from '../dex/stats.ts'
import { parseDexImport } from '../dex/transfer.ts'
import type { EntryData } from '../dex/types.ts'
import { readRealExports, seedV1LocalStorage } from '../../../tests/helpers/v1-fixtures.ts'
import { makeDex, makeEntry } from '../../../tests/helpers/dex-builders.ts'

interface SetupOptions {
	/** Start with the migrated v1 fixture session (4 dexes, gen1Filled active). */
	v1Session?: boolean
	remembered?: string | null
	defaults?: Partial<EntryData>
	repository?: DexRepository
	options?: DexStoreOptions
}

async function setup({
	v1Session = true,
	remembered,
	defaults = {},
	repository = createMemoryRepository(),
	options = {}
}: SetupOptions = {}) {
	let ids = { national: '', gen1Empty: '', gen1Filled: '', gen3: '' }
	if (v1Session) {
		ids = seedV1LocalStorage()
		await migrateFromV1(repository)
	}
	let selected: string | null = remembered === undefined ? ids.gen1Filled || null : remembered
	let time = 2_000_000_000_000
	let counter = 0

	const store = new DexStore({
		now: () => ++time,
		createId: () => `new-${++counter}`,
		getAppDefaults: () => defaults,
		selection: { load: () => selected, save: (id) => (selected = id) },
		onPersistError: () => {},
		...options
	})
	await store.init(repository)
	return { store, repository, ids, selection: () => selected }
}

describe('init', () => {
	it('creates the default national dex on first start', async () => {
		const { store, repository, selection } = await setup({ v1Session: false })

		expect(store.dexes).toHaveLength(1)
		expect(store.active).toMatchObject({
			id: 'new-1',
			name: 'National Dex',
			isDefault: true,
			layout: { kind: 'preset', presetId: 'national', tags: catalog.allTags() },
			stats: { total: 1428, caught: 0, shiny: 0 }
		})
		expect(store.boxes).toHaveLength(65)
		expect(await repository.listDexes()).toEqual([store.active])
		expect(selection()).toBe('new-1')
	})

	it('activates the remembered dex of a migrated v1 session', async () => {
		const { store, ids } = await setup()

		expect(store.activeId).toBe(ids.gen1Filled)
		expect(store.dexes.map((dex) => dex.id)[0]).toBe(ids.national) // default first
		expect(store.boxes.map((box) => box.id)).toEqual([
			'kanto-1',
			'kanto-2',
			'kanto-3',
			'kanto-4',
			'kanto-5',
			'kanto-6'
		])
		expect(store.boxes[1].wallpaper).toBe('05-crag')
	})

	it('falls back to the default dex when the remembered one is gone', async () => {
		const { store, ids } = await setup({ remembered: 'deleted-dex' })

		expect(store.activeId).toBe(ids.national)
	})

	it('corrects stale counters when the catalog changed since the last save', async () => {
		const repository = createMemoryRepository()
		await repository.write({
			putDexes: [makeDex('d', { isDefault: true, stats: { total: 140, caught: 5, shiny: 3 } })],
			putEntries: [makeEntry('d', '0001-bulbasaur')]
		})

		const { store } = await setup({ v1Session: false, repository, remembered: 'd' })
		await store.flush()

		expect(store.active?.stats).toEqual({ total: 151, caught: 1, shiny: 0 })
		expect((await repository.getDex('d'))?.stats).toEqual({ total: 151, caught: 1, shiny: 0 })
	})
})

describe('reading pokemon', () => {
	it('returns the stored data including the original trainer', async () => {
		const { store } = await setup()

		expect(store.getPokemon('0025-pikachu')).toMatchObject({
			pokemonId: '0025-pikachu',
			idEntry: { pokemonid: 'pikachu', formid: null, id_national: 25 },
			hasEntry: true,
			shiny: true,
			originalTrainer: 'Ash',
			ribbons: ['001-national-ribbon', '003-champion-ribbon']
		})
	})

	it('returns empty data for untouched pokemon', async () => {
		const { store } = await setup()

		expect(store.getPokemon('0007-squirtle')).toEqual({
			pokemonId: '0007-squirtle',
			idEntry: { pokemonid: 'squirtle', formid: null, id_national: 7 },
			hasEntry: false,
			captured: false,
			shiny: false,
			ball: '01-poke-ball',
			caughtIn: '',
			ability: '',
			comment: '',
			originalTrainer: '',
			ribbons: [],
			marks: []
		})
	})

	it('selects and deselects pokemon of the active dex', async () => {
		const { store } = await setup()
		expect(store.selected.pokemonId).toBe(NULL_POKEMON_ID)

		store.select('0025-pikachu')
		expect(store.selected.originalTrainer).toBe('Ash')

		store.deselect()
		expect(store.selectedId).toBeNull()
		expect(() => store.select('0252-treecko')).toThrow('not part of the active dex')
	})
})

describe('updatePokemon', () => {
	it('applies the app defaults on the first edit', async () => {
		const { store } = await setup({ defaults: { ball: '02-great-ball', caughtIn: 'Sword' } })

		store.updatePokemon('0007-squirtle', { captured: true })

		expect(store.getPokemon('0007-squirtle')).toMatchObject({
			hasEntry: true,
			captured: true,
			ball: '02-great-ball',
			caughtIn: 'Sword'
		})
	})

	it('does not apply the defaults again', async () => {
		const { store } = await setup({ defaults: { ball: '02-great-ball' } })

		store.updatePokemon('0004-charmander', { shiny: true })

		expect(store.getPokemon('0004-charmander')).toMatchObject({
			ball: '03-ultra-ball',
			shiny: true
		})
	})

	it('captures implicitly when another field is edited', async () => {
		const { store } = await setup()

		store.updatePokemon('0007-squirtle', { comment: 'Notiz' })

		expect(store.getPokemon('0007-squirtle')).toMatchObject({ captured: true, comment: 'Notiz' })
	})

	it('can release a pokemon without losing its data', async () => {
		const { store } = await setup()

		store.updatePokemon('0004-charmander', { captured: false })

		expect(store.getPokemon('0004-charmander')).toMatchObject({
			captured: false,
			hasEntry: true,
			ball: '03-ultra-ball'
		})
	})

	it('ignores unknown fields', async () => {
		const { store } = await setup()

		store.updatePokemon('0007-squirtle', { comment: 'x', dexId: 'other', hacked: 1 } as never)
		const { entries } = await store.getDexData(store.activeId)

		expect(entries.find((e) => e.pokemonId === '0007-squirtle')).not.toHaveProperty('hacked')
		expect(entries.find((e) => e.pokemonId === '0007-squirtle')?.dexId).toBe(store.activeId)
	})

	it('rejects pokemon outside the active dex', async () => {
		const { store } = await setup()

		expect(() => store.updatePokemon('0252-treecko', { captured: true })).toThrow(
			'not part of the active dex'
		)
	})

	it('keeps the counters up to date', async () => {
		const { store } = await setup()
		expect(store.active?.stats).toEqual({ total: 151, caught: 8, shiny: 1 })

		store.updatePokemon('0007-squirtle', { captured: true })
		store.updatePokemon('0008-wartortle', { shiny: true })
		store.updatePokemon('0025-pikachu', { captured: false })
		store.resetPokemon('0001-bulbasaur')

		const { entries } = await store.getDexData(store.activeId)
		const expected = computeStats(catalog.listPokemonIds(store.active!.layout), entries)
		expect(store.active?.stats).toEqual(expected)
		expect(expected).toEqual({ total: 151, caught: 8, shiny: 1 })
	})

	it('toggles ribbons and marks', async () => {
		const { store } = await setup()

		store.toggleRibbon('0025-pikachu', '002-earth-ribbon')
		store.toggleRibbon('0025-pikachu', '001-national-ribbon')
		store.toggleMark('0025-pikachu', 'absent-minded-mark')

		expect(store.getPokemon('0025-pikachu')).toMatchObject({
			ribbons: ['003-champion-ribbon', '002-earth-ribbon'],
			marks: []
		})
	})

	it('resets a pokemon to untouched', async () => {
		const { store } = await setup()

		store.resetPokemon('0025-pikachu')

		expect(store.getPokemon('0025-pikachu')).toMatchObject({ hasEntry: false, captured: false })
	})
})

describe('persistence', () => {
	it('writes all changes of one tick in a single batch', async () => {
		const { store, repository } = await setup()
		const write = vi.spyOn(repository, 'write')

		store.updatePokemon('0007-squirtle', { captured: true })
		store.updatePokemon('0008-wartortle', { captured: true })
		store.resetPokemon('0025-pikachu')
		await store.flush()

		expect(write).toHaveBeenCalledTimes(1)
		const [batch] = write.mock.calls[0]
		expect(batch.putEntries?.map((e) => e.pokemonId)).toEqual(['0007-squirtle', '0008-wartortle'])
		expect(batch.deleteEntries).toEqual([{ dexId: store.activeId, pokemonIds: ['0025-pikachu'] }])
		expect(batch.putDexes).toHaveLength(1)
	})

	it('stores exactly what is in memory', async () => {
		const { store, repository } = await setup()

		store.updatePokemon('0007-squirtle', { comment: 'Ü ✨', ribbons: ['r'] })
		store.resetPokemon('0001-bulbasaur')
		store.updateBoxWallpaper('kanto-3', '07-snow')
		await store.flush()

		const { dex, entries } = await store.getDexData(store.activeId)
		expect(await repository.getDex(dex.id)).toEqual(dex)
		expect(await repository.getEntries(dex.id)).toEqual(entries)
	})

	it('writes changes before switching the dex', async () => {
		const { store, repository, ids } = await setup()

		store.updatePokemon('0007-squirtle', { captured: true })
		await store.switchDex(ids.gen3)

		const stored = await repository.getEntries(ids.gen1Filled)
		expect(stored.some((e) => e.pokemonId === '0007-squirtle')).toBe(true)
		expect(store.boxes).toHaveLength(18)
	})

	it('reports failed writes', async () => {
		const onPersistError = vi.fn()
		const { store, repository } = await setup({ options: { onPersistError } })
		vi.spyOn(repository, 'write').mockRejectedValueOnce(new Error('QuotaExceededError'))

		store.updatePokemon('0007-squirtle', { captured: true })
		await store.flush()

		expect(store.persistError).toEqual(new Error('QuotaExceededError'))
		expect(onPersistError).toHaveBeenCalledTimes(1)
	})
})

describe('boxes and names', () => {
	it('stores only wallpapers that differ from the default', async () => {
		const { store } = await setup()

		store.updateBoxWallpaper('kanto-1', '09-beach')
		store.updateBoxWallpaper('kanto-2', '01-forest')

		expect(store.active?.boxSettings).toEqual({ 'kanto-1': { wallpaper: '09-beach' } })
		expect(store.boxes[0].wallpaper).toBe('09-beach')
		expect(store.boxes[1].wallpaper).toBe('01-forest')
	})

	it('renames dexes and ignores empty names', async () => {
		const { store, ids } = await setup()

		store.renameDex(ids.gen3, '  Hoenn  ')
		store.renameDex(ids.gen3, '   ')

		expect(store.dexes.find((dex) => dex.id === ids.gen3)?.name).toBe('Hoenn')
	})
})

describe('dex management', () => {
	it('creates and activates a new preset dex', async () => {
		const { store, repository } = await setup()

		const id = await store.createDex({ presetId: 'generation-2', tags: ['normal'], name: 'Johto' })

		expect(id).toBe('new-1')
		expect(store.activeId).toBe('new-1')
		expect(store.active).toMatchObject({ name: 'Johto', coverImage: 'gen-2.png', isDefault: false })
		expect(store.active?.stats.total).toBe(catalog.listPokemonIds(store.active!.layout).length)
		expect(store.dexes.at(-1)?.id).toBe('new-1')
		expect(await repository.getDex('new-1')).toEqual(store.active)
	})

	it('resets a dex completely', async () => {
		const { store, repository, ids } = await setup()
		store.select('0025-pikachu')

		await store.resetDex(ids.gen1Filled)

		expect(store.getPokemon('0025-pikachu').hasEntry).toBe(false)
		expect(store.selectedId).toBeNull()
		expect(store.active).toMatchObject({
			boxSettings: {},
			stats: { total: 151, caught: 0, shiny: 0 }
		})
		expect(await repository.getEntries(ids.gen1Filled)).toEqual([])
	})

	it('deletes a dex and falls back to the default', async () => {
		const { store, repository, ids } = await setup()

		await store.deleteDex(ids.gen1Filled)

		expect(store.activeId).toBe(ids.national)
		expect(store.hasDex(ids.gen1Filled)).toBe(false)
		expect(await repository.getDex(ids.gen1Filled)).toBeUndefined()
		expect(await repository.getEntries(ids.gen1Filled)).toEqual([])
	})

	it('never deletes the default dex', async () => {
		const { store, ids } = await setup()

		await expect(store.deleteDex(ids.national)).rejects.toThrow('cannot be deleted')
	})

	it('reads other dexes from storage', async () => {
		const { store, ids } = await setup()

		const { dex, entries } = await store.getDexData(ids.national)

		expect(dex.stats.caught).toBe(36)
		expect(entries).toHaveLength(36)
	})
})

describe('importDex', () => {
	it('adds an imported dex and activates it', async () => {
		const { store } = await setup()
		const data = {
			dex: makeDex('imported', { isDefault: true }),
			entries: [makeEntry('x', '0001-bulbasaur')]
		}

		await store.importDex(data)

		expect(store.activeId).toBe('imported')
		expect(store.active?.isDefault).toBe(false) // there is already a default dex
		expect(store.getPokemon('0001-bulbasaur').captured).toBe(true)
	})

	it('replaces an existing dex completely and keeps its default flag', async () => {
		const { store, repository, ids } = await setup()
		const data = {
			dex: makeDex(ids.national, { isDefault: false, name: 'Imported' }),
			entries: [makeEntry(ids.national, '0001-bulbasaur')]
		}

		await store.importDex(data)

		expect(store.active).toMatchObject({ id: ids.national, name: 'Imported', isDefault: true })
		expect((await repository.getEntries(ids.national)).map((e) => e.pokemonId)).toEqual([
			'0001-bulbasaur'
		])
		expect(store.dexes).toHaveLength(4)
	})

	const realExports = readRealExports()
	it.skipIf(realExports.length === 0)('imports the real exports', async () => {
		const { store } = await setup({ v1Session: false })

		for (const { raw } of realExports) {
			const imported = parseDexImport(raw)
			await store.importDex(imported)

			expect(store.active?.stats.caught).toBe(JSON.parse(raw).meta.totalCaught)
		}
		expect(store.dexes).toHaveLength(1 + realExports.length)
	})
})

describe('onUserChange', () => {
	it('is not called while loading, switching or correcting counters', async () => {
		const onUserChange = vi.fn()
		const repository = createMemoryRepository()
		await repository.write({
			putDexes: [makeDex('d', { isDefault: true, stats: { total: 1, caught: 0, shiny: 0 } })]
		})

		const { store, ids } = await setup({ repository, remembered: 'd', options: { onUserChange } })
		expect(store.active?.stats.total).toBe(151) // counters were corrected on activation
		await store.switchDex(ids.gen3)
		await store.flush()

		expect(onUserChange).not.toHaveBeenCalled()
	})

	it('is called synchronously for every change made by the user', async () => {
		const onUserChange = vi.fn()
		const { store, ids } = await setup({ options: { onUserChange } })

		store.updatePokemon('0007-squirtle', { captured: true })
		expect(onUserChange).toHaveBeenCalledTimes(1) // still inside the "click"

		store.toggleRibbon('0025-pikachu', '002-earth-ribbon')
		store.resetPokemon('0001-bulbasaur')
		store.updateBoxWallpaper('kanto-1', '09-beach')
		store.renameDex(ids.gen3, 'Hoenn')
		expect(onUserChange).toHaveBeenCalledTimes(5)

		const created = store.createDex({ presetId: 'generation-2', tags: ['normal'], name: 'J' })
		expect(onUserChange).toHaveBeenCalledTimes(6) // before the first await
		const id = await created

		await store.resetDex(ids.gen3)
		await store.deleteDex(id)
		await store.importDex({ dex: makeDex('imported'), entries: [] })
		expect(onUserChange).toHaveBeenCalledTimes(9)
	})
})
