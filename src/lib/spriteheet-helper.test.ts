import { describe, expect, it } from 'vitest'
import { getIdentifier, getPokemonSpriteData, setCssPosition } from './spriteheet-helper.ts'

describe('getIdentifier', () => {
	it('pads the national number to four digits', () => {
		expect(getIdentifier({ pokemonid: 'bulbasaur', formid: null, id_national: 1 })).toBe(
			'0001-bulbasaur'
		)
	})

	it('appends the form id', () => {
		expect(getIdentifier({ pokemonid: 'pikachu', formid: 'cap-alola', id_national: 25 })).toBe(
			'0025-pikachu-cap-alola'
		)
	})
})

describe('getPokemonSpriteData', () => {
	it('returns the sheet and position for known pokemon and forms', () => {
		expect(getPokemonSpriteData('0001-bulbasaur')).toMatchObject({
			sheet: expect.any(String),
			pos: { x: expect.any(Number), y: expect.any(Number) }
		})
		expect(getPokemonSpriteData('0025-pikachu-cap-alola').sheet).toMatch(/^sf\d+$/)
	})

	it('falls back to the null sprite for unknown identifiers', () => {
		expect(getPokemonSpriteData('9999-missingno')).toEqual(getPokemonSpriteData('0000-null'))
	})
})

describe('setCssPosition', () => {
	it('creates an object-position declaration', () => {
		expect(setCssPosition({ x: -96, y: -192 })).toBe('object-position: -96px -192px;')
	})
})
