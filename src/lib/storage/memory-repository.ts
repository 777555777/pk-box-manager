import type { DexEntry, DexRecord } from '../dex/types.ts'
import {
	assertValidBatch,
	type DexRepository,
	type StorageMeta,
	type WriteBatch
} from './repository.ts'

/**
 * In-memory repository with the same semantics as the IndexedDB one
 * (copies on read and write, atomic batches). Used in tests.
 */
export function createMemoryRepository(): DexRepository {
	let dexes = new Map<string, DexRecord>()
	let entries = new Map<string, Map<string, DexEntry>>()
	let meta: Partial<StorageMeta> = {}

	return {
		async listDexes() {
			return [...dexes.values()].sort(byId).map((dex) => structuredClone(dex))
		},

		async getDex(dexId) {
			const dex = dexes.get(dexId)
			return dex && structuredClone(dex)
		},

		async getEntries(dexId) {
			const dexEntries = [...(entries.get(dexId)?.values() ?? [])]
			return dexEntries
				.sort((a, b) => compare(a.pokemonId, b.pokemonId))
				.map((entry) => structuredClone(entry))
		},

		async getMeta(key) {
			const value = meta[key]
			return value === undefined ? undefined : structuredClone(value)
		},

		async write(batch: WriteBatch) {
			assertValidBatch(batch)

			// apply to copies and swap at the end → atomic
			const nextDexes = new Map(dexes)
			const nextEntries = new Map([...entries].map(([id, map]) => [id, new Map(map)]))

			for (const dexId of batch.deleteDexes ?? []) {
				nextDexes.delete(dexId)
				nextEntries.delete(dexId)
			}
			for (const { dexId, pokemonIds } of batch.deleteEntries ?? []) {
				for (const pokemonId of pokemonIds) nextEntries.get(dexId)?.delete(pokemonId)
			}
			for (const dex of batch.putDexes ?? []) {
				nextDexes.set(dex.id, structuredClone(dex))
			}
			for (const entry of batch.putEntries ?? []) {
				if (!nextEntries.has(entry.dexId)) nextEntries.set(entry.dexId, new Map())
				nextEntries.get(entry.dexId)!.set(entry.pokemonId, structuredClone(entry))
			}

			dexes = nextDexes
			entries = nextEntries
			meta = { ...meta, ...structuredClone(batch.setMeta ?? {}) }
		},

		close() {}
	}
}

function compare(a: string, b: string) {
	return a < b ? -1 : a > b ? 1 : 0
}

function byId(a: DexRecord, b: DexRecord) {
	return compare(a.id, b.id)
}
