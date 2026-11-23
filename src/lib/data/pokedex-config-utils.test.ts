import { describe, expect, it } from 'vitest'
import pokedexBoxes from './pokedex-boxes.json' with { type: 'json' }
import { dexPresets } from './pokedex.ts'
import {
	getAllPossibleTags,
	getAvailableTagsForPreset,
	getDexConfig
} from './pokedex-config-utils.ts'
import { getIdentifier } from '../spriteheet-helper.ts'
import type { BoxTags, DexConfig } from '../models/data-models.ts'
import { loadV1PresetResolution } from '../../../tests/helpers/v1-fixtures.ts'

function countPokemon(config: DexConfig) {
	return config.pokemonOrder.reduce((sum, box) => sum + box.pokemon.length, 0)
}

function boxTitles(config: DexConfig) {
	return config.pokemonOrder.map((box) => box.title)
}

describe('getAllPossibleTags', () => {
	it('collects every tag used in pokedex-boxes.json', () => {
		expect(getAllPossibleTags().sort()).toEqual(['female', 'forms', 'gigantamax', 'normal'])
	})
})

describe('getDexConfig', () => {
	it('builds the national dex with base forms only', () => {
		const config = getDexConfig('national', ['normal'])

		expect(countPokemon(config)).toBe(1025)
		expect(config.tags).toEqual(['normal'])
		// every box contains only base-form boxes
		const normalTitles = pokedexBoxes.filter((b) => b.tags.includes('normal')).map((b) => b.title)
		expect(boxTitles(config).every((title) => normalTitles.includes(title))).toBe(true)
	})

	it('builds the national dex with all variants (system default on first start)', () => {
		const config = getDexConfig('national', getAllPossibleTags())

		expect(countPokemon(config)).toBe(1428)
		expect(config.pokemonOrder).toHaveLength(65)
	})

	it.each([
		['generation-1', ['normal'], 151, 6],
		['generation-1', ['normal', 'female', 'forms'], 182, 8],
		['generation-3', ['normal', 'forms'], 424, 18]
	] as const)('builds %s with tags %j', (presetId, tags, pokemonCount, boxCount) => {
		const config = getDexConfig(presetId, [...tags] as BoxTags[])

		expect(countPokemon(config)).toBe(pokemonCount)
		expect(config.pokemonOrder).toHaveLength(boxCount)
		expect(config.presetId).toBe(presetId)
	})

	it('keeps the box order of the preset', () => {
		const config = getDexConfig('generation-1', ['normal', 'female', 'forms'])

		expect(boxTitles(config)).toEqual([
			'Kanto 1',
			'Kanto 2',
			'Kanto 3',
			'Kanto 4',
			'Kanto 5',
			'Kanto 6',
			'Kanto Females',
			'Cap Pikachu'
		])
		expect(getIdentifier(config.pokemonOrder[0].pokemon[0])).toBe('0001-bulbasaur')
	})

	it('excludes variant boxes unless their tag is selected', () => {
		const config = getDexConfig('national', ['normal', 'forms'])
		const titles = boxTitles(config)

		expect(titles).toContain('Cap Pikachu')
		expect(titles).not.toContain('Kanto Females')
		expect(titles.some((title) => title.toLowerCase().includes('gigantamax'))).toBe(false)
	})

	it('falls back to the national dex for unknown preset ids', () => {
		// pkState relies on this: it parses "preset-national-…" into the preset id "preset-national"
		const config = getDexConfig('preset-national', ['normal'])

		expect(config.presetId).toBe('national')
	})

	// Was a v1 bug until the catalog module: the shared preset objects were mutated and returned.
	it('returns independent configs that do not mutate the presets', () => {
		const baseOnly = getDexConfig('generation-1', ['normal'])
		const withForms = getDexConfig('generation-1', ['normal', 'forms'])
		withForms.boxList.push('paldea-1')

		expect(baseOnly).not.toBe(withForms)
		expect(baseOnly.tags).toEqual(['normal'])
		expect(dexPresets.gen1Dex.tags).toEqual(['normal'])
		expect(dexPresets.gen1Dex.pokemonOrder).toEqual([])
		expect(dexPresets.gen1Dex.boxList).toHaveLength(8)
	})

	it.each(Object.entries(loadV1PresetResolution().resolutions))(
		'resolves %s exactly like v1',
		(key, expected) => {
			const [presetId, tagList] = key.split('|')
			const config = getDexConfig(presetId, (tagList ? tagList.split(',') : []) as BoxTags[])
			const ids = config.pokemonOrder.flatMap((box) => box.pokemon.map(getIdentifier))

			expect(boxTitles(config)).toEqual(expected.boxes)
			expect(ids).toHaveLength(expected.count)
			if (expected.count > 0) expect([ids[0], ids.at(-1)]).toEqual(expected.firstAndLast)
		}
	)
})

describe('v1 presets', () => {
	it.each(loadV1PresetResolution().presets)('keeps preset $presetId unchanged', (v1Preset) => {
		const preset = Object.values(dexPresets).find((p) => p.presetId === v1Preset.presetId)

		expect(preset).toMatchObject({
			displayName: v1Preset.displayName,
			coverImage: v1Preset.coverImage,
			sortOrder: v1Preset.sortOrder,
			boxList: v1Preset.boxList
		})
	})
})

describe('getAvailableTagsForPreset', () => {
	it('returns the tags of all boxes in the preset', () => {
		expect(getAvailableTagsForPreset('generation-1').sort()).toEqual(['female', 'forms', 'normal'])
		expect(getAvailableTagsForPreset('national').sort()).toEqual(getAllPossibleTags().sort())
	})

	it('returns an empty list for unknown presets', () => {
		expect(getAvailableTagsForPreset('does-not-exist')).toEqual([])
	})
})
