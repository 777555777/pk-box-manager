export type PersistenceState = 'persisted' | 'denied' | 'unsupported'

type StoragePersistence = Pick<StorageManager, 'persist' | 'persisted'>

/** localStorage flag: the automatic request was made once, never prompt automatically again. */
export const PERSIST_REQUESTED_KEY = 'persistentStorageRequested'

/**
 * Asks the browser to keep this site's storage even under storage pressure
 * (and, where the browser supports it, exempts it from automatic eviction).
 * Firefox shows a permission prompt for this, Chromium decides silently.
 * Never throws: persistence is a best-effort safety net for local-only data.
 */
export async function requestPersistentStorage(
	storage: StoragePersistence | undefined = globalThis.navigator?.storage
): Promise<PersistenceState> {
	if (!storage?.persist) return 'unsupported'
	try {
		// persist() is called synchronously (no await before it), so it still runs
		// inside the user gesture when called from an event handler
		const granted = storage.persist()
		return (await granted) ? 'persisted' : 'denied'
	} catch {
		return 'unsupported'
	}
}

/**
 * Requests persistent storage only the first time it is called (ever, per browser).
 * Meant to be called on the user's first change, so a browser prompt appears in a
 * context where it makes sense: right after the user saved something.
 * @returns `null` when the request was already made before.
 */
export function requestPersistentStorageOnce(
	storage: StoragePersistence | undefined = globalThis.navigator?.storage,
	flags: Pick<Storage, 'getItem' | 'setItem'> = localStorage
): Promise<PersistenceState> | null {
	try {
		if (flags.getItem(PERSIST_REQUESTED_KEY) !== null) return null
		flags.setItem(PERSIST_REQUESTED_KEY, String(Date.now()))
	} catch {
		// without a place to remember the request, rather not ask at all than ask repeatedly
		return null
	}
	return requestPersistentStorage(storage)
}
