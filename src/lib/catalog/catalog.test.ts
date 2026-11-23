import { describe, expect, it } from 'vitest'
import {
	BOX_SIZE,
	DEFAULT_WALLPAPER,
	catalog,
	createCatalog,
	type CatalogSources
} from './catalog.ts'
import { presetDefinitions } from './presets.ts'
import pokedexBoxes from '../data/pokedex-boxes.json' with { type: 'json' }
import pkStats from '../data/pk-stats.json' with { type: 'json' }
import pokemonAliases from '../data/pokemon-aliases.json' with { type: 'json' }
import { combinedPokemon } from '../spriteheet-helper.ts'
import type { BoxTag, BoxTemplate, CustomLayout, PresetLayout } from './types.ts'
import { loadV1PresetResolution } from '../../../tests/helpers/v1-fixtures.ts'

const v1 = loadV1PresetResolution()

function preset(presetId: string, tags: BoxTag[]): PresetLayout {
	return { kind: 'preset', presetId, tags }
}

describe('parity with v1', () => {
	it.each(Object.entries(v1.resolutions))('resolves %s like v1', (key, expected) => {
		const [presetId, tagList] = key.split('|')
		const tags = (tagList ? tagList.split(',') : []) as BoxTag[]

		const boxes = catalog.resolveLayout(preset(presetId, tags))
		const ids = boxes.flatMap((box) => box.slots)

		expect(boxes.map((box) => box.title)).toEqual(expected.boxes)
		expect(ids).toHaveLength(expected.count)
		if (expected.count > 0) expect([ids[0], ids.at(-1)]).toEqual(expected.firstAndLast)
	})

	it('knows the same tags in the same order', () => {
		expect(catalog.allTags()).toEqual(v1.allTags)
	})

	it.each(v1.presets)('defines preset $presetId like v1', (v1Preset) => {
		expect(catalog.getPreset(v1Preset.presetId)).toEqual({
			id: v1Preset.presetId,
			name: v1Preset.displayName,
			coverImage: v1Preset.coverImage,
			boxes: v1Preset.boxList
		})
		expect(catalog.getAvailableTags(v1Preset.presetId)).toEqual(v1Preset.availableTags)
	})

	it('lists the presets in the v1 sort order', () => {
		expect(catalog.listPresets().map((p) => p.id)).toEqual(v1.presets.map((p) => p.presetId))
	})
})

describe('catalog integrity', () => {
	const boxes = pokedexBoxes as BoxTemplate[]

	it('references only existing boxes in presets', () => {
		for (const definition of presetDefinitions) {
			for (const boxId of definition.boxes) {
				expect(catalog.getBox(boxId), `${definition.id} → ${boxId}`).toBeDefined()
			}
		}
	})

	it('uses unique box ids and titles', () => {
		expect(new Set(boxes.map((box) => box.id)).size).toBe(boxes.length)
		expect(new Set(boxes.map((box) => box.title)).size).toBe(boxes.length)
	})

	it('fits every box into the box size', () => {
		const tooLarge = boxes.filter((box) => box.pokemon.length > BOX_SIZE).map((box) => box.id)
		expect(tooLarge).toEqual([])
	})

	it('lists every pokemon in exactly one box', () => {
		const ids = boxes.flatMap((box) => box.pokemon)
		const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index)
		expect(duplicates).toEqual([])
	})

	it('has stats and a sprite for every pokemon in a box', () => {
		const ids = boxes.flatMap((box) => box.pokemon)
		expect(ids.filter((id) => !(id in pkStats))).toEqual([])
		expect(ids.filter((id) => !(id in combinedPokemon))).toEqual([])
	})

	it('has stable aliases that point to existing pokemon', () => {
		for (const oldId of Object.keys(pokemonAliases)) {
			expect(catalog.hasPokemon(oldId), `${oldId} must not exist anymore`).toBe(false)
			expect(catalog.hasPokemon(catalog.resolvePokemonId(oldId)), oldId).toBe(true)
		}
	})
})

