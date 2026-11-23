import { describe, expect, it, vi } from 'vitest'
import { migrateFromV1, V1_MIGRATED_MARKER } from './migrate-v1.ts'
import { createMemoryRepository } from './memory-repository.ts'
import { convertV1Save } from '../dex/v1/convert-v1.ts'
import { parseV1Save } from '../dex/v1/v1-save.ts'
import type { DexRepository } from './repository.ts'
import {
	V1_DEX_FIXTURES,
	readRealExports,
	readV1DexRaw,
	seedV1LocalStorage
} from '../../../tests/helpers/v1-fixtures.ts'
import {
	makeDex,
	openFakeIndexedDbRepository,
	repositoryImplementations
} from '../../../tests/helpers/dex-builders.ts'

const NOW = 1_800_000_000_000
const now = () => NOW

function snapshotLocalStorage() {
	return { ...localStorage } as Record<string, string>
}

describe.each(repositoryImplementations)('migrateFromV1 with %s repository', (_, open) => {
	it('migrates a complete v1 session', async () => {
		const ids = seedV1LocalStorage()
		const repository = await open()

		const result = await migrateFromV1(repository, localStorage, { now })

		expect(result).toMatchObject({
			status: 'migrated',
			info: { migratedAt: NOW, dexIds: Object.values(ids).sort(), skipped: [] }
		})
		expect(await repository.getMeta('schemaVersion')).toBe(2)
		expect(await repository.getMeta('v1Migration')).toEqual(
			result.status === 'migrated' ? result.info : undefined
		)

		// every dex ends up exactly as convertV1Save produces it
		for (const name of V1_DEX_FIXTURES) {
			const expected = convertV1Save(parseV1Save(readV1DexRaw(name)))
			expect(await repository.getDex(expected.dex.id)).toEqual(expected.dex)
			expect(await repository.getEntries(expected.dex.id)).toEqual(
				[...expected.entries].sort((a, b) => (a.pokemonId < b.pokemonId ? -1 : 1))
			)
		}
		repository.close()
	})

	it('keeps the v1 data and only adds a marker', async () => {
		seedV1LocalStorage()
		const before = snapshotLocalStorage()
		const repository = await open()

		await migrateFromV1(repository, localStorage, { now })

		expect(snapshotLocalStorage()).toEqual({ ...before, [V1_MIGRATED_MARKER]: String(NOW) })
		repository.close()
	})

	it('runs only once', async () => {
		seedV1LocalStorage()
		const repository = await open()
		await migrateFromV1(repository, localStorage, { now })
		await repository.write({ putDexes: [makeDex('created-after-migration')] })

		expect(await migrateFromV1(repository, localStorage, { now })).toEqual({
			status: 'up-to-date',
			skipped: [],
			recovered: []
		})
		expect(await repository.listDexes()).toHaveLength(5)
		repository.close()
	})

	it('marks fresh installs as up to date without writing dexes', async () => {
		localStorage.setItem('appSettings', '{}')
		const repository = await open()

		expect(await migrateFromV1(repository, localStorage, { now })).toEqual({ status: 'fresh' })
		expect(await repository.getMeta('schemaVersion')).toBe(2)
		expect(await repository.listDexes()).toEqual([])
		expect(localStorage.getItem(V1_MIGRATED_MARKER)).toBeNull()
		repository.close()
	})

	it('skips broken saves and migrates the rest', async () => {
		const ids = seedV1LocalStorage()
		localStorage.setItem('dex:broken-json', '{ nope')
		localStorage.setItem('dex:not-a-dex', JSON.stringify({ hello: 'world' }))
		const repository = await open()

		const result = await migrateFromV1(repository, localStorage, { now })

		expect(result.status).toBe('migrated')
		if (result.status !== 'migrated') return
		expect(result.info.dexIds).toHaveLength(4)
		expect(result.info.skipped).toEqual([
			{ key: 'dex:broken-json', error: 'The v1 save does not contain valid JSON.' },
			{ key: 'dex:not-a-dex', error: expect.stringContaining('Invalid v1 save') }
		])
		expect(await repository.getDex(ids.gen1Filled)).toBeDefined()
		repository.close()
	})
})

