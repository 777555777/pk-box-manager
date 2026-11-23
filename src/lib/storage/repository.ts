/**
 * Storage interface of the v2 data model. The app only talks to this interface,
 * implementations: IndexedDB (browser) and in-memory (tests).
 */
import type { PokemonId } from '../catalog/types.ts'
import type { DexEntry, DexRecord } from '../dex/types.ts'

export const SCHEMA_VERSION = 2

export interface V1MigrationInfo {
	migratedAt: number
	dexIds: string[]
	/** localStorage keys that could not be migrated, with the reason. */
	skipped: { key: string; error: string }[]
}

export interface StorageMeta {
	schemaVersion: number
	v1Migration: V1MigrationInfo
}

/**
 * Changes that are applied atomically: either all of them or none.
 * Order: deleteDexes → deleteEntries → putDexes → putEntries → setMeta,
 * so a dex can be replaced (deleted and put again) within one batch.
 */
export interface WriteBatch {
	/** Deletes the dexes together with all their entries. */
	deleteDexes?: string[]
	deleteEntries?: { dexId: string; pokemonIds: PokemonId[] }[]
	putDexes?: DexRecord[]
	/** Inserts or replaces entries (key: dexId + pokemonId). */
	putEntries?: DexEntry[]
	/** Only the given keys are written, other keys stay untouched. */
	setMeta?: Partial<StorageMeta>
}

export interface DexRepository {
	listDexes(): Promise<DexRecord[]>
	getDex(dexId: string): Promise<DexRecord | undefined>
	getEntries(dexId: string): Promise<DexEntry[]>
	getMeta<K extends keyof StorageMeta>(key: K): Promise<StorageMeta[K] | undefined>
	write(batch: WriteBatch): Promise<void>
	close(): void
}

/** Shared key validation, so both implementations reject the same invalid data. */
export function assertValidBatch(batch: WriteBatch): void {
	for (const dex of batch.putDexes ?? []) {
		if (typeof dex.id !== 'string' || dex.id === '') {
			throw new Error('Cannot store a dex without id.')
		}
	}
	for (const entry of batch.putEntries ?? []) {
		if (typeof entry.dexId !== 'string' || entry.dexId === '') {
			throw new Error(`Cannot store entry "${entry.pokemonId}" without dexId.`)
		}
		if (typeof entry.pokemonId !== 'string' || entry.pokemonId === '') {
			throw new Error(`Cannot store an entry of dex "${entry.dexId}" without pokemonId.`)
		}
	}
}
