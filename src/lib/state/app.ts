/**
 * App wiring: the dex store singleton and the async start sequence
 * (open IndexedDB → migrate v1 data → load dexes). Persistent storage is requested
 * on the first change of the user, not on start (see askForPersistentStorage).
 */
import { DexStore } from './dex-store.svelte.ts'
import { appState } from './app-state.svelte.ts'
import { loadSelectedDexId, saveSelectedDexId } from './settings-storage.ts'
import { openIndexedDbRepository } from '../storage/indexeddb-repository.ts'
import { createMemoryRepository } from '../storage/memory-repository.ts'
import { migrateFromV1 } from '../storage/migrate-v1.ts'
import { requestPersistentStorageOnce } from '../storage/persist.ts'
import type { DexRepository } from '../storage/repository.ts'
import { storageStatus } from './storage-status.svelte.ts'
import { getLocalStorage } from '../storage/local-storage.ts'

export const dexStore = new DexStore({
	getAppDefaults: () => appState.getAppDefaults(),
	selection: { load: loadSelectedDexId, save: saveSelectedDexId },
	onUserChange: askForPersistentStorage
})

let persistenceAsked = false

/**
 * Asks the browser once (ever) for persistent storage, on the user's first change.
 * Firefox shows a prompt for this; right after saving something it is clear why.
 */
function askForPersistentStorage() {
	if (persistenceAsked) return
	persistenceAsked = true
	void requestPersistentStorageOnce()?.then((state) => console.info('Persistent storage:', state))
}

let started: Promise<void> | null = null

/** Starts the app once. Later calls return the same promise. */
export function startApp(): Promise<void> {
	started ??= start()
	return started
}

async function start(): Promise<void> {
	const { repository, persistent } = await openRepository()
	storageStatus.persistent = persistent

	// all site storage blocked: no v1 data is reachable, skip the migration
	const v1Source = getLocalStorage()
	const migration = v1Source
		? await migrateFromV1(repository, v1Source, { persistent })
		: ({ status: 'fresh' } as const)
	if (migration.status === 'migrated') {
		console.info('Migrated v1 data to IndexedDB:', migration.info)
		storageStatus.skippedV1 = migration.info.skipped
	} else if (migration.status === 'up-to-date') {
		if (migration.recovered.length > 0) console.info('Recovered v1 data:', migration.recovered)
		storageStatus.skippedV1 = migration.skipped
	}

	await dexStore.init(repository)

	// changes are written right away; this only covers the last tick before leaving
	addEventListener('pagehide', () => void dexStore.flush())
	document.addEventListener('visibilitychange', () => {
		if (document.visibilityState === 'hidden') void dexStore.flush()
	})
}

async function openRepository(): Promise<{ repository: DexRepository; persistent: boolean }> {
	try {
		return { repository: await openIndexedDbRepository(), persistent: true }
	} catch (error) {
		// e.g. storage disabled by the browser: the app stays usable, the UI warns
		// that changes are not kept (pk-storage-notice)
		console.error('IndexedDB is not available, changes will not be saved:', error)
		return { repository: createMemoryRepository(), persistent: false }
	}
}
