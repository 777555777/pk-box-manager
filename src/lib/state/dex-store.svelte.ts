/**
 * Reactive state of all dexes and the active dex (v2 data model).
 *
 * The in-memory state is the single source of truth. Every change is applied
 * synchronously and queued; the queue is written to the repository once per
 * tick (microtask). All writes run strictly one after another.
 * See docs/data-model-v2.md, section "Laufzeit".
 */
import { catalog as defaultCatalog, DEFAULT_WALLPAPER, type Catalog } from '../catalog/catalog.ts'
import type { BoxTag, PokemonId, ResolvedBox } from '../catalog/types.ts'
import { computeStats } from '../dex/stats.ts'
import { emptyEntryData, type DexEntry, type DexRecord, type EntryData } from '../dex/types.ts'
import type { PokemonEntry } from '../models/data-models.ts'
import type { DexRepository, WriteBatch } from '../storage/repository.ts'

export const NULL_POKEMON_ID = '0000-null'
const NULL_POKEMON_ENTRY: PokemonEntry = { pokemonid: 'null', formid: null, id_national: 0 }

/** Everything the UI needs to show one pokemon of the active dex. */
export interface PokemonView extends EntryData {
	pokemonId: PokemonId
	idEntry: PokemonEntry
	/** v1: isCustomized. False → the pokemon was never touched. */
	hasEntry: boolean
}

export interface NewDexOptions {
	presetId: string
	tags: BoxTag[]
	name: string
}

/** A dex plus its entries, as produced by an import. */
export interface DexData {
	dex: DexRecord
	entries: DexEntry[]
}

export interface DexStoreOptions {
	catalog?: Catalog
	now?: () => number
	createId?: () => string
	/** Values applied when a pokemon is edited for the first time. */
	getAppDefaults?: () => Partial<EntryData>
	/** Remembers the active dex across reloads. */
	selection?: { load(): string | null; save(dexId: string): void }
	onPersistError?: (error: unknown) => void
	/**
	 * Called synchronously on every change made by the user (not on loading),
	 * i.e. still inside the click/input handler that caused it.
	 */
	onUserChange?: () => void
	/** First retry after a failed write (doubles up to 30 s). */
	retryDelayMs?: number
}

const MAX_RETRY_DELAY_MS = 30_000

/** Queued changes that are not stored yet. */
interface PendingChanges {
	/** Dexes to delete together with all their entries, before anything is put. */
	deletes: Set<string>
	dexes: Map<string, DexRecord>
	/** Key: dexId + NUL + pokemonId. Without `entry` the entry gets deleted. */
	entries: Map<string, { dexId: string; pokemonId: PokemonId; entry?: DexEntry }>
}

const ENTRY_DATA_KEYS = Object.keys(emptyEntryData()) as (keyof EntryData)[]

export class DexStore {
	// configuration (declared first: the derived fields below use it)
	#repository: DexRepository | null = null
	#catalog: Catalog = defaultCatalog
	#now: () => number
	#createId: () => string
	#getAppDefaults: () => Partial<EntryData>
	#selection: NonNullable<DexStoreOptions['selection']>
	#onPersistError: (error: unknown) => void
	#onUserChange: () => void
	#initialRetryDelay: number

	/** All dexes (default first, then by creation). */
	dexes: DexRecord[] = $state([])
	activeId = $state('')
	selectedId: PokemonId | null = $state(null)
	/** Last error while saving, `null` when everything is stored. */
	persistError: unknown = $state(null)

	#entries: Record<PokemonId, DexEntry> = $state({})

