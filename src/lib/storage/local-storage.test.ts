import { afterEach, describe, expect, it } from 'vitest'
import { getLocalStorage } from './local-storage.ts'

const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')!

afterEach(() => {
	Object.defineProperty(globalThis, 'localStorage', original)
})

describe('getLocalStorage', () => {
	it('returns localStorage when it is accessible', () => {
		expect(getLocalStorage()).toBe(localStorage)
	})

	it('returns null when the browser blocks access', () => {
		Object.defineProperty(globalThis, 'localStorage', {
			configurable: true,
			get() {
				throw new DOMException('blocked', 'SecurityError')
			}
		})

		expect(getLocalStorage()).toBeNull()
	})
})