describe('resolveLayout', () => {
	it('uses the box template ids as stable box ids', () => {
		const boxes = catalog.resolveLayout(preset('generation-1', ['normal', 'forms']))

		expect(boxes.map((box) => box.id)).toEqual([
			'kanto-1',
			'kanto-2',
			'kanto-3',
			'kanto-4',
			'kanto-5',
			'kanto-6',
			'cap-pikachu'
		])
	})

	it('applies wallpapers from the box settings and defaults the rest', () => {
		const boxes = catalog.resolveLayout(preset('generation-1', ['normal']), {
			'kanto-2': { wallpaper: '07-snow' },
			'kanto-3': {},
			'not-in-dex': { wallpaper: '02-city' }
		})

		expect(boxes.map((box) => box.wallpaper)).toEqual([
			DEFAULT_WALLPAPER,
			'07-snow',
			DEFAULT_WALLPAPER,
			DEFAULT_WALLPAPER,
			DEFAULT_WALLPAPER,
			DEFAULT_WALLPAPER
		])
	})

	it('throws for unknown presets', () => {
		expect(() => catalog.resolveLayout(preset('generation-99', ['normal']))).toThrow(
			'Unknown preset "generation-99"'
		)
	})

	it('resolves custom layouts with empty slots', () => {
		const layout: CustomLayout = {
			kind: 'custom',
			boxes: [
				{ id: 'starter', title: 'Starter', slots: ['0001-bulbasaur', null, '0004-charmander'] },
				{ id: 'empty', title: 'Leer', slots: [] }
			]
		}

		expect(catalog.resolveLayout(layout, { empty: { wallpaper: '09-beach' } })).toEqual([
			{
				id: 'starter',
				title: 'Starter',
				wallpaper: DEFAULT_WALLPAPER,
				slots: ['0001-bulbasaur', null, '0004-charmander']
			},
			{ id: 'empty', title: 'Leer', wallpaper: '09-beach', slots: [] }
		])
	})

	it('returns fresh copies on every call', () => {
		const layout = preset('generation-1', ['normal'])
		const first = catalog.resolveLayout(layout)
		first[0].slots.length = 0
		first[0].title = 'changed'

		const second = catalog.resolveLayout(layout)
		expect(second[0].title).toBe('Kanto 1')
		expect(second[0].slots).toHaveLength(BOX_SIZE)
		expect(layout.tags).toEqual(['normal'])
	})

	it('lists all pokemon ids of a layout', () => {
		const ids = catalog.listPokemonIds(preset('national', catalog.allTags()))

		expect(ids).toHaveLength(1428)
		expect(new Set(ids).size).toBe(1428)
	})
})

describe('lookups', () => {
	it('returns pokemon entries as copies', () => {
		const entry = catalog.getPokemonEntry('0025-pikachu-cap-alola')!
		expect(entry).toEqual({ pokemonid: 'pikachu', formid: 'cap-alola', id_national: 25 })

		entry.pokemonid = 'raichu'
		expect(catalog.getPokemonEntry('0025-pikachu-cap-alola')!.pokemonid).toBe('pikachu')
		expect(catalog.getPokemonEntry('9999-missingno')).toBeUndefined()
	})

	it('protects presets and boxes against mutation', () => {
		catalog.getPreset('generation-1')!.boxes.push('paldea-1')
		catalog.getBox('kanto-1')!.pokemon.pop()

		expect(catalog.getPreset('generation-1')!.boxes).toHaveLength(8)
		expect(catalog.getBox('kanto-1')!.pokemon).toHaveLength(BOX_SIZE)
	})

	it('throws for available tags of unknown presets', () => {
		expect(() => catalog.getAvailableTags('nope')).toThrow('Unknown preset "nope"')
	})
})

// A small synthetic catalog to simulate future app updates.
function testSources(): CatalogSources {
	const entry = (id: number, name: string) => ({
		entry: { pokemonid: name, formid: null, id_national: id }
	})
	return {
		pokemon: {
			'0001-bulbasaur': entry(1, 'bulbasaur'),
			'0002-ivysaur': entry(2, 'ivysaur'),
			'0003-venusaur': entry(3, 'venusaur')
		},
		boxes: [
			{ id: 'kanto-1', title: 'Kanto 1', tags: ['normal'], pokemon: ['0001-bulbasaur'] },
			{ id: 'kanto-2', title: 'Kanto 2', tags: ['normal'], pokemon: ['0002-ivysaur'] }
		],
		presets: [
			{ id: 'national', name: 'National Dex', coverImage: 'n.png', boxes: ['kanto-1', 'kanto-2'] },
			{ id: 'generation-1', name: 'Gen 1', coverImage: 'g.png', boxes: ['kanto-1'] }
		]
	}
}

