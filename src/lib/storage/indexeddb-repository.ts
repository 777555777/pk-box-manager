/**
 * IndexedDB implementation of the DexRepository, using only the native API.
 *
 * Stores:
 * - `dexes`   keyPath `id`
 * - `entries` keyPath `[dexId, pokemonId]` → all entries of a dex are one key range
 * - `meta`    out-of-line keys (`schemaVersion`, `v1Migration`)
 *
 * The connection is reopened automatically when it gets closed (see `connection`).
 */
import {
	assertValidBatch,
	StorageClearedError,
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

	const name = options.name ?? DB_NAME
	let db: IDBDatabase | null = null
	let opening: Promise<IDBDatabase> | null = null
	let closedByCaller = false
	let everOpened = false
	/** Set when the database vanished while the app was running (see connection). */
	let cleared = false

	/**
	 * The open connection. Reopens it when it was closed in the meantime:
	 * another tab deleted/upgraded the database (`versionchange`) or the browser
	 * dropped the connection (`close`, e.g. WebKit after a long time in background).
	 */
	function connection(): Promise<IDBDatabase> {
		if (closedByCaller) return Promise.reject(new Error('The storage was closed.'))
		if (cleared) return Promise.reject(new StorageClearedError())
		if (db) return Promise.resolve(db)
		opening ??= openDatabase(factory!, name)
			.then(({ db: opened, created }) => {
				// Reopening had to create the database from scratch: it was deleted while the
				// app was running (DevTools, another tab, browser eviction). Writing on would
				// report "saved" for a database that lost all other dexes, so fail loudly instead.
				if (everOpened && created) {
					cleared = true
					opened.close()
					throw new StorageClearedError()
				}
				everOpened = true
				const forget = () => {
					if (db === opened) db = null
				}
				opened.onversionchange = () => {
					opened.close()
					forget()
				}
				opened.onclose = forget
				db = opened
				return opened
			})
			.finally(() => (opening = null))
		return opening
	}

	async function transaction(stores: string | string[], mode: IDBTransactionMode) {
		const current = await connection()
		try {
			return current.transaction(stores, mode)
		} catch (error) {
			// the connection was closed without an event reaching us: reopen once
			if ((error as { name?: string } | null)?.name !== 'InvalidStateError') throw error
			if (db === current) db = null
			return (await connection()).transaction(stores, mode)
		}
	}

	// fail early (e.g. storage disabled), like before the lazy reconnect
	await connection()

	// [dexId] < [dexId, any string] < [dexId, []] because arrays sort after strings
	const entriesOf = (dexId: string) => KeyRange.bound([dexId], [dexId, []])

	async function read<T>(storeName: string, query: (store: IDBObjectStore) => IDBRequest<T>) {
		const tx = await transaction(storeName, 'readonly')
		return requestToPromise(query(tx.objectStore(storeName)))
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
			const tx = await transaction([DEXES, ENTRIES, META], 'readwrite')

			return new Promise<void>((resolve, reject) => {
				const transaction = tx
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

		close: () => {
			closedByCaller = true
			db?.close()
			db = null
		}
	}
}

/** Opens (and if needed creates or upgrades) the database. `created`: it did not exist before. */
function openDatabase(
	factory: IDBFactory,
	name: string
): Promise<{ db: IDBDatabase; created: boolean }> {
	return new Promise((resolve, reject) => {
		const request = factory.open(name, DB_VERSION)
		let created = false

		request.onupgradeneeded = (event) => {
			const db = request.result
			created = event.oldVersion === 0
			if (event.oldVersion < 1) {
				db.createObjectStore(DEXES, { keyPath: 'id' })
				db.createObjectStore(ENTRIES, { keyPath: ['dexId', 'pokemonId'] })
				db.createObjectStore(META)
			}
		}
		request.onsuccess = () => resolve({ db: request.result, created })
		request.onerror = () => reject(request.error)
	})
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
	return new Promise((resolve, reject) => {
		request.onsuccess = () => resolve(request.result)
		request.onerror = () => reject(request.error)
	})
}
