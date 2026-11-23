import { describe, expect, it } from 'vitest'
import { looksLikeV1Save, parseV1Save } from './v1-save.ts'
import {
	V1_DEX_FIXTURES,
	loadV1Dex,
	readRealExports,
	readV1DexRaw
} from '../../../../tests/helpers/v1-fixtures.ts'

const realExports = readRealExports()

describe('parseV1Save', () => {
	it.each(V1_DEX_FIXTURES)('parses the v1 fixture %s', (name) => {
		const save = parseV1Save(readV1DexRaw(name))

		expect(save.id).toBe(loadV1Dex(name).id)
		expect(Object.keys(save.state.pokemon)).toEqual(Object.keys(loadV1Dex(name).state.pokemon))
	})

	describe.skipIf(realExports.length === 0)('real exports from /.testdata', () => {
		it.each(realExports)('parses $file', ({ raw }) => {
			expect(() => parseV1Save(raw)).not.toThrow()
		})
	})

	it('keeps the original trainer', () => {
		expect(parseV1Save(readV1DexRaw('gen1-filled')).state.pokemon['0025-pikachu']).toMatchObject({
			originalTrainer: 'Ash',
			comment: 'Nur möglich mit anderer OT.\nOT: Ash ✨ "Region": Alola'
		})
	})

	it('fills fields that older saves do not have', () => {
		const save = parseV1Save(readV1DexRaw('national-all-tags-legacy'))

		expect(save.state.pokemon['0001-bulbasaur'].originalTrainer).toBe('')
	})

	it('tolerates sparse entries and meta', () => {
		const dex = loadV1Dex('gen1-empty-all-tags') as unknown as {
			state: { pokemon: Record<string, unknown> }
			meta: Record<string, unknown>
		}
		dex.state.pokemon['0001-bulbasaur'] = { captured: true }
		dex.meta = {}

		const save = parseV1Save(dex)

		expect(save.state.pokemon['0001-bulbasaur']).toEqual({
			captured: true,
			shiny: false,
			ball: '01-poke-ball',
			caughtIn: '',
			ability: '',
			comment: '',
			originalTrainer: '',
			ribbons: [],
			marks: [],
			isCustomized: false
		})
		expect(save.meta).toEqual({ createdAt: 0, updatedAt: 0, isSystemDefault: false })
	})

	it('rejects invalid JSON', () => {
		expect(() => parseV1Save('{ nope')).toThrow('The v1 save does not contain valid JSON.')
	})

	it('rejects data without the required structure', () => {
		const dex = loadV1Dex('gen1-filled') as unknown as { state: Record<string, unknown> }
		dex.state.boxes = 'nope'

		expect(() => parseV1Save(dex)).toThrow(/Invalid v1 save:[\s\S]*state\.boxes/)
		expect(() => parseV1Save({})).toThrow('Invalid v1 save')
	})

	it('rejects unknown box tags', () => {
		const dex = loadV1Dex('gen1-filled') as unknown as { config: { tags: string[] } }
		dex.config.tags = ['normal', 'shiny']

		expect(() => parseV1Save(dex)).toThrow('Invalid v1 save')
	})
})

describe('looksLikeV1Save', () => {
	it('detects v1 saves', () => {
		expect(looksLikeV1Save(loadV1Dex('gen3-forms'))).toBe(true)
		expect(looksLikeV1Save({ format: 'pk-box-manager', version: 2 })).toBe(false)
		expect(looksLikeV1Save(null)).toBe(false)
		expect(looksLikeV1Save('dex')).toBe(false)
	})
})
