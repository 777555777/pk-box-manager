/**
 * Converts a v1 save (one `DexSave`) into the v2 data model. Pure function:
 * no storage access, the input is not mutated.
 */
import {
	BOX_SIZE,
	catalog as defaultCatalog,
	DEFAULT_WALLPAPER,
	type Catalog
} from '../../catalog/catalog.ts'
import type { BoxSettings, CustomLayout, DexLayout, PokemonId } from '../../catalog/types.ts'
import { computeStats } from '../stats.ts'
import type { DexEntry, DexRecord } from '../types.ts'
import type { V1Save } from './v1-save.ts'

type RemovalReason = 'unknown' | 'duplicate' | 'overflow'

export interface V1ConversionReport {
	/**
	 * Why the dex became a custom layout instead of a live preset:
	 * - `custom-dex`: it was a custom dex in v1 already
	 * - `unknown-preset`: the preset id does not exist in the catalog
	 * The v1 box order is kept exactly in both cases.
	 */
	layoutFallback: 'custom-dex' | 'unknown-preset' | null
	/** Entries stored under an id that is an alias of a newer id. */
	renamedEntries: { from: PokemonId; to: PokemonId }[]
	/** Several v1 entries that point to the same pokemon after renaming, only the first is kept. */
	duplicateEntries: PokemonId[]
	/** Entries whose pokemon is not part of the v2 layout. They are kept but not displayed. */
	orphanedEntries: PokemonId[]
	/** Titles of v1 boxes with a custom wallpaper that has no matching v2 box. */
	unmatchedBoxes: string[]
	/** v1 entries that could not be read at all (see parseV1Save). */
	invalidEntries: string[]
	/**
	 * Slots removed from a custom layout so it stays valid (unknown pokemon,
	 * a pokemon shown twice, more than BOX_SIZE slots). Their entries are kept.
	 */
	removedSlots: {
		boxId: string
		pokemonId: PokemonId
		reason: RemovalReason
	}[]
}

export interface V1Conversion {
	dex: DexRecord
	entries: DexEntry[]
	report: V1ConversionReport
}

export function convertV1Save(save: V1Save, catalog: Catalog = defaultCatalog): V1Conversion {
	const report: V1ConversionReport = {
		layoutFallback: null,
		renamedEntries: [],
		duplicateEntries: [],
		orphanedEntries: [],
		unmatchedBoxes: [],
		invalidEntries: [...(save.invalidEntries ?? [])],
		removedSlots: []
	}

	const layout = convertLayout(save, catalog, report)
	const resolvedBoxes = catalog.resolveLayout(layout)
	const boxSettings = convertBoxSettings(save, layout, resolvedBoxes, report)
	const entries = convertEntries(save, catalog, report)

	const layoutPokemonIds = resolvedBoxes.flatMap((box) =>
		box.slots.filter((slot): slot is PokemonId => slot !== null)
	)
	const inLayout = new Set(layoutPokemonIds)
	report.orphanedEntries = entries
		.map((entry) => entry.pokemonId)
		.filter((pokemonId) => !inLayout.has(pokemonId))

	const dex: DexRecord = {
		id: save.id,
		name:
			save.config.displayName.trim() ||
			(layout.kind === 'preset' ? catalog.getPreset(layout.presetId)?.name : undefined) ||
			'Pokédex',
		coverImage: save.config.coverImage,
		layout,
		boxSettings,
		isDefault: save.meta.isSystemDefault === true,
		createdAt: save.meta.createdAt,
		updatedAt: save.meta.updatedAt,
		stats: computeStats(layoutPokemonIds, entries)
	}

	return { dex, entries, report }
}

function convertLayout(save: V1Save, catalog: Catalog, report: V1ConversionReport): DexLayout {
	const { type, presetId, tags } = save.config

	if (type === 'preset' && catalog.getPreset(presetId)) {
		return { kind: 'preset', presetId, tags: [...new Set(tags)] }
	}

	// Keep the v1 order. v1 box ids ("box-001") are stable within this dex.
	report.layoutFallback = type === 'custom' ? 'custom-dex' : 'unknown-preset'
	return sanitizeCustomLayout(save, catalog, report)
}

