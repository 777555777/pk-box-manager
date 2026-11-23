import { afterEach, describe, expect, it, vi } from 'vitest'
import { formatTagName, initPokedex } from './init-dex-helper.ts'
import { getDexConfig } from './data/pokedex-config-utils.ts'
import { getIdentifier } from './spriteheet-helper.ts'

afterEach(() => {
	vi.useRealTimers()
})

describe('initPokedex', () => {
	it('uses a deterministic id for the system default', () => {
		const dex = initPokedex(getDexConfig('national', ['normal', 'forms']), true)

		expect(dex.id).toBe('preset-national-normal-forms')
		expect(dex.meta.isSystemDefault).toBe(true)
	})

	it('appends the creation timestamp for all other dexes', () => {
		vi.useFakeTimers({ toFake: ['Date'], now: 1_700_000_000_000 })

		const dex = initPokedex(getDexConfig('generation-1', ['normal']))

		expect(dex.id).toBe('preset-generation-1-normal-1700000000000')
		expect(dex.meta.isSystemDefault).toBe(false)
	})

	it('creates positional box ids with the default wallpaper', () => {
		const dex = initPokedex(getDexConfig('generation-1', ['normal']))

		expect(dex.state.boxes.map((box) => box.id)).toEqual([
			'box-001',
			'box-002',
			'box-003',
			'box-004',
			'box-005',
			'box-006'
		])
		expect(new Set(dex.state.boxes.map((box) => box.settings.wallpaper))).toEqual(
			new Set(['01-forest'])
		)
	})

	it('creates one untouched entry per pokemon in box order', () => {
		const config = getDexConfig('generation-1', ['normal'])
		const dex = initPokedex(config)

		const expectedIds = config.pokemonOrder.flatMap((box) => box.pokemon.map(getIdentifier))
		expect(dex.state.boxes.flatMap((box) => box.pokemon)).toEqual(expectedIds)
		expect(Object.keys(dex.state.pokemon)).toEqual(expectedIds)
		expect(dex.state.pokemon['0025-pikachu']).toEqual({
			idEntry: { pokemonid: 'pikachu', formid: null, id_national: 25 },
			captured: false,
			ball: '01-poke-ball',
			shiny: false,
			caughtIn: '',
			ability: '',
			comment: '',
			ribbons: [],
			marks: [],
			isCustomized: false
			// note: v1 does not create `originalTrainer` for untouched entries
		})
	})

	it('stores the full config and empty meta', () => {
		const dex = initPokedex(getDexConfig('generation-1', ['normal']))

		expect(dex.config.pokemonOrder).toHaveLength(6)
		expect(dex.state.stateVersion).toBe('1.0.0')
		expect(dex.meta).toEqual({
			createdAt: 0,
			updatedAt: 0,
			totalPokemon: 0,
			totalCaught: 0,
			totalShiny: 0,
			isSystemDefault: false
		})
	})
})

describe('formatTagName', () => {
	it.each([
		['normal', 'Normal'],
		['forms', 'Forms'],
		['female', 'Female'],
		['gigantamax', 'G-Max']
	] as const)('%s → %s', (tag, label) => {
		expect(formatTagName(tag)).toBe(label)
	})
})
