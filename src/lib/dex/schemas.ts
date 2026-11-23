/**
 * valibot schemas of the v2 data model. Structural checks only, semantic checks
 * against the catalog live in catalog.validateCustomLayout.
 */
import {
	array,
	boolean,
	integer,
	literal,
	maxLength,
	minLength,
	minValue,
	nullable,
	number,
	object,
	optional,
	picklist,
	pipe,
	record,
	string,
	variant,
	type InferOutput
} from 'valibot'
import { BOX_SIZE } from '../catalog/catalog.ts'
import type { DexEntry, DexRecord } from './types.ts'

const NonEmptyString = pipe(string(), minLength(1))
const Timestamp = pipe(number(), integer(), minValue(0))
const Counter = pipe(number(), integer(), minValue(0))

export const BoxTagSchema = picklist(['normal', 'female', 'forms', 'gigantamax'])

export const DexLayoutSchema = variant('kind', [
	object({
		kind: literal('preset'),
		presetId: NonEmptyString,
		tags: array(BoxTagSchema)
	}),
	object({
		kind: literal('custom'),
		boxes: array(
			object({
				id: NonEmptyString,
				title: string(),
				slots: pipe(array(nullable(NonEmptyString)), maxLength(BOX_SIZE))
			})
		)
	})
])

export const BoxSettingsSchema = record(string(), object({ wallpaper: optional(string()) }))

export const DexRecordSchema = object({
	id: NonEmptyString,
	name: string(),
	coverImage: string(),
	layout: DexLayoutSchema,
	boxSettings: BoxSettingsSchema,
	isDefault: boolean(),
	createdAt: Timestamp,
	updatedAt: Timestamp,
	stats: object({ total: Counter, caught: Counter, shiny: Counter })
})

export const EntryDataSchema = object({
	captured: boolean(),
	shiny: boolean(),
	ball: string(),
	caughtIn: string(),
	ability: string(),
	comment: string(),
	originalTrainer: string(),
	ribbons: array(string()),
	marks: array(string())
})

export const DexEntrySchema = object({
	dexId: NonEmptyString,
	pokemonId: NonEmptyString,
	...EntryDataSchema.entries,
	updatedAt: Timestamp
})

// The schemas must describe exactly the TypeScript types (checked in both directions).
type Equals<A, B> =
	(<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false
const recordMatches: Equals<InferOutput<typeof DexRecordSchema>, DexRecord> = true
const entryMatches: Equals<InferOutput<typeof DexEntrySchema>, DexEntry> = true
void recordMatches
void entryMatches
