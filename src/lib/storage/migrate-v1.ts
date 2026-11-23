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

type Skipped = V1MigrationInfo['skipped']

export type MigrationResult =
	| {
			status: 'up-to-date'
			/** v1 saves that still cannot be read (kept in localStorage, retried on every start). */
			skipped: Skipped
			/** Previously skipped saves that could be migrated now (e.g. after an app update). */
			recovered: string[]
	  }
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
	/**
	 * False when the repository only lives in memory (IndexedDB unavailable):
	 * then the informational marker is not set, nothing was stored for good.
	 */
	persistent?: boolean
}

/**
 * Runs the migration if the repository has no current schema yet.
 * Everything is written in one atomic batch: when anything fails nothing is
 * stored and the migration runs again on the next start.
 */
export async function migrateFromV1(
	repository: DexRepository,
	source: V1Source = localStorage,
	{ catalog = defaultCatalog, now = Date.now, persistent = true }: MigrationOptions = {}
): Promise<MigrationResult> {
	const schemaVersion = await repository.getMeta('schemaVersion')
	if (schemaVersion !== undefined && schemaVersion >= SCHEMA_VERSION) {
		return retrySkipped(repository, source, catalog)
	}

	const v1Keys = listV1DexKeys(source)
	if (v1Keys.length === 0) {
		await repository.write({ setMeta: { schemaVersion: SCHEMA_VERSION } })
		return { status: 'fresh' }
	}

	const dexes: DexRecord[] = []
	const entries: DexEntry[] = []
	const reports: Record<string, V1ConversionReport> = {}
	const skipped: Skipped = []

	for (const key of v1Keys) {
		try {
			const converted = convertV1Save(parseV1Save(source.getItem(key)), catalog)
			dexes.push(converted.dex)
			entries.push(...converted.entries)
			reports[converted.dex.id] = converted.report
		} catch (error) {
			skipped.push({ key, error: errorMessage(error) })
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

	if (persistent) {
		try {
			source.setItem(V1_MIGRATED_MARKER, String(info.migratedAt))
		} catch {
			// the marker is informational only (e.g. quota exceeded)
		}
	}

	return { status: 'migrated', info, reports }
}

/**
 * Saves skipped by an earlier migration stay in localStorage. Retry them on every
 * start: a newer app version may be able to read them. A save is only added when
 * no v2 dex with its id exists, so nothing the user changed since gets overwritten.
 */
async function retrySkipped(
	repository: DexRepository,
	source: V1Source,
	catalog: Catalog
): Promise<MigrationResult> {
	const info = await repository.getMeta('v1Migration')
	if (!info || info.skipped.length === 0)
		return { status: 'up-to-date', skipped: [], recovered: [] }

	const existing = await repository.listDexes()
	const hasDefault = existing.some((dex) => dex.isDefault)
	const dexes: DexRecord[] = []
	const entries: DexEntry[] = []
	const stillSkipped: Skipped = []

	for (const item of info.skipped) {
		const raw = source.getItem(item.key)
		if (raw === null) continue // removed in the meantime: nothing left to rescue
		try {
			const converted = convertV1Save(parseV1Save(raw), catalog)
			if (existing.some((dex) => dex.id === converted.dex.id)) continue
			if (hasDefault) converted.dex.isDefault = false
			dexes.push(converted.dex)
			entries.push(...converted.entries)
		} catch (error) {
			stillSkipped.push({ key: item.key, error: errorMessage(error) })
		}
	}

	if (dexes.length > 0 || stillSkipped.length !== info.skipped.length) {
		ensureSingleDefault(dexes)
		await repository.write({
			putDexes: dexes,
			putEntries: entries,
			setMeta: {
				v1Migration: {
					...info,
					dexIds: [...info.dexIds, ...dexes.map((dex) => dex.id)],
					skipped: stillSkipped
				}
			}
		})
	}
	return {
		status: 'up-to-date',
		skipped: stillSkipped,
		recovered: dexes.map((dex) => dex.id)
	}
}

function errorMessage(error: unknown): string {
	return error instanceof Error ? error.message : String(error)
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
