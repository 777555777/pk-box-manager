/**
 * Export and import of single dexes as JSON files.
 *
 * Export format v2 contains only user data (no stats, no dexId per entry).
 * Imports accept v2 exports and v1 files (exports and raw localStorage values).
 */
import {
	literal,
	number,
	object,
	array,
	omit,
	safeParse,
	summarize,
	integer,
	minValue,
	pipe
} from 'valibot'
import { catalog as defaultCatalog, type Catalog } from '../catalog/catalog.ts'
import type { PokemonId } from '../catalog/types.ts'
import { DexEntrySchema, DexRecordSchema } from './schemas.ts'
import { computeStats } from './stats.ts'
import type { DexEntry, DexRecord } from './types.ts'
import { convertV1Save, type V1ConversionReport } from './v1/convert-v1.ts'
import { looksLikeV1Save, parseV1Save } from './v1/v1-save.ts'

export const EXPORT_FORMAT = 'pk-box-manager'
export const EXPORT_VERSION = 2

const DexExportSchema = object({
	format: literal(EXPORT_FORMAT),
	version: literal(EXPORT_VERSION),
	exportedAt: pipe(number(), integer(), minValue(0)),
	dex: omit(DexRecordSchema, ['stats']),
	entries: array(omit(DexEntrySchema, ['dexId']))
})

export interface DexExport {
	format: typeof EXPORT_FORMAT
	version: typeof EXPORT_VERSION
	exportedAt: number
	dex: Omit<DexRecord, 'stats'>
	entries: Omit<DexEntry, 'dexId'>[]
}

export interface ImportedDex {
	dex: DexRecord
	entries: DexEntry[]
	source: 'v1' | 'v2'
	/** Only for v1 files: what the conversion noticed. */
	report?: V1ConversionReport
}

export function createDexExport(
	dex: DexRecord,
	entries: DexEntry[],
	exportedAt: number
): DexExport {
	const { stats, ...dexWithoutStats } = structuredClone(dex)
	void stats
	return {
		format: EXPORT_FORMAT,
		version: EXPORT_VERSION,
		exportedAt,
		dex: dexWithoutStats,
		entries: entries.map(({ dexId, ...entry }) => {
			void dexId
			return structuredClone(entry)
		})
	}
}

/** e.g. "pk-box-manager-kanto-living-2026-11-23.json" */
export function exportFileName(dex: Pick<DexRecord, 'name'>, exportedAt: number): string {
	const slug =
		dex.name
			.normalize('NFKD')
			.replace(/[̀-ͯ]/g, '')
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '') || 'dex'
	const date = new Date(exportedAt).toISOString().slice(0, 10)
	return `${EXPORT_FORMAT}-${slug}-${date}.json`
}

/**
 * Reads an import file (v2 export or v1 save).
 * @throws Error with a message that can be shown to the user.
 */
export function parseDexImport(raw: string, catalog: Catalog = defaultCatalog): ImportedDex {
	let data: unknown
	try {
		data = JSON.parse(raw)
	} catch {
		throw new Error('The file does not contain valid JSON.')
	}

	if (looksLikeV1Save(data)) {
		const { dex, entries, report } = convertV1Save(parseV1Save(data), catalog)
		return { dex, entries, source: 'v1', report }
	}

	if (!isObject(data) || data.format !== EXPORT_FORMAT) {
		throw new Error('This file is not a Box Manager export.')
	}
	if (typeof data.version === 'number' && data.version > EXPORT_VERSION) {
		throw new Error('This file was created by a newer version of the Box Manager.')
	}

	const result = safeParse(DexExportSchema, data)
	if (!result.success) {
		throw new Error(`The export file is invalid:\n${summarize(result.issues)}`)
	}
	return fromExport(result.output, catalog)
}

function fromExport(file: DexExport, catalog: Catalog): ImportedDex {
	const { layout } = file.dex
	if (layout.kind === 'preset' && !catalog.getPreset(layout.presetId)) {
		throw new Error(`The dex uses the unknown preset "${layout.presetId}".`)
	}
	if (layout.kind === 'custom') {
		const issues = catalog.validateCustomLayout(layout)
		if (issues.length > 0) {
			const details = issues.map(
				(i) => `${i.code} (${i.boxId}${i.pokemonId ? `, ${i.pokemonId}` : ''})`
			)
			throw new Error(`The dex layout is invalid: ${details.join(', ')}`)
		}
	}

	// renamed pokemon (aliases): first entry wins, like in the v1 conversion
	const entries: DexEntry[] = []
	const seen = new Set<PokemonId>()
	for (const entry of file.entries) {
		const pokemonId = catalog.resolvePokemonId(entry.pokemonId)
		if (seen.has(pokemonId)) continue
		seen.add(pokemonId)
		entries.push({ ...entry, pokemonId, dexId: file.dex.id })
	}

	const dex: DexRecord = {
		...file.dex,
		stats: computeStats(catalog.listPokemonIds(layout), entries)
	}
	return { dex, entries, source: 'v2' }
}

function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null
}
