export type PersistenceState = 'persisted' | 'denied' | 'unsupported'

/**
 * Asks the browser to keep this site's storage even under storage pressure
 * (and, where the browser supports it, exempts it from automatic eviction).
 * Never throws: persistence is a best-effort safety net for local-only data.
 */
export async function requestPersistentStorage(
	storage: Pick<StorageManager, 'persist' | 'persisted'> | undefined = globalThis.navigator?.storage
): Promise<PersistenceState> {
	if (!storage?.persist || !storage.persisted) return 'unsupported'
	try {
		if (await storage.persisted()) return 'persisted'
		return (await storage.persist()) ? 'persisted' : 'denied'
	} catch {
		return 'unsupported'
	}
}
