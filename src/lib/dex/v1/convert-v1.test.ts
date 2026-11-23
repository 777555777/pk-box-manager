import { describe, expect, it } from 'vitest'
import { safeParse } from 'valibot'
import { convertV1Save } from './convert-v1.ts'
import { parseV1Save } from './v1-save.ts'
import { catalog, createCatalog } from '../../catalog/catalog.ts'
import pkStats from '../../data/pk-stats.json' with { type: 'json' }
import pokedexBoxes from '../../data/pokedex-boxes.json' with { type: 'json' }
import { presetDefinitions } from '../../catalog/presets.ts'
import { DexEntrySchema, DexRecordSchema } from '../schemas.ts'
import type { BoxTemplate } from '../../catalog/types.ts'
import type { PokemonEntry } from '../../models/data-models.ts'
import {
	V1_DEX_FIXTURES,
	loadV1Dex,
	readRealExports,
	readV1DexRaw,
	type V1DexFixture
} from '../../../../tests/helpers/v1-fixtures.ts'

const realExports = readRealExports()

function convertFixture(name: V1DexFixture) {
	return convertV1Save(parseV1Save(readV1DexRaw(name)))
}

const EMPTY_REPORT = {
	layoutFallback: null,
	renamedEntries: [],
	duplicateEntries: [],
	orphanedEntries: [],
	unmatchedBoxes: []
}

describe('convertV1Save – fixtures', () => {
	it('converts a filled gen 1 dex', () => {
		const { dex, entries, report } = convertFixture('gen1-filled')
		const v1 = loadV1Dex('gen1-filled')

		expect(dex).toEqual({
			id: v1.id,
			name: 'Kanto Living',
			coverImage: 'gen-1.png',
			layout: { kind: 'preset', presetId: 'generation-1', tags: ['normal'] },
			boxSettings: { 'kanto-2': { wallpaper: '05-crag' } },
			isDefault: false,
			createdAt: v1.meta.createdAt,
			updatedAt: v1.meta.updatedAt,
			stats: { total: 151, caught: 8, shiny: 1 }
		})
		expect(report).toEqual(EMPTY_REPORT)

		// eevee was reset in v1 (not customized anymore) → no entry
		expect(entries.map((e) => e.pokemonId)).toEqual([
			'0001-bulbasaur',
			'0002-ivysaur',
			'0003-venusaur',
			'0004-charmander',
			'0005-charmeleon',
			'0006-charizard',
			'0025-pikachu',
			'0143-snorlax',
			'0150-mewtwo'
		])
	})

	it('keeps all user data of an entry, including the original trainer', () => {
		const { entries } = convertFixture('gen1-filled')
		const v1 = loadV1Dex('gen1-filled')

		expect(entries.find((e) => e.pokemonId === '0025-pikachu')).toEqual({
			dexId: v1.id,
			pokemonId: '0025-pikachu',
			captured: true,
			shiny: true,
			ball: '01-poke-ball',
			caughtIn: 'LetsGoPikachu',
			ability: 'static',
			comment: 'Nur möglich mit anderer OT.\nOT: Ash ✨ "Region": Alola',
			originalTrainer: 'Ash',
			ribbons: ['001-national-ribbon', '003-champion-ribbon'],
			marks: ['absent-minded-mark'],
			updatedAt: v1.meta.updatedAt
		})
	})

	it('keeps released pokemon that are still customized', () => {
		const mewtwo = convertFixture('gen1-filled').entries.find((e) => e.pokemonId === '0150-mewtwo')

		expect(mewtwo).toMatchObject({ captured: false })
	})

	it('converts the legacy national dex (system default, no OT fields)', () => {
		const { dex, entries, report } = convertFixture('national-all-tags-legacy')

		expect(dex.isDefault).toBe(true)
		expect(dex.layout).toEqual({
			kind: 'preset',
			presetId: 'national',
			tags: ['normal', 'female', 'forms', 'gigantamax']
		})
		// v1 box-010 is the tenth box of this dex: Johto 2
		expect(dex.boxSettings).toEqual({
			'kanto-2': { wallpaper: '02-city' },
			'johto-2': { wallpaper: '07-snow' }
		})
		expect(dex.stats).toEqual({ total: 1428, caught: 36, shiny: 0 })
		expect(entries).toHaveLength(36)
		expect(entries.every((e) => e.originalTrainer === '')).toBe(true)
		expect(entries.find((e) => e.pokemonId === '0006-charizard-gigantamax')).toMatchObject({
			ball: '02-great-ball',
			caughtIn: 'Sword',
			comment: 'Max-Raid in Schwert'
		})
		expect(report).toEqual(EMPTY_REPORT)
	})

	it('converts untouched dexes without entries', () => {
		const { dex, entries } = convertFixture('gen1-empty-all-tags')

		expect(entries).toEqual([])
		expect(dex.boxSettings).toEqual({})
		expect(dex.stats).toEqual({ total: 182, caught: 0, shiny: 0 })
		expect(dex.layout).toMatchObject({ tags: ['normal', 'female', 'forms'] })
	})

	it.each(V1_DEX_FIXTURES)('produces valid v2 data for %s', (name) => {
		const { dex, entries } = convertFixture(name)

		expect(safeParse(DexRecordSchema, dex).issues).toBeUndefined()
		for (const entry of entries) {
			expect(safeParse(DexEntrySchema, entry).issues).toBeUndefined()
		}
	})

	it('does not mutate its input', () => {
		const save = parseV1Save(readV1DexRaw('gen1-filled'))
		const before = structuredClone(save)

		const { entries } = convertV1Save(save)
		entries[0].ribbons.push('x')

		expect(save).toEqual(before)
	})
})

