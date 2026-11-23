import { describe, expect, it } from 'vitest'
import { createDexExport, EXPORT_FORMAT, exportFileName, parseDexImport } from './transfer.ts'
import { convertV1Save } from './v1/convert-v1.ts'
import { parseV1Save } from './v1/v1-save.ts'
import { createCatalog } from '../catalog/catalog.ts'
import { presetDefinitions } from '../catalog/presets.ts'
import pkStats from '../data/pk-stats.json' with { type: 'json' }
import pokedexBoxes from '../data/pokedex-boxes.json' with { type: 'json' }
import type { BoxTemplate } from '../catalog/types.ts'
import type { PokemonEntry } from '../models/data-models.ts'
import { readRealExports, readV1DexRaw } from '../../../tests/helpers/v1-fixtures.ts'
import { makeDex, makeEntry } from '../../../tests/helpers/dex-builders.ts'

const EXPORTED_AT = Date.UTC(2026, 10, 23, 12)

function sampleDex() {
	const dex = makeDex('dex-1', {
		name: 'Kanto Living',
		boxSettings: { 'kanto-2': { wallpaper: '07-snow' } },
		stats: { total: 151, caught: 2, shiny: 1 }
	})
	const entries = [
		makeEntry('dex-1', '0001-bulbasaur'),
		makeEntry('dex-1', '0025-pikachu', { shiny: true, originalTrainer: 'Ash', comment: 'Ü\n"✨"' })
	]
	return { dex, entries }
}

describe('createDexExport', () => {
	it('contains only user data', () => {
		const { dex, entries } = sampleDex()

		const file = createDexExport(dex, entries, EXPORTED_AT)

		expect(file).toMatchObject({ format: EXPORT_FORMAT, version: 2, exportedAt: EXPORTED_AT })
		expect(file.dex).not.toHaveProperty('stats')
		expect(file.entries[0]).not.toHaveProperty('dexId')
		expect(file.entries[1]).toMatchObject({ pokemonId: '0025-pikachu', originalTrainer: 'Ash' })
	})

	it('survives a round trip through JSON', () => {
		const { dex, entries } = sampleDex()

		const imported = parseDexImport(JSON.stringify(createDexExport(dex, entries, EXPORTED_AT)))

		expect(imported).toEqual({ dex, entries, source: 'v2' })
	})

	it('does not change its input', () => {
		const { dex, entries } = sampleDex()
		const file = createDexExport(dex, entries, EXPORTED_AT)
		file.entries[0].ribbons.push('x')

		expect(entries[0].ribbons).toEqual([])
		expect(dex.stats.caught).toBe(2)
	})
})

describe('exportFileName', () => {
	it('creates a readable file name', () => {
		expect(exportFileName({ name: 'Kanto Living' }, EXPORTED_AT)).toBe(
			'pk-box-manager-kanto-living-2026-11-23.json'
		)
		expect(exportFileName({ name: 'Pokédex Ü-Täst!' }, EXPORTED_AT)).toBe(
			'pk-box-manager-pokedex-u-tast-2026-11-23.json'
		)
		expect(exportFileName({ name: '✨✨' }, EXPORTED_AT)).toBe('pk-box-manager-dex-2026-11-23.json')
	})
})

describe('parseDexImport – v1 files', () => {
	it('converts v1 saves', () => {
		const raw = readV1DexRaw('gen1-filled')

		const imported = parseDexImport(raw)

		expect(imported.source).toBe('v1')
		expect({ dex: imported.dex, entries: imported.entries, report: imported.report }).toEqual(
			convertV1Save(parseV1Save(raw))
		)
	})

	const realExports = readRealExports()
	it.skipIf(realExports.length === 0)('converts the real v1 exports', () => {
		for (const { raw } of realExports) {
			const imported = parseDexImport(raw)
			expect(imported.dex.stats.caught).toBe(JSON.parse(raw).meta.totalCaught)
		}
	})
})

describe('parseDexImport – errors', () => {
	const valid = () => {
		const { dex, entries } = sampleDex()
		return createDexExport(dex, entries, EXPORTED_AT) as unknown as Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
	}

	it.each([
		['{ nope', 'The file does not contain valid JSON.'],
		['[]', 'This file is not a Box Manager export.'],
		['{"format":"other"}', 'This file is not a Box Manager export.'],
		[JSON.stringify({ ...valid(), version: 3 }), 'created by a newer version']
	])('rejects %s', (raw, message) => {
		expect(() => parseDexImport(raw)).toThrow(message)
	})

	it('rejects entries without original trainer', () => {
		const file = valid()
		delete file.entries[0].originalTrainer

		expect(() => parseDexImport(JSON.stringify(file))).toThrow(
			/The export file is invalid:[\s\S]*originalTrainer/
		)
	})

	it('rejects unknown presets and invalid custom layouts', () => {
		const unknownPreset = valid()
		unknownPreset.dex.layout.presetId = 'generation-99'
		expect(() => parseDexImport(JSON.stringify(unknownPreset))).toThrow(
			'unknown preset "generation-99"'
		)

		const badLayout = valid()
		badLayout.dex.layout = {
			kind: 'custom',
			boxes: [{ id: 'b', title: 'B', slots: ['0001-bulbasaur', '0001-bulbasaur'] }]
		}
		expect(() => parseDexImport(JSON.stringify(badLayout))).toThrow(
			'The dex layout is invalid: duplicate-pokemon (b, 0001-bulbasaur)'
		)
	})
})

describe('parseDexImport – catalog changes', () => {
	it('renames aliased pokemon and keeps the first duplicate', () => {
		const aliased = createCatalog({
			pokemon: pkStats as Record<string, { entry: PokemonEntry }>,
			boxes: pokedexBoxes as BoxTemplate[],
			presets: presetDefinitions,
			aliases: { '0001-old-bulbasaur': '0001-bulbasaur' }
		})
		const { dex } = sampleDex()
		const entries = [
			makeEntry('dex-1', '0001-old-bulbasaur', { comment: 'first' }),
			makeEntry('dex-1', '0001-bulbasaur', { comment: 'second' })
		]

		const imported = parseDexImport(
			JSON.stringify(createDexExport(dex, entries, EXPORTED_AT)),
			aliased
		)

		expect(imported.entries).toEqual([makeEntry('dex-1', '0001-bulbasaur', { comment: 'first' })])
		expect(imported.dex.stats).toEqual({ total: 151, caught: 1, shiny: 0 })
	})
})
