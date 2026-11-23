import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { IDBFactory } from 'fake-indexeddb'
import { StorageClearedError, type DexRepository } from './repository.ts'
import {
	makeDex,
	makeEntry,
	openFakeIndexedDbRepository,
	repositoryImplementations
} from '../../../tests/helpers/dex-builders.ts'

describe.each(repositoryImplementations)('%s repository (contract)', (_, open) => {
	let repository: DexRepository

	beforeEach(async () => {
		repository = await open()
	})

	afterEach(() => {
		repository.close()
	})

	it('starts empty', async () => {
		expect(await repository.listDexes()).toEqual([])
		expect(await repository.getDex('nope')).toBeUndefined()
		expect(await repository.getEntries('nope')).toEqual([])
		expect(await repository.getMeta('schemaVersion')).toBeUndefined()
	})

	it('stores and lists dexes sorted by id', async () => {
		await repository.write({ putDexes: [makeDex('b'), makeDex('a', { isDefault: true })] })

		expect((await repository.listDexes()).map((dex) => dex.id)).toEqual(['a', 'b'])
		expect(await repository.getDex('a')).toEqual(makeDex('a', { isDefault: true }))
	})

	it('replaces dexes with the same id', async () => {
		await repository.write({ putDexes: [makeDex('a')] })
		await repository.write({ putDexes: [makeDex('a', { name: 'Neu' })] })

		expect(await repository.listDexes()).toEqual([makeDex('a', { name: 'Neu' })])
	})

	it('returns only the entries of the requested dex, sorted by pokemon id', async () => {
		await repository.write({
			putEntries: [
				makeEntry('dex-1', '0004-charmander'),
				makeEntry('dex-1', '0001-bulbasaur'),
				makeEntry('dex-10', '0001-bulbasaur'),
				makeEntry('dex', '0007-squirtle')
			]
		})

		const entries = await repository.getEntries('dex-1')
		expect(entries.map((e) => [e.dexId, e.pokemonId])).toEqual([
			['dex-1', '0001-bulbasaur'],
			['dex-1', '0004-charmander']
		])
		expect(await repository.getEntries('dex-10')).toHaveLength(1)
	})

	it('replaces entries with the same dex and pokemon', async () => {
		await repository.write({ putEntries: [makeEntry('d', '0001-bulbasaur')] })
		await repository.write({
			putEntries: [makeEntry('d', '0001-bulbasaur', { comment: 'Ü ✨', ribbons: ['r'] })]
		})

		expect(await repository.getEntries('d')).toEqual([
			makeEntry('d', '0001-bulbasaur', { comment: 'Ü ✨', ribbons: ['r'] })
		])
	})

	it('deletes single entries', async () => {
		await repository.write({
			putEntries: [makeEntry('d', 'a'), makeEntry('d', 'b'), makeEntry('d', 'c')]
		})
		await repository.write({
			deleteEntries: [
				{ dexId: 'd', pokemonIds: ['a', 'c', 'missing'] },
				{ dexId: 'unknown', pokemonIds: ['a'] }
			]
		})

		expect((await repository.getEntries('d')).map((e) => e.pokemonId)).toEqual(['b'])
	})

	it('deletes a dex together with its entries only', async () => {
		await repository.write({
			putDexes: [makeDex('dex-1'), makeDex('dex-10')],
			putEntries: [makeEntry('dex-1', 'a'), makeEntry('dex-10', 'a')]
		})
		await repository.write({ deleteDexes: ['dex-1'] })

		expect((await repository.listDexes()).map((dex) => dex.id)).toEqual(['dex-10'])
		expect(await repository.getEntries('dex-1')).toEqual([])
		expect(await repository.getEntries('dex-10')).toHaveLength(1)
	})

	it('replaces a dex completely within one batch', async () => {
		await repository.write({
			putDexes: [makeDex('d')],
			putEntries: [makeEntry('d', 'old')]
		})
		await repository.write({
			deleteDexes: ['d'],
			putDexes: [makeDex('d', { name: 'Import' })],
			putEntries: [makeEntry('d', 'new')]
		})

		expect((await repository.getDex('d'))?.name).toBe('Import')
		expect((await repository.getEntries('d')).map((e) => e.pokemonId)).toEqual(['new'])
	})

	it('merges meta keys', async () => {
		const info = { migratedAt: 5, dexIds: ['a'], skipped: [] }
		await repository.write({ setMeta: { schemaVersion: 2 } })
		await repository.write({ setMeta: { v1Migration: info } })

		expect(await repository.getMeta('schemaVersion')).toBe(2)
		expect(await repository.getMeta('v1Migration')).toEqual(info)
	})

	it('returns copies that do not change the stored data', async () => {
		const dex = makeDex('a')
		await repository.write({ putDexes: [dex], putEntries: [makeEntry('a', 'x')] })
		dex.name = 'changed after write'

		const stored = (await repository.getDex('a'))!
		stored.stats.caught = 99
		const [entry] = await repository.getEntries('a')
		entry.ribbons.push('changed after read')

		expect(await repository.getDex('a')).toEqual(makeDex('a'))
		expect((await repository.getEntries('a'))[0].ribbons).toEqual([])
	})

	it('rejects entries without keys and writes nothing of the batch', async () => {
		const batch = {
			putDexes: [makeDex('a')],
			putEntries: [makeEntry('a', 'x'), makeEntry('a', '')]
		}

		await expect(repository.write(batch)).rejects.toThrow('without pokemonId')
		expect(await repository.listDexes()).toEqual([])
		expect(await repository.getEntries('a')).toEqual([])
	})

	it('rejects values that cannot be stored and writes nothing of the batch', async () => {
		const notCloneable = makeDex('b', { name: (() => 'proxy') as unknown as string })

		await expect(
			repository.write({ putDexes: [makeDex('a'), notCloneable], setMeta: { schemaVersion: 2 } })
		).rejects.toThrow()
		expect(await repository.listDexes()).toEqual([])
		expect(await repository.getMeta('schemaVersion')).toBeUndefined()
	})
})