describe('migrateFromV1 – skipped saves (review S1/S2)', () => {
	it('retries skipped saves on later starts and adds them once they can be read', async () => {
		const ids = seedV1LocalStorage()
		const raw = localStorage.getItem(`dex:${ids.gen3}`)!
		localStorage.setItem(`dex:${ids.gen3}`, '{ broken')
		const repository = createMemoryRepository()
		await migrateFromV1(repository, localStorage, { now })

		// still broken on the next start
		expect(await migrateFromV1(repository, localStorage, { now })).toMatchObject({
			status: 'up-to-date',
			skipped: [{ key: `dex:${ids.gen3}` }],
			recovered: []
		})

		// readable again (e.g. a newer parser after an app update)
		localStorage.setItem(`dex:${ids.gen3}`, raw)
		const result = await migrateFromV1(repository, localStorage, { now })

		expect(result).toEqual({ status: 'up-to-date', skipped: [], recovered: [ids.gen3] })
		expect((await repository.getDex(ids.gen3))?.isDefault).toBe(false)
		expect((await repository.getMeta('v1Migration'))?.skipped).toEqual([])
		expect((await repository.getMeta('v1Migration'))?.dexIds).toContain(ids.gen3)
	})

	it('never overwrites a v2 dex with a recovered v1 save', async () => {
		const ids = seedV1LocalStorage()
		const raw = localStorage.getItem(`dex:${ids.gen3}`)!
		localStorage.setItem(`dex:${ids.gen3}`, '{ broken')
		const repository = createMemoryRepository()
		await migrateFromV1(repository, localStorage, { now })
		await repository.write({ putDexes: [makeDex(ids.gen3, { name: 'Created in v2' })] })

		localStorage.setItem(`dex:${ids.gen3}`, raw)
		await migrateFromV1(repository, localStorage, { now })

		expect((await repository.getDex(ids.gen3))?.name).toBe('Created in v2')
	})

	it('does not set the marker when nothing was stored for good', async () => {
		seedV1LocalStorage()

		await migrateFromV1(createMemoryRepository(), localStorage, { now, persistent: false })

		expect(localStorage.getItem(V1_MIGRATED_MARKER)).toBeNull()
	})
})

describe('migrateFromV1', () => {
	it('stores nothing when writing fails, so the next start retries', async () => {
		seedV1LocalStorage()
		const repository = createMemoryRepository()
		const failing: DexRepository = {
			...repository,
			write: vi.fn().mockRejectedValue(new Error('QuotaExceededError'))
		}

		await expect(migrateFromV1(failing, localStorage, { now })).rejects.toThrow(
			'QuotaExceededError'
		)
		expect(await repository.getMeta('schemaVersion')).toBeUndefined()
		expect(localStorage.getItem(V1_MIGRATED_MARKER)).toBeNull()

		const retry = await migrateFromV1(repository, localStorage, { now })
		expect(retry.status).toBe('migrated')
	})

	it('keeps at most one default dex', async () => {
		seedV1LocalStorage()
		const second = JSON.parse(readV1DexRaw('national-all-tags-legacy'))
		second.id = 'preset-national-normal-copy'
		localStorage.setItem(`dex:${second.id}`, JSON.stringify(second))
		const repository = createMemoryRepository()

		await migrateFromV1(repository, localStorage, { now })

		const defaults = (await repository.listDexes()).filter((dex) => dex.isDefault)
		expect(defaults).toHaveLength(1)
	})

	it('returns the conversion reports per dex', async () => {
		const ids = seedV1LocalStorage()

		const result = await migrateFromV1(createMemoryRepository(), localStorage, { now })

		expect(result.status === 'migrated' && Object.keys(result.reports).sort()).toEqual(
			Object.values(ids).sort()
		)
	})

	const realExports = readRealExports()
	it.skipIf(realExports.length === 0)('migrates the real exports into IndexedDB', async () => {
		for (const { raw } of realExports) {
			localStorage.setItem(`dex:${JSON.parse(raw).id}`, raw)
		}
		const repository = await openFakeIndexedDbRepository()

		const result = await migrateFromV1(repository, localStorage, { now })

		expect(result.status === 'migrated' && result.info.skipped).toEqual([])
		for (const { raw } of realExports) {
			const original = JSON.parse(raw)
			const dex = await repository.getDex(original.id)
			const entries = await repository.getEntries(original.id)
			expect(dex?.stats.caught).toBe(original.meta.totalCaught)
			expect(entries.filter((e) => e.captured)).toHaveLength(original.meta.totalCaught)
		}
		repository.close()
	})
})
