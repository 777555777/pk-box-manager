/**
 * IndexedDB implementation of the DexRepository, using only the native API.
 *
 * Stores:
 * - `dexes`   keyPath `id`
 * - `entries` keyPath `[dexId, pokemonId]` → all entries of a dex are one key range
 * - `meta`    out-of-line keys (`schemaVersion`, `v1Migration`)
 */
import {
	assertValidBatch,
	type DexRepository,
	type StorageMeta,
	type WriteBatch
} from './repository.ts'
import type { DexEntry, DexRecord } from '../dex/types.ts'

export const DB_NAME = 'pk-box-manager'
const DB_VERSION = 1

const DEXES = 'dexes'
const ENTRIES = 'entries'
const META = 'meta'

export interface IndexedDbOptions {
	name?: string
	/** Defaults to the global `indexedDB` / `IDBKeyRange` (injectable for tests). */
	factory?: IDBFactory
	keyRange?: typeof IDBKeyRange
}

export async function openIndexedDbRepository(
	options: IndexedDbOptions = {}
): Promise<DexRepository> {
	const factory = options.factory ?? globalThis.indexedDB
	const KeyRange = options.keyRange ?? globalThis.IDBKeyRange
	if (!factory || !KeyRange) throw new Error('IndexedDB is not available in this browser.')

	const db = await openDatabase(factory, options.name ?? DB_NAME)
	// another tab wants to upgrade the schema: let it, this tab has to reload anyway
	db.onversionchange = () => db.close()

	// [dexId] < [dexId, any string] < [dexId, []] because arrays sort after strings
	const entriesOf = (dexId: string) => KeyRange.bound([dexId], [dexId, []])

	function read<T>(storeName: string, query: (store: IDBObjectStore) => IDBRequest<T>) {
		const transaction = db.transaction(storeName, 'readonly')
		return requestToPromise(query(transaction.objectStore(storeName)))
	}

	return {
		listDexes: () => read<DexRecord[]>(DEXES, (store) => store.getAll()),

		getDex: (dexId) => read<DexRecord | undefined>(DEXES, (store) => store.get(dexId)),

		getEntries: (dexId) => read<DexEntry[]>(ENTRIES, (store) => store.getAll(entriesOf(dexId))),

		getMeta: <K extends keyof StorageMeta>(key: K) =>
			read<StorageMeta[K] | undefined>(META, (store) => store.get(key)),

		// async: invalid batches reject instead of throwing synchronously
		async write(batch: WriteBatch) {
			assertValidBatch(batch)

			return new Promise<void>((resolve, reject) => {
				const transaction = db.transaction([DEXES, ENTRIES, META], 'readwrite')
				transaction.oncomplete = () => resolve()
				transaction.onabort = () =>
					reject(transaction.error ?? new Error('The storage transaction was aborted.'))

				try {
					const dexes = transaction.objectStore(DEXES)
					const entries = transaction.objectStore(ENTRIES)
					const meta = transaction.objectStore(META)

					for (const dexId of batch.deleteDexes ?? []) {
						dexes.delete(dexId)
						entries.delete(entriesOf(dexId))
					}
					for (const { dexId, pokemonIds } of batch.deleteEntries ?? []) {
						for (const pokemonId of pokemonIds) entries.delete([dexId, pokemonId])
					}
					for (const dex of batch.putDexes ?? []) dexes.put(dex)
					for (const entry of batch.putEntries ?? []) entries.put(entry)
					for (const [key, value] of Object.entries(batch.setMeta ?? {})) {
						meta.put(value, key)
					}
				} catch (error) {
					// e.g. DataCloneError for values that cannot be stored (Svelte proxies!)
					transaction.abort()
					reject(error)
				}
			})
		},

		close: () => db.close()
	}
}

function openDatabase(factory: IDBFactory, name: string): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const request = factory.open(name, DB_VERSION)

		request.onupgradeneeded = (event) => {
			const db = request.result
			if (event.oldVersion < 1) {
				db.createObjectStore(DEXES, { keyPath: 'id' })
				db.createObjectStore(ENTRIES, { keyPath: ['dexId', 'pokemonId'] })
				db.createObjectStore(META)
			}
		}
		request.onsuccess = () => resolve(request.result)
		request.onerror = () => reject(request.error)
	})
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
	return new Promise((resolve, reject) => {
		request.onsuccess = () => resolve(request.result)
		request.onerror = () => reject(request.error)
	})
}
