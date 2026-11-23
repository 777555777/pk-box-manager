import { describe, expect, it } from 'vitest'
import { safeParse } from 'valibot'
import { DexEntrySchema, DexLayoutSchema, DexRecordSchema } from './schemas.ts'
import { emptyEntryData, type DexEntry, type DexRecord } from './types.ts'
import { computeStats } from './stats.ts'

function validRecord(): DexRecord {
	return {
		id: 'dex-1',
		name: 'Kanto',
		coverImage: 'gen-1.png',
		layout: { kind: 'preset', presetId: 'generation-1', tags: ['normal'] },
		boxSettings: { 'kanto-1': { wallpaper: '07-snow' } },
		isDefault: false,
		createdAt: 1,
		updatedAt: 2,
		stats: { total: 151, caught: 0, shiny: 0 }
	}
}

function validEntry(): DexEntry {
	return { dexId: 'dex-1', pokemonId: '0001-bulbasaur', ...emptyEntryData(), updatedAt: 3 }
}

describe('DexRecordSchema', () => {
	it('accepts valid records', () => {
		expect(safeParse(DexRecordSchema, validRecord()).success).toBe(true)
	})

	it('rejects missing fields and negative counters', () => {
		const { stats, ...withoutStats } = validRecord()
		void stats
		expect(safeParse(DexRecordSchema, withoutStats).success).toBe(false)
		expect(
			safeParse(DexRecordSchema, { ...validRecord(), stats: { total: -1, caught: 0, shiny: 0 } })
				.success
		).toBe(false)
		expect(safeParse(DexRecordSchema, { ...validRecord(), id: '' }).success).toBe(false)
	})
})

describe('DexLayoutSchema', () => {
	it('accepts custom layouts with empty slots', () => {
		const layout = {
			kind: 'custom',
			boxes: [{ id: 'b1', title: 'Box', slots: ['0001-bulbasaur', null] }]
		}
		expect(safeParse(DexLayoutSchema, layout).success).toBe(true)
	})

	it('rejects unknown kinds, tags and oversized boxes', () => {
		expect(safeParse(DexLayoutSchema, { kind: 'other' }).success).toBe(false)
		expect(
			safeParse(DexLayoutSchema, { kind: 'preset', presetId: 'national', tags: ['shiny'] }).success
		).toBe(false)
		const tooLarge = {
			kind: 'custom',
			boxes: [{ id: 'b', title: 'B', slots: Array(31).fill(null) }]
		}
		expect(safeParse(DexLayoutSchema, tooLarge).success).toBe(false)
	})
})

describe('DexEntrySchema', () => {
	it('accepts valid entries and requires the original trainer', () => {
		expect(safeParse(DexEntrySchema, validEntry()).success).toBe(true)

		const { originalTrainer, ...withoutOt } = validEntry()
		void originalTrainer
		expect(safeParse(DexEntrySchema, withoutOt).success).toBe(false)
	})
})

describe('emptyEntryData', () => {
	it('returns a fresh object every time', () => {
		const first = emptyEntryData()
		first.ribbons.push('x')

		expect(emptyEntryData().ribbons).toEqual([])
	})
})

describe('computeStats', () => {
	it('counts caught and shiny pokemon of the layout only', () => {
		const entry = (pokemonId: string, captured: boolean, shiny: boolean) => ({
			pokemonId,
			captured,
			shiny
		})

		expect(
			computeStats(
				['a', 'b', 'c'],
				[entry('a', true, true), entry('b', false, true), entry('x', true, true)]
			)
		).toEqual({ total: 3, caught: 1, shiny: 1 })
	})
})
