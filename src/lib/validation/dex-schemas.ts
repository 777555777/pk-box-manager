import {
	object,
	string,
	number,
	boolean,
	array,
	record,
	nullable,
	literal,
	union,
	type InferOutput
} from 'valibot'

// =================================
// Base Schemas
// =================================

export const PokemonEntrySchema = object({
	pokemonid: string(),
	formid: nullable(string()),
	id_national: number()
})

export const BoxTagsSchema = union([
	literal('normal'),
	literal('forms'),
	literal('gigantamax'),
	literal('female')
])

export const PokemonEditStateSchema = object({
	idEntry: PokemonEntrySchema,
	captured: boolean(),
	ball: string(),
	shiny: boolean(),
	caughtIn: string(),
	ability: string(),
	comment: string(),
	ribbons: array(string()),
	marks: array(string()),
	isCustomized: boolean()
})

export const BoxStateSchema = object({
	id: string(),
	title: string(),
	settings: object({
		wallpaper: string()
	}),
	pokemon: array(string())
})

export const BoxOrderConfigSchema = object({
	title: string(),
	pokemon: array(PokemonEntrySchema)
})

// =================================
// Complex Schemas
// =================================

export const DexConfigSchema = object({
	presetId: string(),
	configVersion: string(),
	type: union([literal('preset'), literal('custom')]),
	displayName: string(),
	coverImage: string(),
	sortOrder: number(),
	tags: array(BoxTagsSchema),
	boxList: array(string()),
	pokemonOrder: array(BoxOrderConfigSchema),
	createdAt: number(),
	updatedAt: number()
})

export const DexStateSchema = object({
	stateVersion: string(),
	pokemon: record(string(), PokemonEditStateSchema),
	boxes: array(BoxStateSchema)
})

export const DexMetaSchema = object({
	createdAt: number(),
	updatedAt: number(),
	totalPokemon: number(),
	totalCaught: number(),
	totalShiny: number(),
	isSystemDefault: nullable(boolean())
})

// =================================
// Main Schema
// =================================

export const DexSaveSchema = object({
	id: string(),
	config: DexConfigSchema,
	state: DexStateSchema,
	meta: DexMetaSchema
})

// =================================
// Type Exports (for TypeScript)
// =================================

export type ValidatedPokemonEntry = InferOutput<typeof PokemonEntrySchema>
export type ValidatedPokemonEditState = InferOutput<typeof PokemonEditStateSchema>
export type ValidatedBoxState = InferOutput<typeof BoxStateSchema>
export type ValidatedBoxOrderConfig = InferOutput<typeof BoxOrderConfigSchema>
export type ValidatedDexConfig = InferOutput<typeof DexConfigSchema>
export type ValidatedDexState = InferOutput<typeof DexStateSchema>
export type ValidatedDexMeta = InferOutput<typeof DexMetaSchema>
export type ValidatedDexSave = InferOutput<typeof DexSaveSchema>