describe('future app updates', () => {
	it('lets preset dexes grow when a new game adds boxes', () => {
		const before = createCatalog(testSources())
		const sources = testSources()
		sources.pokemon['1026-windmon'] = {
			entry: { pokemonid: 'windmon', formid: null, id_national: 1026 }
		}
		sources.boxes.push({
			id: 'wind-1',
			title: 'Wind 1',
			tags: ['normal'],
			pokemon: ['1026-windmon']
		})
		sources.presets[0].boxes.push('wind-1')
		const after = createCatalog(sources)

		const national = preset('national', ['normal'])
		const gen1 = preset('generation-1', ['normal'])
		expect(after.resolveLayout(national).map((box) => box.id)).toEqual([
			...before.resolveLayout(national).map((box) => box.id),
			'wind-1'
		])
		expect(after.listPokemonIds(national)).toEqual([
			'0001-bulbasaur',
			'0002-ivysaur',
			'1026-windmon'
		])
		expect(after.resolveLayout(gen1)).toEqual(before.resolveLayout(gen1))
	})

	it('keeps custom layouts frozen when the catalog changes', () => {
		const custom = createCatalog(testSources()).toCustomLayout(preset('national', ['normal']))
		const sources = testSources()
		sources.boxes[0].pokemon.push('0003-venusaur')
		const updated = createCatalog(sources)

		expect(updated.resolveLayout(custom).map((box) => box.slots)).toEqual([
			['0001-bulbasaur'],
			['0002-ivysaur']
		])
		expect(updated.resolveLayout(preset('national', ['normal']))[0].slots).toEqual([
			'0001-bulbasaur',
			'0003-venusaur'
		])
	})

	it('follows alias chains for renamed pokemon', () => {
		const sources = testSources()
		sources.aliases = {
			'0003-old-venusaur': '0003-mid-venusaur',
			'0003-mid-venusaur': '0003-venusaur'
		}
		const aliased = createCatalog(sources)

		expect(aliased.resolvePokemonId('0003-old-venusaur')).toBe('0003-venusaur')
		expect(aliased.resolvePokemonId('0001-bulbasaur')).toBe('0001-bulbasaur')
		expect(aliased.resolvePokemonId('9999-unknown')).toBe('9999-unknown')

		const layout: CustomLayout = {
			kind: 'custom',
			boxes: [{ id: 'b', title: 'B', slots: ['0003-old-venusaur'] }]
		}
		expect(aliased.resolveLayout(layout)[0].slots).toEqual(['0003-venusaur'])
	})

	it('detects alias cycles', () => {
		const sources = testSources()
		sources.aliases = { a: 'b', b: 'a' }

		expect(() => createCatalog(sources).resolvePokemonId('a')).toThrow('Alias cycle detected')
	})
})

describe('custom layouts', () => {
	it('freezes a preset into an editable custom layout', () => {
		const layout = catalog.toCustomLayout(preset('generation-1', ['normal']))

		expect(layout.kind).toBe('custom')
		expect(layout.boxes.map((box) => box.id)).toEqual(
			catalog.resolveLayout(preset('generation-1', ['normal'])).map((box) => box.id)
		)
		expect(catalog.validateCustomLayout(layout)).toEqual([])
	})

	it('reports invalid custom layouts', () => {
		const layout: CustomLayout = {
			kind: 'custom',
			boxes: [
				{ id: 'a', title: 'A', slots: ['0001-bulbasaur', '9999-missingno'] },
				{ id: 'a', title: '  ', slots: ['0001-bulbasaur'] },
				{ id: 'big', title: 'Big', slots: Array(BOX_SIZE + 1).fill(null) }
			]
		}

		expect(catalog.validateCustomLayout(layout)).toEqual([
			{ code: 'unknown-pokemon', boxId: 'a', slot: 1, pokemonId: '9999-missingno' },
			{ code: 'duplicate-box-id', boxId: 'a' },
			{ code: 'empty-box-title', boxId: 'a' },
			{ code: 'duplicate-pokemon', boxId: 'a', slot: 0, pokemonId: '0001-bulbasaur' },
			{ code: 'box-too-large', boxId: 'big' }
		])
	})

	it('treats aliased ids as the same pokemon', () => {
		const sources = testSources()
		sources.aliases = { '0001-old-bulbasaur': '0001-bulbasaur' }
		const layout: CustomLayout = {
			kind: 'custom',
			boxes: [{ id: 'b', title: 'B', slots: ['0001-bulbasaur', '0001-old-bulbasaur'] }]
		}

		expect(createCatalog(sources).validateCustomLayout(layout)).toEqual([
			{ code: 'duplicate-pokemon', boxId: 'b', slot: 1, pokemonId: '0001-bulbasaur' }
		])
	})
})