/** Checks that the v2 data shows the same boxes and user data as the v1 save. */
function expectSameDex(raw: string) {
	const v1 = parseV1Save(raw)
	const { dex, entries, report } = convertV1Save(v1)

	// same box titles and pokemon order as stored in v1
	const boxes = catalog.resolveLayout(dex.layout, dex.boxSettings)
	expect(boxes.map((box) => box.title)).toEqual(v1.state.boxes.map((box) => box.title))
	expect(boxes.flatMap((box) => box.slots)).toEqual(v1.state.boxes.flatMap((box) => box.pokemon))
	expect(boxes.map((box) => box.wallpaper)).toEqual(
		v1.state.boxes.map((box) => box.settings.wallpaper ?? '01-forest')
	)

	// every touched v1 pokemon has an entry with identical user data
	const byId = new Map(entries.map((entry) => [entry.pokemonId, entry]))
	for (const [id, pokemon] of Object.entries(v1.state.pokemon)) {
		const entry = byId.get(id)
		if (!pokemon.captured && !pokemon.isCustomized) {
			expect(entry, id).toBeUndefined()
			continue
		}
		const { isCustomized, ...data } = pokemon
		void isCustomized
		expect(entry, id).toMatchObject(data)
	}

	expect(report).toEqual(EMPTY_REPORT)
	return { v1, dex }
}

describe('convertV1Save – same dex as in v1', () => {
	it.each(V1_DEX_FIXTURES)('%s', (name) => {
		expectSameDex(readV1DexRaw(name))
	})

	describe.skipIf(realExports.length === 0)('real exports from /.testdata', () => {
		it.each(realExports)('$file', ({ raw }) => {
			const { v1, dex } = expectSameDex(raw)
			const original = JSON.parse(raw)

			expect(dex.stats).toEqual({
				total: original.meta.totalPokemon,
				caught: original.meta.totalCaught,
				shiny: original.meta.totalShiny
			})
			expect(dex.name).toBe(v1.config.displayName)
		})
	})
})

describe('convertV1Save – edge cases', () => {
	it('freezes the v1 order when the preset does not exist anymore', () => {
		const v1 = loadV1Dex('gen1-filled')
		v1.config.presetId = 'removed-preset'

		const { dex, report } = convertV1Save(parseV1Save(v1))

		expect(report.layoutFallback).toBe('unknown-preset')
		expect(dex.layout.kind).toBe('custom')
		expect(dex.boxSettings).toEqual({ 'box-002': { wallpaper: '05-crag' } })
		expect(dex.stats).toEqual({ total: 151, caught: 8, shiny: 1 })
		expect(catalog.resolveLayout(dex.layout).map((box) => box.id)).toEqual(
			v1.state.boxes.map((box) => box.id)
		)
	})

	it('keeps v1 custom dexes as custom layouts', () => {
		const v1 = loadV1Dex('gen1-filled')
		v1.config.type = 'custom'

		const { dex, report } = convertV1Save(parseV1Save(v1))

		expect(report.layoutFallback).toBe('custom-dex')
		expect(dex.layout.kind).toBe('custom')
	})

	it('reports wallpapers of boxes that do not exist anymore', () => {
		const v1 = loadV1Dex('gen1-filled')
		v1.state.boxes[1].title = 'Kanto Zwei'

		const { dex, report } = convertV1Save(parseV1Save(v1))

		expect(dex.boxSettings).toEqual({})
		expect(report.unmatchedBoxes).toEqual(['Kanto Zwei'])
	})

	it('keeps entries of pokemon that are not part of the layout', () => {
		const v1 = loadV1Dex('gen1-filled')
		v1.state.pokemon['0252-treecko'] = { ...v1.state.pokemon['0001-bulbasaur'] }

		const { entries, dex, report } = convertV1Save(parseV1Save(v1))

		expect(entries.map((e) => e.pokemonId)).toContain('0252-treecko')
		expect(report.orphanedEntries).toEqual(['0252-treecko'])
		expect(dex.stats.caught).toBe(8)
	})

	it('renames entries of aliased pokemon and keeps only the first duplicate', () => {
		const aliased = createCatalog({
			pokemon: pkStats as Record<string, { entry: PokemonEntry }>,
			boxes: pokedexBoxes as BoxTemplate[],
			presets: presetDefinitions,
			aliases: { '0025-old-pikachu': '0025-pikachu', '0026-old-raichu': '0026-raichu' }
		})
		const v1 = loadV1Dex('gen1-filled')
		v1.state.pokemon['0026-old-raichu'] = { ...v1.state.pokemon['0001-bulbasaur'] }
		v1.state.pokemon['0025-old-pikachu'] = { ...v1.state.pokemon['0001-bulbasaur'] }

		const { entries, report } = convertV1Save(parseV1Save(v1), aliased)

		expect(report.renamedEntries).toEqual([
			{ from: '0026-old-raichu', to: '0026-raichu' },
			{ from: '0025-old-pikachu', to: '0025-pikachu' }
		])
		expect(report.duplicateEntries).toEqual(['0025-pikachu'])
		expect(entries.find((e) => e.pokemonId === '0025-pikachu')?.originalTrainer).toBe('Ash')
		expect(entries.find((e) => e.pokemonId === '0026-raichu')?.captured).toBe(true)
	})
})
