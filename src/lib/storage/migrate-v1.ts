/**
 * One-time migration of the v1 localStorage data into the v2 repository.
 * See docs/data-model-v2.md, section "Migration v1 → v2".
 */
import { catalog as defaultCatalog, type Catalog } from '../catalog/catalog.ts'
import { convertV1Save, type V1ConversionReport } from '../dex/v1/convert-v1.ts'
import { parseV1Save } from '../dex/v1/v1-save.ts'
import type { DexEntry, DexRecord } from '../dex/types.ts'
import { SCHEMA_VERSION, type DexRepository, type V1MigrationInfo } from './repository.ts'

export const V1_DEX_PREFIX = 'dex:'
/** Informational marker in localStorage. The v1 data itself is kept as a safety net. */
export const V1_MIGRATED_MARKER = 'v1MigratedAt'

export type MigrationResult =
	| { status: 'up-to-date' }
	| { status: 'fresh' }
	| {
			status: 'migrated'
			info: V1MigrationInfo
			reports: Record<string, V1ConversionReport>
	  }

type V1Source = Pick<Storage, 'length' | 'key' | 'getItem' | 'setItem'>

interface MigrationOptions {
	catalog?: Catalog
	now?: () => number
}

/**
 * Runs the migration if the repository has no current schema yet.
 * Everything is written in one atomic batch: when anything fails nothing is
 * stored and the migration runs again on the next start.
 */
export async function migrateFromV1(
	repository: DexRepository,
	source: V1Source = localStorage,
	{ catalog = defaultCatalog, now = Date.now }: MigrationOptions = {}
): Promise<MigrationResult> {
	const schemaVersion = await repository.getMeta('schemaVersion')
	if (schemaVersion !== undefined && schemaVersion >= SCHEMA_VERSION) {
		return { status: 'up-to-date' }
	}

	const v1Keys = listV1DexKeys(source)
	if (v1Keys.length === 0) {
		await repository.write({ setMeta: { schemaVersion: SCHEMA_VERSION } })
		return { status: 'fresh' }
	}

	const dexes: DexRecord[] = []
	const entries: DexEntry[] = []
	const reports: Record<string, V1ConversionReport> = {}
	const skipped: V1MigrationInfo['skipped'] = []

	for (const key of v1Keys) {
		try {
			const converted = convertV1Save(parseV1Save(source.getItem(key)), catalog)
			dexes.push(converted.dex)
			entries.push(...converted.entries)
			reports[converted.dex.id] = converted.report
		} catch (error) {
			skipped.push({ key, error: error instanceof Error ? error.message : String(error) })
		}
	}

	ensureSingleDefault(dexes)

	const info: V1MigrationInfo = {
		migratedAt: now(),
		dexIds: dexes.map((dex) => dex.id),
		skipped
	}

	await repository.write({
		putDexes: dexes,
		putEntries: entries,
		setMeta: { schemaVersion: SCHEMA_VERSION, v1Migration: info }
	})

	try {
		source.setItem(V1_MIGRATED_MARKER, String(info.migratedAt))
	} catch {
		// the marker is informational only (e.g. quota exceeded)
	}

	return { status: 'migrated', info, reports }
}

function listV1DexKeys(source: V1Source): string[] {
	const keys: string[] = []
	for (let index = 0; index < source.length; index++) {
		const key = source.key(index)
		if (key?.startsWith(V1_DEX_PREFIX)) keys.push(key)
	}
	return keys.sort()
}

/** v1 should only ever have one system default, but do not rely on it. */
function ensureSingleDefault(dexes: DexRecord[]) {
	let found = false
	for (const dex of dexes) {
		if (dex.isDefault && found) dex.isDefault = false
		found ||= dex.isDefault
	}
}