describe('indexeddb repository', () => {
	it('keeps the data when the database is opened again', async () => {
		const factory = new IDBFactory()
		const first = await openFakeIndexedDbRepository(factory, 'persist')
		await first.write({
			putDexes: [makeDex('a')],
			putEntries: [makeEntry('a', 'x')],
			setMeta: { schemaVersion: 2 }
		})
		first.close()

		const second = await openFakeIndexedDbRepository(factory, 'persist')
		expect(await second.getDex('a')).toEqual(makeDex('a'))
		expect(await second.getEntries('a')).toHaveLength(1)
		expect(await second.getMeta('schemaVersion')).toBe(2)
		second.close()
	})

	it('fails loudly when the database was deleted while the app was open (review NEU-1)', async () => {
		const factory = new IDBFactory()
		const repository = await openFakeIndexedDbRepository(factory, 'cleared')
		await repository.write({ putDexes: [makeDex('a'), makeDex('b')] })

		// e.g. DevTools, another tab or eviction: our connection gets a versionchange event
		await new Promise((resolve, reject) => {
			const request = factory.deleteDatabase('cleared')
			request.onsuccess = resolve
			request.onerror = reject
		})

		await expect(repository.write({ putDexes: [makeDex('c')] })).rejects.toThrow(
			StorageClearedError
		)
		await expect(repository.listDexes()).rejects.toThrow(StorageClearedError)
		repository.close()
	})

	it('reopens a connection that was closed while the database still exists', async () => {
		const factory = new IDBFactory()
		const repository = await openFakeIndexedDbRepository(factory, 'reopen')
		await repository.write({ putDexes: [makeDex('a')] })

		// another tab opens the same database with a newer version → versionchange closes ours
		await new Promise((resolve, reject) => {
			const request = factory.open('reopen', 2)
			request.onsuccess = () => {
				request.result.close()
				resolve(null)
			}
			request.onerror = reject
		})

		// our version (1) is outdated now: reopening fails instead of writing silently
		await expect(repository.write({ putDexes: [makeDex('b')] })).rejects.toThrow()
		repository.close()
	})

	it('rejects operations after close()', async () => {
		const repository = await openFakeIndexedDbRepository()
		repository.close()

		await expect(repository.listDexes()).rejects.toThrow('The storage was closed.')
	})

	it('fails with a clear message when IndexedDB is not available', async () => {
		const { openIndexedDbRepository } = await import('./indexeddb-repository.ts')

		await expect(openIndexedDbRepository({ factory: undefined })).rejects.toThrow(
			'IndexedDB is not available in this browser.'
		)
	})
})
