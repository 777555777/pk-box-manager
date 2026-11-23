/**
 * App wiring: the dex store singleton and the async start sequence
 * (open IndexedDB → migrate v1 data → load dexes).
 */
import { DexStore } from './dex-store.svelte.ts'
import { appState } from './app-state.svelte.ts'
import { loadSelectedDexId, saveSelectedDexId } from './settings-storage.ts'
import { openIndexedDbRepository } from '../storage/indexeddb-repository.ts'
import { createMemoryRepository } from '../storage/memory-repository.ts'
import { migrateFromV1 } from '../storage/migrate-v1.ts'
import { requestPersistentStorage } from '../storage/persist.ts'
import type { DexRepository } from '../storage/repository.ts'

export const dexStore = new DexStore({
	getAppDefaults: () => appState.getAppDefaults(),
	selection: { load: loadSelectedDexId, save: saveSelectedDexId }
})

let started: Promise<void> | null = null

/** Starts the app once. Later calls return the same promise. */
export function startApp(): Promise<void> {
	started ??= start()
	return started
}

async function start(): Promise<void> {
	const repository = await openRepository()

	const migration = await migrateFromV1(repository)
	if (migration.status === 'migrated') {
		console.info('Migrated v1 data to IndexedDB:', migration.info)
	}

	void requestPersistentStorage()
	await dexStore.init(repository)

	// changes are written right away; this only covers the last tick before leaving
	addEventListener('pagehide', () => void dexStore.flush())
	document.addEventListener('visibilitychange', () => {
		if (document.visibilityState === 'hidden') void dexStore.flush()
	})
}

async function openRepository(): Promise<DexRepository> {
	try {
		return await openIndexedDbRepository()
	} catch (error) {
		// e.g. storage disabled by the browser: the app stays usable, changes are not kept
		console.error('IndexedDB is not available, changes will not be saved:', error)
		return createMemoryRepository()
	}
}
