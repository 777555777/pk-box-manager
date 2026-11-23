import { describe, expect, it } from 'vitest'
import { isDexSave, sanitizeOptionalFields, validateImportedDexSave } from './dex-validation.ts'
import {
	V1_DEX_FIXTURES,
	loadV1Dex,
	readRealExports,
	readV1DexRaw
} from '../../../tests/helpers/v1-fixtures.ts'

const realExports = readRealExports()

describe('validateImportedDexSave', () => {
	it.each(V1_DEX_FIXTURES)('accepts the v1 fixture %s as JSON string', (name) => {
		const dex = validateImportedDexSave(readV1DexRaw(name))

		expect(dex.id).toBe(loadV1Dex(name).id)
	})

	it('accepts an already parsed object', () => {
		expect(validateImportedDexSave(loadV1Dex('gen1-filled')).config.displayName).toBe(
			'Kanto Living'
		)
	})

	it('keeps the user data of edited entries', () => {
		const pikachu = validateImportedDexSave(readV1DexRaw('gen1-filled')).state.pokemon[
			'0025-pikachu'
		]

		expect(pikachu).toMatchObject({
			captured: true,
			shiny: true,
			caughtIn: 'LetsGoPikachu',
			ability: 'static',
			comment: 'Nur möglich mit anderer OT.\nOT: Ash ✨ "Region": Alola',
			ribbons: ['001-national-ribbon', '003-champion-ribbon'],
			marks: ['absent-minded-mark']
		})
	})

	// Was a v1 bug: the schema did not know `originalTrainer`, so valibot's object() stripped it.
	it('keeps the original trainer', () => {
		const pikachu = validateImportedDexSave(readV1DexRaw('gen1-filled')).state.pokemon[
			'0025-pikachu'
		]

		expect(pikachu).toHaveProperty('originalTrainer', 'Ash')
	})

	it('accepts saves created before the original trainer existed', () => {
		const bulbasaur = validateImportedDexSave(readV1DexRaw('national-all-tags-legacy')).state
			.pokemon['0001-bulbasaur']

		expect(bulbasaur).not.toHaveProperty('originalTrainer')
	})

	it('rejects invalid JSON', () => {
		expect(() => validateImportedDexSave('{ not json')).toThrow(
			'The imported file does not contain valid JSON.'
		)
	})

	it('rejects non-object input', () => {
		expect(() => validateImportedDexSave(42)).toThrow('Expected JSON string or object')
	})

	it('rejects saves that do not match the schema', () => {
		const dex = loadV1Dex('gen1-empty-all-tags') as unknown as Record<string, unknown>
		delete dex.meta

		expect(() => validateImportedDexSave(dex)).toThrow('Schema validation failed')
	})

	it('rejects boxes that reference unknown pokemon', () => {
		const dex = loadV1Dex('gen1-empty-all-tags')
		dex.state.boxes[0].pokemon.push('9999-missingno')

		expect(() => validateImportedDexSave(dex)).toThrow(
			'Pokemon "9999-missingno" is referenced in boxes but missing from pokemon object'
		)
	})

	it('rejects state entries that are not part of the config order', () => {
		const dex = loadV1Dex('gen1-empty-all-tags')
		dex.state.pokemon['9999-missingno'] = {
			...dex.state.pokemon['0001-bulbasaur'],
			idEntry: { pokemonid: 'missingno', formid: null, id_national: 9999 }
		}

		expect(() => validateImportedDexSave(dex)).toThrow('Pokemon data inconsistencies found')
	})

	it('rejects impossible counters and timestamps', () => {
		const tooManyCaught = loadV1Dex('gen1-filled')
		tooManyCaught.meta.totalCaught = tooManyCaught.meta.totalPokemon + 1
		expect(() => validateImportedDexSave(tooManyCaught)).toThrow('Invalid counters')

		const timeTravel = loadV1Dex('gen1-filled')
		timeTravel.meta.createdAt = timeTravel.meta.updatedAt + 1
		expect(() => validateImportedDexSave(timeTravel)).toThrow('Invalid timestamps')
	})

	describe.skipIf(realExports.length === 0)('real exports from /.testdata', () => {
		it.each(realExports)('accepts $file', ({ raw }) => {
			const dex = validateImportedDexSave(raw)

			expect(dex.meta.totalPokemon).toBe(Object.keys(dex.state.pokemon).length)
		})
	})
})

describe('isDexSave', () => {
	it('detects valid and invalid saves', () => {
		expect(isDexSave(loadV1Dex('gen3-forms'))).toBe(true)
		expect(isDexSave({ id: 'nope' })).toBe(false)
	})
})

describe('sanitizeOptionalFields', () => {
	it('fills missing optional values without mutating the input', () => {
		const dex = validateImportedDexSave(loadV1Dex('gen1-filled'))
		const entry = dex.state.pokemon['0001-bulbasaur'] as Record<string, unknown>
		entry.comment = undefined
		entry.ribbons = null

		const sanitized = sanitizeOptionalFields(dex)

		expect(sanitized.state.pokemon['0001-bulbasaur']).toMatchObject({ comment: '', ribbons: [] })
		expect(entry.ribbons).toBeNull()
	})
})
