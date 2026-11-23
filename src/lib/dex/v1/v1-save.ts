/**
 * Tolerant reader for v1 saves (localStorage `dex:<id>` values and v1 export files).
 *
 * Real v1 data grew over time: e.g. `originalTrainer` is missing in saves created
 * before the OT feature and in entries v1 never touched. Everything the
 * conversion needs is validated, missing optional fields get their defaults.
 * Fields the conversion does not need (idEntry, pokemonOrder, …) are ignored.
 */
import {
	array,
	boolean,
	nullable,
	number,
	object,
	optional,
	picklist,
	pipe,
	record,
	safeParse,
	string,
	summarize,
	minLength,
	type InferOutput
} from 'valibot'
import { DEFAULT_BALL } from '../types.ts'

const V1EntrySchema = object({
	captured: optional(boolean(), false),
	shiny: optional(boolean(), false),
	ball: optional(string(), DEFAULT_BALL),
	caughtIn: optional(string(), ''),
	ability: optional(string(), ''),
	comment: optional(string(), ''),
	originalTrainer: optional(string(), ''),
	ribbons: optional(array(string()), []),
	marks: optional(array(string()), []),
	isCustomized: optional(boolean(), false)
})

const V1SaveSchema = object({
	id: pipe(string(), minLength(1)),
	config: object({
		presetId: string(),
		type: picklist(['preset', 'custom']),
		displayName: string(),
		coverImage: optional(string(), ''),
		tags: optional(array(picklist(['normal', 'female', 'forms', 'gigantamax'])), ['normal'])
	}),
	state: object({
		pokemon: record(string(), V1EntrySchema),
		boxes: array(
			object({
				id: string(),
				title: string(),
				settings: optional(object({ wallpaper: optional(string()) }), {}),
				pokemon: array(string())
			})
		)
	}),
	meta: object({
		createdAt: optional(number(), 0),
		updatedAt: optional(number(), 0),
		isSystemDefault: optional(nullable(boolean()), false)
	})
})

export type V1Save = InferOutput<typeof V1SaveSchema>
export type V1Entry = InferOutput<typeof V1EntrySchema>

/** Heuristic used to tell v1 data apart from other formats. */
export function looksLikeV1Save(data: unknown): boolean {
	return (
		typeof data === 'object' &&
		data !== null &&
		'id' in data &&
		'config' in data &&
		'state' in data &&
		'meta' in data
	)
}

/**
 * Parses a v1 save from a JSON string or object.
 * @throws Error with a readable summary when the data is not a usable v1 save.
 */
export function parseV1Save(input: unknown): V1Save {
	let data = input
	if (typeof input === 'string') {
		try {
			data = JSON.parse(input)
		} catch {
			throw new Error('The v1 save does not contain valid JSON.')
		}
	}

	const result = safeParse(V1SaveSchema, data)
	if (!result.success) {
		throw new Error(`Invalid v1 save:\n${summarize(result.issues)}`)
	}
	return result.output
}
