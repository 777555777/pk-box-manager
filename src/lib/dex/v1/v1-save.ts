/**
 * Tolerant reader for v1 saves (localStorage `dex:<id>` values and v1 export files).
 *
 * Real v1 data grew over time, the reader accepts every variant v1.0.0 could still show:
 * - saves before 2025-08-25 have `config.id` instead of `config.presetId`
 *   and no `meta.isSystemDefault`
 * - `originalTrainer` is missing in saves created before the OT feature
 *   and in entries v1 never touched
 * - missing or `null` fields get their defaults
 * A single unreadable entry is skipped (and reported), it never discards the whole dex.
 * Fields the conversion does not need (idEntry, pokemonOrder, …) are ignored.
 */
import {
	array,
	boolean,
	minLength,
	nullish,
	number,
	object,
	pipe,
	record,
	safeParse,
	string,
	summarize,
	unknown
} from 'valibot'
import type { BoxTag } from '../../catalog/types.ts'
import { DEFAULT_BALL } from '../types.ts'

const KNOWN_TAGS: BoxTag[] = ['normal', 'female', 'forms', 'gigantamax']

const V1EntrySchema = object({
	captured: nullish(boolean(), false),
	shiny: nullish(boolean(), false),
	ball: nullish(string(), DEFAULT_BALL),
	caughtIn: nullish(string(), ''),
	ability: nullish(string(), ''),
	comment: nullish(string(), ''),
	originalTrainer: nullish(string(), ''),
	ribbons: nullish(array(string()), []),
	marks: nullish(array(string()), []),
	isCustomized: nullish(boolean(), false)
})

const V1SaveSchema = object({
	id: pipe(string(), minLength(1)),
	config: object({
		presetId: nullish(string()),
		/** before 2025-08-25 */
		id: nullish(string()),
		type: nullish(string(), 'preset'),
		displayName: nullish(string(), ''),
		coverImage: nullish(string(), ''),
		tags: nullish(array(string()), ['normal'])
	}),
	state: object({
		// entries are validated one by one, see parseV1Save
		pokemon: record(string(), unknown()),
		boxes: array(
			object({
				id: nullish(string(), ''),
				title: nullish(string(), ''),
				settings: nullish(object({ wallpaper: nullish(string()) }), {}),
				pokemon: array(string())
			})
		)
	}),
	meta: nullish(
		object({
			createdAt: nullish(number(), 0),
			updatedAt: nullish(number(), 0),
			isSystemDefault: nullish(boolean(), false)
		}),
		{}
	)
})

export interface V1Entry {
	captured: boolean
	shiny: boolean
	ball: string
	caughtIn: string
	ability: string
	comment: string
	originalTrainer: string
	ribbons: string[]
	marks: string[]
	isCustomized: boolean
}

export interface V1Save {
	id: string
	config: {
		presetId: string
		type: 'preset' | 'custom'
		displayName: string
		coverImage: string
		tags: BoxTag[]
	}
	state: {
		pokemon: Record<string, V1Entry>
		boxes: { id: string; title: string; settings: { wallpaper?: string }; pokemon: string[] }[]
	}
	meta: { createdAt: number; updatedAt: number; isSystemDefault: boolean }
	/** Keys of entries that could not be read. They are not converted. */
	invalidEntries?: string[]
}

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
	const { id, config, state, meta } = result.output

	const pokemon: Record<string, V1Entry> = {}
	const invalidEntries: string[] = []
	for (const [key, value] of Object.entries(state.pokemon)) {
		const entry = safeParse(V1EntrySchema, value)
		if (entry.success) pokemon[key] = entry.output
		else invalidEntries.push(key)
	}

	const tags = config.tags.filter((tag): tag is BoxTag => KNOWN_TAGS.includes(tag as BoxTag))

	return {
		id,
		config: {
			presetId: config.presetId ?? config.id ?? '',
			type: config.type === 'custom' ? 'custom' : 'preset',
			displayName: config.displayName,
			coverImage: config.coverImage,
			// unknown tags are dropped; if none is left, fall back to the base forms
			tags: tags.length > 0 || config.tags.length === 0 ? tags : ['normal']
		},
		state: {
			pokemon,
			boxes: state.boxes.map((box) => ({
				id: box.id,
				title: box.title,
				settings: box.settings.wallpaper ? { wallpaper: box.settings.wallpaper } : {},
				pokemon: box.pokemon
			}))
		},
		meta: {
			createdAt: meta.createdAt ?? 0,
			updatedAt: meta.updatedAt ?? 0,
			isSystemDefault: meta.isSystemDefault ?? false
		},
		invalidEntries
	}
}
