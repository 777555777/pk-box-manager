import { beforeEach } from 'vitest'

/**
 * Minimal in-memory implementation of the Web Storage API for the node test environment.
 *
 * Stored items are kept as own enumerable properties (like in browsers), because the
 * v1 storage handler enumerates keys via `{ ...localStorage }` and `for...in`.
 * The API methods live on the prototype and are therefore not enumerable.
 */
export class MemoryStorage implements Storage {
	[key: string]: unknown

	get length(): number {
		return Object.keys(this).length
	}

	key(index: number): string | null {
		return Object.keys(this)[index] ?? null
	}

	getItem(key: string): string | null {
		return Object.hasOwn(this, key) ? (this[key] as string) : null
	}

	setItem(key: string, value: string): void {
		this[key] = String(value)
	}

	removeItem(key: string): void {
		delete this[key]
	}

	clear(): void {
		for (const key of Object.keys(this)) {
			delete this[key]
		}
	}
}

Object.defineProperty(globalThis, 'localStorage', {
	value: new MemoryStorage(),
	configurable: true,
	writable: true
})

beforeEach(() => {
	localStorage.clear()
})
