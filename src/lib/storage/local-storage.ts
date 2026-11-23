/**
 * `localStorage` itself can throw (SecurityError) when the browser blocks all
 * site storage. Use this instead of the global wherever that would break the app.
 */
export function getLocalStorage(): Storage | null {
	try {
		return globalThis.localStorage ?? null
	} catch {
		return null
	}
}
