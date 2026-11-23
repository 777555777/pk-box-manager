import pokedexBoxes from '../data/pokedex-boxes.json' with { type: 'json' }
import pkStats from '../data/pk-stats.json' with { type: 'json' }
import pokemonAliases from '../data/pokemon-aliases.json' with { type: 'json' }
import { presetDefinitions } from './presets.ts'
import type { PokemonEntry } from '../models/data-models.ts'
import type {
	BoxSettings,
	BoxTag,
	BoxTemplate,
	CustomLayout,
	DexLayout,
	LayoutIssue,
	PokemonId,
	PresetDefinition,
	PresetLayout,
	ResolvedBox
} from './types.ts'

export const BOX_SIZE = 30
export const DEFAULT_WALLPAPER = '01-forest'

/** Tags that only include a box when they are explicitly selected. */
const OPT_IN_TAGS: BoxTag[] = ['gigantamax', 'forms', 'female']

export interface CatalogSources {
	pokemon: Record<PokemonId, { entry: PokemonEntry }>
	boxes: BoxTemplate[]
	presets: PresetDefinition[]
	/** Renamed ids: old id → new id. Chains are followed. */
	aliases?: Record<PokemonId, PokemonId>
}

export type Catalog = ReturnType<typeof createCatalog>

/**
 * Creates a read-only view on the static catalog data. All returned arrays and
 * objects are fresh copies, callers may mutate them freely.
 */
export function createCatalog(sources: CatalogSources) {
	const boxById = new Map(sources.boxes.map((box) => [box.id, box]))
	const presetById = new Map(sources.presets.map((preset) => [preset.id, preset]))
	const aliases = sources.aliases ?? {}

	// first appearance order, e.g. ['normal', 'female', 'forms', 'gigantamax']
	const allTags = [...new Set(sources.boxes.flatMap((box) => box.tags))]

	function getPreset(presetId: string): PresetDefinition | undefined {
		const preset = presetById.get(presetId)
		return preset && { ...preset, boxes: [...preset.boxes] }
	}

	function getBox(boxId: string): BoxTemplate | undefined {
		const box = boxById.get(boxId)
		return box && { ...box, tags: [...box.tags], pokemon: [...box.pokemon] }
	}

	function hasPokemon(pokemonId: PokemonId): boolean {
		return Object.hasOwn(sources.pokemon, pokemonId)
	}

	function getPokemonEntry(pokemonId: PokemonId): PokemonEntry | undefined {
		const entry = hasPokemon(pokemonId) ? sources.pokemon[pokemonId].entry : undefined
		return entry && { ...entry }
	}

	/** Follows the alias chain to the current id. Unknown ids are returned unchanged. */
	function resolvePokemonId(pokemonId: PokemonId): PokemonId {
		let current = pokemonId
		const seen = new Set<PokemonId>()
		while (Object.hasOwn(aliases, current)) {
			if (seen.has(current)) throw new Error(`Alias cycle detected at "${current}"`)
			seen.add(current)
			current = aliases[current]
		}
		return current
	}

	/**
	 * v1 tag rules: no tags selected → every box. Boxes with an opt-in tag
	 * (forms, female, gigantamax) need that tag; otherwise any shared tag matches.
	 */
	function matchesTags(boxTags: BoxTag[], selectedTags: BoxTag[]): boolean {
		if (selectedTags.length === 0) return true
		const selected = new Set(selectedTags)
		if (OPT_IN_TAGS.some((tag) => boxTags.includes(tag) && !selected.has(tag))) return false
		return boxTags.some((tag) => selected.has(tag))
	}

	function requirePreset(presetId: string): PresetDefinition {
		const preset = presetById.get(presetId)
		if (!preset) throw new Error(`Unknown preset "${presetId}"`)
		return preset
	}

	function getAvailableTags(presetId: string): BoxTag[] {
		const preset = requirePreset(presetId)
		const tags = new Set<BoxTag>()
		for (const boxId of preset.boxes) {
			for (const tag of boxById.get(boxId)?.tags ?? []) tags.add(tag)
		}
		return [...tags]
	}

	function resolvePresetBoxes(layout: PresetLayout) {
		const preset = requirePreset(layout.presetId)
		return preset.boxes
			.map((boxId) => boxById.get(boxId))
			.filter((box): box is BoxTemplate => !!box && matchesTags(box.tags, layout.tags))
			.map((box) => ({
				id: box.id,
				title: box.title,
				slots: box.pokemon.filter(hasPokemon) as (PokemonId | null)[]
			}))
	}

	function resolveCustomBoxes(layout: CustomLayout) {
		return layout.boxes.map((box) => ({
			id: box.id,
			title: box.title,
			slots: box.slots.map((slot) => (slot === null ? null : resolvePokemonId(slot)))
		}))
	}

	/** Turns a layout into the boxes to render. */
	function resolveLayout(layout: DexLayout, boxSettings: BoxSettings = {}): ResolvedBox[] {
		const boxes = layout.kind === 'preset' ? resolvePresetBoxes(layout) : resolveCustomBoxes(layout)
		return boxes.map((box) => ({
			...box,
			wallpaper: boxSettings[box.id]?.wallpaper ?? DEFAULT_WALLPAPER
		}))
	}

	/** All pokemon ids of a layout in box order (empty slots skipped). */
	function listPokemonIds(layout: DexLayout): PokemonId[] {
		return resolveLayout(layout).flatMap((box) =>
			box.slots.filter((slot): slot is PokemonId => slot !== null)
		)
	}

	/** Freezes the current resolution of a layout into an editable custom layout. */
	function toCustomLayout(layout: DexLayout): CustomLayout {
		return {
			kind: 'custom',
			boxes: resolveLayout(layout).map(({ id, title, slots }) => ({ id, title, slots }))
		}
	}

	function validateCustomLayout(layout: CustomLayout): LayoutIssue[] {
		const issues: LayoutIssue[] = []
		const boxIds = new Set<string>()
		const pokemonIds = new Set<PokemonId>()

		for (const box of layout.boxes) {
			if (boxIds.has(box.id)) issues.push({ code: 'duplicate-box-id', boxId: box.id })
			boxIds.add(box.id)
			if (box.title.trim() === '') issues.push({ code: 'empty-box-title', boxId: box.id })
			if (box.slots.length > BOX_SIZE) issues.push({ code: 'box-too-large', boxId: box.id })

			box.slots.forEach((slot, index) => {
				if (slot === null) return
				const pokemonId = resolvePokemonId(slot)
				if (!hasPokemon(pokemonId)) {
					issues.push({ code: 'unknown-pokemon', boxId: box.id, slot: index, pokemonId })
				}
				if (pokemonIds.has(pokemonId)) {
					issues.push({ code: 'duplicate-pokemon', boxId: box.id, slot: index, pokemonId })
				}
				pokemonIds.add(pokemonId)
			})
		}
		return issues
	}

	return {
		allTags: () => [...allTags],
		listPresets: () => sources.presets.map((preset) => getPreset(preset.id)!),
		getPreset,
		getBox,
		hasPokemon,
		getPokemonEntry,
		resolvePokemonId,
		getAvailableTags,
		resolveLayout,
		listPokemonIds,
		toCustomLayout,
		validateCustomLayout
	}
}

/** The catalog shipped with this app version. */
export const catalog = createCatalog({
	pokemon: pkStats as Record<PokemonId, { entry: PokemonEntry }>,
	boxes: pokedexBoxes as BoxTemplate[],
	presets: presetDefinitions,
	aliases: pokemonAliases as Record<PokemonId, PokemonId>
})
