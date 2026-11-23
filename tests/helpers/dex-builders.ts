import { emptyEntryData, type DexEntry, type DexRecord } from '../../src/lib/dex/types.ts'
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb'
import { openIndexedDbRepository } from '../../src/lib/storage/indexeddb-repository.ts'
import { createMemoryRepository } from '../../src/lib/storage/memory-repository.ts'
import type { DexRepository } from '../../src/lib/storage/repository.ts'

export function makeDex(id: string, overrides: Partial<DexRecord> = {}): DexRecord {
	return {
		id,
		name: `Dex ${id}`,
		coverImage: 'gen-1.png',
		layout: { kind: 'preset', presetId: 'generation-1', tags: ['normal'] },
		boxSettings: {},
		isDefault: false,
		createdAt: 1,
		updatedAt: 1,
		stats: { total: 151, caught: 0, shiny: 0 },
		...overrides
	}
}

export function makeEntry(
	dexId: string,
	pokemonId: string,
	overrides: Partial<DexEntry> = {}
): DexEntry {
	return { dexId, pokemonId, ...emptyEntryData(), captured: true, updatedAt: 1, ...overrides }
}

/** Fresh, isolated IndexedDB (in memory via fake-indexeddb) for every call. */
export function openFakeIndexedDbRepository(factory = new IDBFactory(), name = 'test') {
	return openIndexedDbRepository({
		name,
		factory: factory as unknown as globalThis.IDBFactory,
		keyRange: IDBKeyRange as unknown as typeof globalThis.IDBKeyRange
	})
}

export const repositoryImplementations: [string, () => Promise<DexRepository>][] = [
	['memory', async () => createMemoryRepository()],
	['indexeddb', () => openFakeIndexedDbRepository()]
]