/**
 * Builds a custom layout that passes `catalog.validateCustomLayout`, so every
 * converted dex can be exported and imported again. Problematic slots become empty.
 */
function sanitizeCustomLayout(
	save: V1Save,
	catalog: Catalog,
	report: V1ConversionReport
): CustomLayout {
	const usedBoxIds = new Set<string>()
	const usedPokemon = new Set<PokemonId>()

	const boxes = save.state.boxes.map((box, index) => {
		const baseId = box.id.trim() || `box-${String(index + 1).padStart(3, '0')}`
		let id = baseId
		for (let n = 2; usedBoxIds.has(id); n++) id = `${baseId}-${n}`
		usedBoxIds.add(id)

		const removalReason = (pokemonId: PokemonId, slot: number): RemovalReason | null => {
			if (!catalog.hasPokemon(pokemonId)) return 'unknown'
			if (usedPokemon.has(pokemonId)) return 'duplicate'
			if (slot >= BOX_SIZE) return 'overflow'
			return null
		}

		const slots = box.pokemon.map((rawId, slot): PokemonId | null => {
			const pokemonId = catalog.resolvePokemonId(rawId)
			const reason = removalReason(pokemonId, slot)
			if (reason) {
				report.removedSlots.push({ boxId: id, pokemonId, reason })
				return null
			}
			usedPokemon.add(pokemonId)
			return pokemonId
		})

		return {
			id,
			title: box.title.trim() || `Box ${index + 1}`,
			slots: slots.slice(0, BOX_SIZE)
		}
	})
	return { kind: 'custom', boxes }
}

/** v1 box ids are positional, so preset boxes are matched by their (unique) title. */
function convertBoxSettings(
	save: V1Save,
	layout: DexLayout,
	resolvedBoxes: { id: string; title: string }[],
	report: V1ConversionReport
): BoxSettings {
	const boxIdByTitle = new Map(resolvedBoxes.map((box) => [box.title, box.id]))
	const boxSettings: BoxSettings = {}

	for (const [index, box] of save.state.boxes.entries()) {
		const wallpaper = box.settings.wallpaper
		if (!wallpaper || wallpaper === DEFAULT_WALLPAPER) continue

		// custom layouts keep the v1 boxes 1:1 in order (ids may have been repaired)
		const boxId = layout.kind === 'custom' ? resolvedBoxes[index]?.id : boxIdByTitle.get(box.title)
		if (boxId) {
			boxSettings[boxId] = { wallpaper }
		} else {
			report.unmatchedBoxes.push(box.title)
		}
	}
	return boxSettings
}

/** Only pokemon the user touched (caught or customized) become entries. */
function convertEntries(save: V1Save, catalog: Catalog, report: V1ConversionReport): DexEntry[] {
	const entries: DexEntry[] = []
	const seen = new Set<PokemonId>()

	for (const [v1Id, pokemon] of Object.entries(save.state.pokemon)) {
		if (!pokemon.captured && !pokemon.isCustomized) continue

		const pokemonId = catalog.resolvePokemonId(v1Id)
		if (pokemonId !== v1Id) report.renamedEntries.push({ from: v1Id, to: pokemonId })
		if (seen.has(pokemonId)) {
			report.duplicateEntries.push(pokemonId)
			continue
		}
		seen.add(pokemonId)

		entries.push({
			dexId: save.id,
			pokemonId,
			captured: pokemon.captured,
			shiny: pokemon.shiny,
			ball: pokemon.ball,
			caughtIn: pokemon.caughtIn,
			ability: pokemon.ability,
			comment: pokemon.comment,
			originalTrainer: pokemon.originalTrainer,
			ribbons: [...pokemon.ribbons],
			marks: [...pokemon.marks],
			updatedAt: save.meta.updatedAt
		})
	}
	return entries
}
