/**
 * User data of the v2 data model. See docs/data-model-v2.md.
 */
import type { BoxSettings, DexLayout, PokemonId } from '../catalog/types.ts'

export interface DexStats {
	total: number
	caught: number
	shiny: number
}

export interface DexRecord {
	/** New dexes: crypto.randomUUID(). Migrated dexes keep their v1 id. */
	id: string
	name: string
	coverImage: string
	layout: DexLayout
	/** Only boxes that deviate from the defaults, keyed by box id. */
	boxSettings: BoxSettings
	/** The dex the app falls back to when the active dex is deleted. */
	isDefault: boolean
	createdAt: number
	updatedAt: number
	/** Cached counters for dex lists, derived from layout + entries. */
	stats: DexStats
}

/** The editable fields of a pokemon in a dex. */
export interface EntryData {
	captured: boolean
	shiny: boolean
	ball: string
	caughtIn: string
	ability: string
	comment: string
	originalTrainer: string
	ribbons: string[]
	marks: string[]
}

/**
 * Only pokemon the user touched have an entry. A missing entry means
 * "not caught, never edited" (v1: `isCustomized === false`).
 */
export interface DexEntry extends EntryData {
	dexId: string
	pokemonId: PokemonId
	updatedAt: number
}

export const DEFAULT_BALL = '01-poke-ball'

/** Values of a pokemon without entry. Returns a fresh object on every call. */
export function emptyEntryData(): EntryData {
	return {
		captured: false,
		shiny: false,
		ball: DEFAULT_BALL,
		caughtIn: '',
		ability: '',
		comment: '',
		originalTrainer: '',
		ribbons: [],
		marks: []
	}
}