	active: DexRecord | undefined = $derived(this.dexes.find((dex) => dex.id === this.activeId))
	boxes: ResolvedBox[] = $derived(
		this.active ? this.#catalog.resolveLayout(this.active.layout, this.active.boxSettings) : []
	)
	#layoutIds: Set<PokemonId> = $derived(
		// recreated by the derived, never mutated → no SvelteSet needed
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		new Set(
			this.boxes.flatMap((box) => box.slots.filter((slot): slot is PokemonId => slot !== null))
		)
	)

	// write queue: internal bookkeeping, intentionally not reactive
	#pending: PendingChanges = emptyPending()
	#flushScheduled = false
	#writeChain: Promise<unknown> = Promise.resolve()
	#retryTimer: ReturnType<typeof setTimeout> | null = null
	#retryDelay = 0

	constructor(options: DexStoreOptions = {}) {
		this.#catalog = options.catalog ?? defaultCatalog
		this.#now = options.now ?? Date.now
		this.#createId = options.createId ?? (() => crypto.randomUUID())
		this.#getAppDefaults = options.getAppDefaults ?? (() => ({}))
		this.#selection = options.selection ?? { load: () => null, save: () => {} }
		this.#onPersistError =
			options.onPersistError ?? ((error) => console.error('Saving failed:', error))
		this.#onUserChange = options.onUserChange ?? (() => {})
		this.#initialRetryDelay = options.retryDelayMs ?? 1000
		this.#retryDelay = this.#initialRetryDelay
	}

	// ================
	// Lifecycle
	// ================

	/** Loads all dexes and activates the remembered one. Creates the default dex on first start. */
	async init(repository: DexRepository): Promise<void> {
		this.#repository = repository
		let dexes = await repository.listDexes()

		if (dexes.length === 0) {
			const dex = this.#newDex({
				presetId: 'national',
				tags: this.#catalog.allTags(),
				name: 'National Dex'
			})
			dex.isDefault = true
			await this.#write({ putDexes: [dex] })
			dexes = [dex]
		}

		this.dexes = sortDexes(dexes)
		this.#ensureDefault()
		const remembered = this.#selection.load()
		const target =
			this.dexes.find((dex) => dex.id === remembered) ??
			this.dexes.find((dex) => dex.isDefault) ??
			this.dexes[0]
		await this.#activate(target.id)
	}

	/**
	 * Writes all queued changes. Never rejects: failures are reported via
	 * `persistError`, the changes stay queued and are retried automatically.
	 */
	flush(): Promise<void> {
		return this.#flushStrict().catch(() => {})
	}

	/** True while changes are waiting to be stored (e.g. after a failed write). */
	get hasUnsavedChanges(): boolean {
		return !isEmpty(this.#pending)
	}

	/** Manual retry (e.g. from a "try again" button). */
	async retrySaving(): Promise<void> {
		await this.flush()
		// a failed dex operation (create/import) leaves nothing queued: clear its message
		if (!this.hasUnsavedChanges) this.persistError = null
	}

	// ================
	// Pokemon
	// ================

	getPokemon(pokemonId: PokemonId): PokemonView {
		const entry = this.#entries[pokemonId]
		const data = entry ?? emptyEntryData()
		const view = {
			pokemonId,
			idEntry: this.#catalog.getPokemonEntry(pokemonId) ?? NULL_POKEMON_ENTRY,
			hasEntry: entry !== undefined
		} as PokemonView
		for (const key of ENTRY_DATA_KEYS) (view as unknown as Record<string, unknown>)[key] = data[key]
		return view
	}

	/** The selected pokemon, or a placeholder (`NULL_POKEMON_ID`) when nothing is selected. */
	get selected(): PokemonView {
		return this.getPokemon(this.selectedId ?? NULL_POKEMON_ID)
	}

	select(pokemonId: PokemonId): void {
		this.#assertInLayout(pokemonId)
		this.selectedId = pokemonId
	}

	deselect(): void {
		this.selectedId = null
	}

	/**
	 * Edits a pokemon (v1 semantics):
	 * - the first edit applies the app defaults
	 * - editing anything but `captured` marks the pokemon as caught
	 */
	updatePokemon(pokemonId: PokemonId, changes: Partial<EntryData>): void {
		this.#assertInLayout(pokemonId)
		const dex = this.#requireActive()
		const existing = this.#entries[pokemonId]

		const update = pickEntryData($state.snapshot(changes))
		if (Object.keys(update).length > 0 && !('captured' in update)) update.captured = true

		const base: EntryData = existing
			? (pickEntryData($state.snapshot(existing)) as EntryData)
			: { ...emptyEntryData(), ...pickEntryData($state.snapshot(this.#getAppDefaults())) }

		const entry: DexEntry = {
			dexId: dex.id,
			pokemonId,
			...base,
			...update,
			updatedAt: this.#now()
		}
		this.#setEntry(pokemonId, entry)
	}

	toggleRibbon(pokemonId: PokemonId, ribbonId: string): void {
		this.updatePokemon(pokemonId, { ribbons: toggle(this.getPokemon(pokemonId).ribbons, ribbonId) })
	}

	toggleMark(pokemonId: PokemonId, markId: string): void {
		this.updatePokemon(pokemonId, { marks: toggle(this.getPokemon(pokemonId).marks, markId) })
	}

	/** Removes all data of a pokemon (back to "never touched"). */
	resetPokemon(pokemonId: PokemonId): void {
		this.#assertInLayout(pokemonId)
		if (this.#entries[pokemonId]) this.#setEntry(pokemonId, undefined)
	}

	// ================
	// Boxes and dex settings
	// ================

	updateBoxWallpaper(boxId: string, wallpaper: string): void {
		const dex = this.#requireActive()
		const settings = { ...dex.boxSettings }
		if (wallpaper === DEFAULT_WALLPAPER) {
			delete settings[boxId]
		} else {
			settings[boxId] = { ...settings[boxId], wallpaper }
		}
		dex.boxSettings = settings
		this.#touch(dex)
	}

	renameDex(dexId: string, name: string): void {
		const trimmed = name.trim()
		const dex = this.#requireDex(dexId)
		if (!trimmed || trimmed === dex.name) return
		dex.name = trimmed
		this.#touch(dex)
	}

	// ================
	// Dex management
	// ================

	hasDex(dexId: string): boolean {
		return this.dexes.some((dex) => dex.id === dexId)
	}

	/**
	 * All dex operations first store every queued change. If that fails they are
	 * aborted (nothing in memory is replaced), so no unsaved change gets lost.
	 */
	async switchDex(dexId: string): Promise<void> {
		this.#requireDex(dexId)
		if (dexId === this.activeId) return
		await this.#flushStrict()
		await this.#activate(dexId)
	}

	async createDex(options: NewDexOptions): Promise<string> {
		const dex = this.#newDex(options)
		this.#onUserChange()
		await this.#flushStrict()

		this.#pending.dexes.set(dex.id, structuredClone(dex))
		this.dexes = sortDexes([...this.dexes, dex])
		this.#activateWith(dex.id, [])
		await this.#flushStrict()
		return dex.id
	}

	/** Removes all entries and box settings of a dex. */
	async resetDex(dexId: string): Promise<void> {
		const dex = this.#requireDex(dexId)
		this.#onUserChange()
		await this.#flushStrict()

		// from here on synchronous: memory and queue agree, "reset wins"
		this.#dropPending(dexId)
		dex.boxSettings = {}
		dex.stats = { ...dex.stats, caught: 0, shiny: 0 }
		dex.updatedAt = this.#now()
		if (dexId === this.activeId) {
			this.#entries = {}
			this.selectedId = null
		}
		this.#pending.deletes.add(dexId)
		this.#pending.dexes.set(dexId, $state.snapshot(dex))
		await this.#flushStrict()
	}

	async deleteDex(dexId: string): Promise<void> {
		const dex = this.#requireDex(dexId)
		if (dex.isDefault) throw new Error('The default dex cannot be deleted.')
		if (this.dexes.length <= 1) throw new Error('The last dex cannot be deleted.')
		this.#onUserChange()
		await this.#flushStrict()

		this.#dropPending(dexId)
		this.#pending.deletes.add(dexId)
		this.dexes = this.dexes.filter((d) => d.id !== dexId)
		const written = this.#flushStrict()
		// awaited below; avoid an "unhandled rejection" while activating (review NEU-4)
		written.catch(() => {})

		if (dexId === this.activeId) {
			const fallback = this.dexes.find((d) => d.isDefault) ?? this.dexes[0]
			await this.#activate(fallback.id)
		}
		await written
	}

	/**
	 * Stores an imported dex. An existing dex with the same id is replaced
	 * completely (ask the user first, see `hasDex`). The imported dex becomes active.
	 */
	async importDex({ dex, entries }: DexData): Promise<void> {
		const existing = this.dexes.find((d) => d.id === dex.id)
		const hasOtherDefault = this.dexes.some((d) => d.isDefault && d.id !== dex.id)
		const imported: DexRecord = {
			...structuredClone(dex),
			isDefault: existing ? existing.isDefault : !hasOtherDefault
		}
		const importedEntries = entries.map((entry) => ({ ...structuredClone(entry), dexId: dex.id }))
		this.#onUserChange()
		await this.#flushStrict()

		this.#dropPending(dex.id)
		this.#pending.deletes.add(dex.id)
		this.#pending.dexes.set(dex.id, structuredClone(imported))
		for (const entry of importedEntries) {
			this.#pending.entries.set(entryKey(dex.id, entry.pokemonId), {
				dexId: dex.id,
				pokemonId: entry.pokemonId,
				entry: structuredClone(entry)
			})
		}
		this.dexes = sortDexes([...this.dexes.filter((d) => d.id !== dex.id), imported])
		this.#activateWith(dex.id, importedEntries)
		await this.#flushStrict()
	}

	/**
	 * Current data of a dex, e.g. for an export. Also works while saving fails:
	 * the active dex comes from memory, so an export can rescue unsaved changes.
	 */
	async getDexData(dexId: string): Promise<DexData> {
		const dex = this.#requireDex(dexId)
		await this.flush()
		const entries =
			dexId === this.activeId
				? Object.values($state.snapshot(this.#entries))
				: await this.#requireRepository().getEntries(dexId)
		return {
			dex: $state.snapshot(dex),
			entries: entries.sort((a, b) => (a.pokemonId < b.pokemonId ? -1 : 1))
		}
	}

	// ================
	// Internals
	// ================

	async #activate(dexId: string): Promise<void> {
		const entries = await this.#requireRepository().getEntries(dexId)
		this.#activateWith(dexId, entries)
	}

	#activateWith(dexId: string, entries: DexEntry[]): void {
		this.#entries = Object.fromEntries(entries.map((entry) => [entry.pokemonId, entry]))
		this.activeId = dexId
		this.selectedId = null
		try {
			this.#selection.save(dexId)
		} catch (error) {
			// remembering the selection is a convenience, never a reason to fail
			console.error('Could not remember the selected dex:', error)
		}

		// the catalog may have changed since the last save (e.g. new pokemon in an app update)
		const dex = this.#requireActive()
		const stats = computeStats(this.#layoutIds, entries)
		if (JSON.stringify(stats) !== JSON.stringify(dex.stats)) {
			dex.stats = stats
			this.#queueDex(dex)
		}
	}

	/** v1 always had a default dex; make sure that stays true (e.g. after odd imports). */
	#ensureDefault(): void {
		if (this.dexes.length === 0 || this.dexes.some((dex) => dex.isDefault)) return
		const fallback =
			this.dexes.find(
				(dex) => dex.layout.kind === 'preset' && dex.layout.presetId === 'national'
			) ?? this.dexes[0]
		fallback.isDefault = true
		this.#queueDex(fallback)
		this.dexes = sortDexes(this.dexes)
	}

	#setEntry(pokemonId: PokemonId, entry: DexEntry | undefined): void {
		const dex = this.#requireActive()
		const before = this.#entries[pokemonId]

		if (this.#layoutIds.has(pokemonId)) {
			const caught = Number(entry?.captured ?? false) - Number(before?.captured ?? false)
			const shiny =
				Number(!!entry?.captured && !!entry.shiny) - Number(!!before?.captured && !!before.shiny)
			dex.stats = {
				...dex.stats,
				caught: dex.stats.caught + caught,
				shiny: dex.stats.shiny + shiny
			}
		}

		if (entry) {
			this.#entries[pokemonId] = entry
		} else {
			delete this.#entries[pokemonId]
		}
		this.#pending.entries.set(entryKey(dex.id, pokemonId), {
			dexId: dex.id,
			pokemonId,
			entry: entry && structuredClone(entry)
		})
		this.#touch(dex)
	}

	/** A change made by the user: new timestamp, queue the write. */
	#touch(dex: DexRecord): void {
		dex.updatedAt = this.#now()
		this.#queueDex(dex)
		this.#onUserChange()
	}

	#queueDex(dex: DexRecord): void {
		this.#pending.dexes.set(dex.id, $state.snapshot(dex))
		this.#scheduleFlush()
	}

	/** Forgets queued changes of a dex that is about to be replaced or deleted. */
	#dropPending(dexId: string): void {
		this.#pending.dexes.delete(dexId)
		for (const [key, change] of this.#pending.entries) {
			if (change.dexId === dexId) this.#pending.entries.delete(key)
		}
	}

	#scheduleFlush(): void {
		if (this.#flushScheduled) return
		this.#flushScheduled = true
		queueMicrotask(() => {
			this.#flushScheduled = false
			void this.flush()
		})
	}

	/** Writes the queue. Rejects when the write fails (the changes stay queued). */
	async #flushStrict(): Promise<void> {
		// Wait until no write is in flight anymore: another flush may have taken the
		// queue meanwhile, and its failure puts the changes back (review NEU-2).
		let chain: Promise<unknown>
		do {
			chain = this.#writeChain
			await chain
		} while (chain !== this.#writeChain)
		if (isEmpty(this.#pending)) return

		const taken = this.#pending
		this.#pending = emptyPending()
		await this.#write(toBatch(taken), taken)
	}

	/**
	 * Appends a write to the chain, so writes never overtake each other.
	 * When it fails, `requeue` is put back into the queue (newer changes win).
	 */
	#write(batch: WriteBatch, requeue?: PendingChanges): Promise<void> {
		const repository = this.#requireRepository()
		const run = this.#writeChain
			.then(() => repository.write(batch))
			.then(
				() => this.#markSaved(),
				(error: unknown) => {
					if (requeue) this.#requeue(requeue)
					this.#reportError(error)
					throw error
				}
			)
		this.#writeChain = run.catch(() => {})
		return run
	}

	#requeue(failed: PendingChanges): void {
		for (const dexId of failed.deletes) this.#pending.deletes.add(dexId)
		for (const [dexId, dex] of failed.dexes) {
			if (!this.#pending.dexes.has(dexId)) this.#pending.dexes.set(dexId, dex)
		}
		for (const [key, change] of failed.entries) {
			if (!this.#pending.entries.has(key)) this.#pending.entries.set(key, change)
		}
	}

	#markSaved(): void {
		this.persistError = null
		this.#retryDelay = this.#initialRetryDelay
	}

	#reportError(error: unknown): void {
		this.persistError = error
		this.#onPersistError(error)
		if (isEmpty(this.#pending) || this.#retryTimer) return
		this.#retryTimer = setTimeout(() => {
			this.#retryTimer = null
			void this.flush()
		}, this.#retryDelay)
		this.#retryDelay = Math.min(this.#retryDelay * 2, MAX_RETRY_DELAY_MS)
	}

	#newDex({ presetId, tags, name }: NewDexOptions): DexRecord {
		const layout = { kind: 'preset' as const, presetId, tags: [...tags] }
		const now = this.#now()
		return {
			id: this.#createId(),
			name: name.trim() || this.#catalog.getPreset(presetId)?.name || 'Pokédex',
			coverImage: this.#catalog.getPreset(presetId)?.coverImage ?? '',
			layout,
			boxSettings: {},
			isDefault: false,
			createdAt: now,
			updatedAt: now,
			stats: computeStats(this.#catalog.listPokemonIds(layout), [])
		}
	}

	#assertInLayout(pokemonId: PokemonId): void {
		if (!this.#layoutIds.has(pokemonId)) {
			throw new Error(`Pokemon "${pokemonId}" is not part of the active dex.`)
		}
	}

	#requireActive(): DexRecord {
		const dex = this.active
		if (!dex) throw new Error('No active dex.')
		return dex
	}

	#requireDex(dexId: string): DexRecord {
		const dex = this.dexes.find((d) => d.id === dexId)
		if (!dex) throw new Error(`Dex "${dexId}" does not exist.`)
		return dex
	}

	#requireRepository(): DexRepository {
		if (!this.#repository) throw new Error('DexStore.init() has not been called.')
		return this.#repository
	}
}

