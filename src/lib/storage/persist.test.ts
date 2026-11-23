import { describe, expect, it, vi } from 'vitest'
import {
	PERSIST_REQUESTED_KEY,
	requestPersistentStorage,
	requestPersistentStorageOnce
} from './persist.ts'

function storageManager(grant: boolean) {
	return {
		persisted: vi.fn().mockResolvedValue(false),
		persist: vi.fn().mockResolvedValue(grant)
	}
}

describe('requestPersistentStorage', () => {
	it('asks the browser and reports the answer', async () => {
		expect(await requestPersistentStorage(storageManager(true))).toBe('persisted')
		expect(await requestPersistentStorage(storageManager(false))).toBe('denied')
	})

	it('calls persist() synchronously to keep the user gesture', () => {
		const storage = storageManager(true)

		void requestPersistentStorage(storage)

		expect(storage.persist).toHaveBeenCalledTimes(1)
	})

	it('handles browsers without the API or with errors', async () => {
		expect(await requestPersistentStorage(undefined)).toBe('unsupported')
		expect(await requestPersistentStorage({} as never)).toBe('unsupported')
		expect(
			await requestPersistentStorage({
				persisted: vi.fn(),
				persist: vi.fn().mockRejectedValue(new Error('SecurityError'))
			})
		).toBe('unsupported')
	})
})

describe('requestPersistentStorageOnce', () => {
	it('asks only the first time and remembers it', async () => {
		const storage = storageManager(false)

		expect(await requestPersistentStorageOnce(storage)).toBe('denied')
		expect(requestPersistentStorageOnce(storage)).toBeNull()
		expect(requestPersistentStorageOnce(storage)).toBeNull()

		expect(storage.persist).toHaveBeenCalledTimes(1)
		expect(localStorage.getItem(PERSIST_REQUESTED_KEY)).not.toBeNull()
	})

	it('does not ask when the flag cannot be stored', () => {
		const storage = storageManager(true)
		const flags = {
			getItem: () => null,
			setItem: () => {
				throw new Error('QuotaExceededError')
			}
		}

		expect(requestPersistentStorageOnce(storage, flags)).toBeNull()
		expect(storage.persist).not.toHaveBeenCalled()
	})

	it('does not ask when localStorage is blocked completely', () => {
		const storage = storageManager(true)

		expect(requestPersistentStorageOnce(storage, null)).toBeNull()
		expect(storage.persist).not.toHaveBeenCalled()
	})
})
