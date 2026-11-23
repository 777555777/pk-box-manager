import { describe, expect, it, vi } from 'vitest'
import { requestPersistentStorage } from './persist.ts'

function storageManager(persisted: boolean, grant: boolean) {
	return {
		persisted: vi.fn().mockResolvedValue(persisted),
		persist: vi.fn().mockResolvedValue(grant)
	}
}

describe('requestPersistentStorage', () => {
	it('does not ask again when storage is already persisted', async () => {
		const storage = storageManager(true, false)

		expect(await requestPersistentStorage(storage)).toBe('persisted')
		expect(storage.persist).not.toHaveBeenCalled()
	})

	it('asks the browser and reports the answer', async () => {
		expect(await requestPersistentStorage(storageManager(false, true))).toBe('persisted')
		expect(await requestPersistentStorage(storageManager(false, false))).toBe('denied')
	})

	it('handles browsers without the API or with errors', async () => {
		expect(await requestPersistentStorage(undefined)).toBe('unsupported')
		expect(await requestPersistentStorage({} as never)).toBe('unsupported')
		expect(
			await requestPersistentStorage({
				persisted: vi.fn().mockRejectedValue(new Error('SecurityError')),
				persist: vi.fn()
			})
		).toBe('unsupported')
	})
})
