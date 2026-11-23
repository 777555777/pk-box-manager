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
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	#pendingDexes = new Map<string, DexRecord>()
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	#pendingEntries = new Map<string, { dexId: string; pokemonId: PokemonId; entry?: DexEntry }>()
	#flushScheduled = false
	#writeChain: Promise<unknown> = Promise.resolve()

	constructor(options: DexStoreOptions = {}) {
		this.#catalog = options.catalog ?? defaultCatalog
		this.#now = options.now ?? Date.now
		this.#createId = options.createId ?? (() => crypto.randomUUID())
		this.#getAppDefaults = options.getAppDefaults ?? (() => ({}))
		this.#selection = options.selection ?? { load: () => null, save: () => {} }
		this.#onPersistError =
			options.onPersistError ?? ((error) => console.error('Saving failed:', error))
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
		const remembered = this.#selection.load()
		const target =
			dexes.find((dex) => dex.id === remembered) ??
			dexes.find((dex) => dex.isDefault) ??
			this.dexes[0]
		await this.#activate(target.id)
	}

	/** Writes all queued changes. Resolves when everything written so far is stored. */
	flush(): Promise<void> {
		const batch = this.#takePending()
		if (!batch) return this.#writeChain.then(() => {})
		return this.#write(batch).catch((error) => {
			this.persistError = error
			this.#onPersistError(error)
		})
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

	async switchDex(dexId: string): Promise<void> {
		this.#requireDex(dexId)
		if (dexId === this.activeId) return
		await this.flush()
		await this.#activate(dexId)
	}

	async createDex(options: NewDexOptions): Promise<string> {
		const dex = this.#newDex(options)
		await this.flush()
		await this.#write({ putDexes: [dex] })
		this.dexes = sortDexes([...this.dexes, dex])
		await this.#activate(dex.id)
		return dex.id
	}

	/** Removes all entries and box settings of a dex. */
	async resetDex(dexId: string): Promise<void> {
		const dex = this.#requireDex(dexId)
		await this.flush()

		dex.boxSettings = {}
		dex.stats = { ...dex.stats, caught: 0, shiny: 0 }
		dex.updatedAt = this.#now()
		await this.#write({ deleteDexes: [dexId], putDexes: [$state.snapshot(dex)] })

		if (dexId === this.activeId) {
			this.#entries = {}
			this.selectedId = null
		}
	}

	async deleteDex(dexId: string): Promise<void> {
		const dex = this.#requireDex(dexId)
		if (dex.isDefault) throw new Error('The default dex cannot be deleted.')

		await this.flush()
		await this.#write({ deleteDexes: [dexId] })
		this.dexes = this.dexes.filter((d) => d.id !== dexId)

		if (dexId === this.activeId) {
			const fallback = this.dexes.find((d) => d.isDefault) ?? this.dexes[0]
			await this.#activate(fallback.id)
		}
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

		await this.flush()
		await this.#write({
			deleteDexes: [dex.id],
			putDexes: [imported],
			putEntries: entries.map((entry) => ({ ...structuredClone(entry), dexId: dex.id }))
		})
		this.dexes = sortDexes([...this.dexes.filter((d) => d.id !== dex.id), imported])
		await this.#activate(dex.id)
	}

	/** Current data of a dex, e.g. for an export. */
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
		this.#entries = Object.fromEntries(entries.map((entry) => [entry.pokemonId, entry]))
		this.activeId = dexId
		this.selectedId = null
		this.#selection.save(dexId)

		// the catalog may have changed since the last save (e.g. new pokemon in an app update)
		const dex = this.#requireActive()
		const stats = computeStats(this.#layoutIds, entries)
		if (JSON.stringify(stats) !== JSON.stringify(dex.stats)) {
			dex.stats = stats
			this.#queueDex(dex)
		}
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
		this.#pendingEntries.set(`${dex.id}\u0000${pokemonId}`, {
			dexId: dex.id,
			pokemonId,
			entry: entry && structuredClone(entry)
		})
		this.#touch(dex)
	}

	#touch(dex: DexRecord): void {
		dex.updatedAt = this.#now()
		this.#queueDex(dex)
	}

	#queueDex(dex: DexRecord): void {
		this.#pendingDexes.set(dex.id, $state.snapshot(dex))
		this.#scheduleFlush()
	}

	#scheduleFlush(): void {
		if (this.#flushScheduled) return
		this.#flushScheduled = true
		queueMicrotask(() => {
			this.#flushScheduled = false
			void this.flush()
		})
	}

	#takePending(): WriteBatch | null {
		if (this.#pendingDexes.size === 0 && this.#pendingEntries.size === 0) return null

		const pending = [...this.#pendingEntries.values()]
		const batch: WriteBatch = {
			putDexes: [...this.#pendingDexes.values()],
			putEntries: pending.flatMap((p) => (p.entry ? [p.entry] : [])),
			deleteEntries: pending
				.filter((p) => !p.entry)
				.map((p) => ({ dexId: p.dexId, pokemonIds: [p.pokemonId] }))
		}
		this.#pendingDexes.clear()
		this.#pendingEntries.clear()
		return batch
	}

	/** Appends a write to the chain, so writes never overtake each other. */
	#write(batch: WriteBatch): Promise<void> {
		const repository = this.#requireRepository()
		const run = this.#writeChain.then(() => repository.write(batch))
		this.#writeChain = run.catch(() => {})
		return run
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