function emptyPending(): PendingChanges {
	// internal bookkeeping, intentionally not reactive
	return { deletes: new Set(), dexes: new Map(), entries: new Map() }
}

function isEmpty(pending: PendingChanges): boolean {
	return pending.deletes.size === 0 && pending.dexes.size === 0 && pending.entries.size === 0
}

function toBatch(pending: PendingChanges): WriteBatch {
	const changes = [...pending.entries.values()]
	return {
		deleteDexes: [...pending.deletes],
		putDexes: [...pending.dexes.values()],
		putEntries: changes.flatMap((c) => (c.entry ? [c.entry] : [])),
		deleteEntries: changes
			.filter((c) => !c.entry)
			.map((c) => ({ dexId: c.dexId, pokemonIds: [c.pokemonId] }))
	}
}

function entryKey(dexId: string, pokemonId: PokemonId): string {
	return `${dexId}\u0000${pokemonId}`
}

/** Copies only the known entry fields that are present (drops dexId, ids and unknown keys). */
function pickEntryData(source: Partial<EntryData>): Partial<EntryData> {
	const data: Record<string, unknown> = {}
	for (const key of ENTRY_DATA_KEYS) {
		if (source[key] !== undefined) data[key] = source[key]
	}
	return data as Partial<EntryData>
}

function toggle(values: string[], value: string): string[] {
	return values.includes(value) ? values.filter((v) => v !== value) : [...values, value]
}

function sortDexes(dexes: DexRecord[]): DexRecord[] {
	return [...dexes].sort(
		(a, b) => Number(b.isDefault) - Number(a.isDefault) || a.createdAt - b.createdAt
	)
}
