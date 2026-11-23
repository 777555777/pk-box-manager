/**
 * Types of the static catalog (shipped with the app) and of dex layouts.
 * See docs/data-model-v2.md.
 */

/** Stable identifier of a pokemon or form, e.g. "0025-pikachu-cap-alola". */
export type PokemonId = string

export type BoxTag = 'normal' | 'female' | 'forms' | 'gigantamax'

/** A box as defined in pokedex-boxes.json. Its id is stable and used as box id in dexes. */
export interface BoxTemplate {
	id: string
	title: string
	tags: BoxTag[]
	pokemon: PokemonId[]
}

export interface PresetDefinition {
	id: string
	name: string
	coverImage: string
	/** Box template ids in display order. */
	boxes: string[]
}

/** Preset dexes are resolved against the catalog at runtime and grow with app updates. */
export interface PresetLayout {
	kind: 'preset'
	presetId: string
	tags: BoxTag[]
}

/** Custom dexes have a frozen, user defined order. */
export interface CustomLayout {
	kind: 'custom'
	boxes: CustomBox[]
}

export interface CustomBox {
	id: string
	title: string
	/** At most BOX_SIZE entries, `null` is an intentionally empty slot. */
	slots: (PokemonId | null)[]
}

export type DexLayout = PresetLayout | CustomLayout

/** Per-box settings stored with a dex, keyed by box id. Only deviations from the defaults. */
export type BoxSettings = Record<string, { wallpaper?: string }>

/** A box ready for rendering. Only exists in memory. */
export interface ResolvedBox {
	id: string
	title: string
	wallpaper: string
	slots: (PokemonId | null)[]
}

export type LayoutIssueCode =
	'duplicate-box-id' | 'empty-box-title' | 'box-too-large' | 'duplicate-pokemon' | 'unknown-pokemon'

export interface LayoutIssue {
	code: LayoutIssueCode
	boxId: string
	slot?: number
	pokemonId?: PokemonId
}
