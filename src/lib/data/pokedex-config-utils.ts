import { dexPresets } from './pokedex.ts'
import { catalog } from '../catalog/catalog.ts'
import { type BoxTags, type DexConfig, type PokemonEntry } from '../models/data-models.ts'

/**
 * Get the v1 dex config for a preset id with the boxes of the given tags.
 * Unknown preset ids fall back to the national dex (pkState relies on this).
 * Always returns a new object, the presets are never mutated.
 */
export function getDexConfig(dexPresetId: string, tags: BoxTags[]): DexConfig {
	const preset =
		Object.values(dexPresets).find((p) => p.presetId === dexPresetId) ?? dexPresets.nationalDex

	const pokemonOrder = catalog
		.resolveLayout({ kind: 'preset', presetId: preset.presetId, tags })
		.map((box) => ({
			title: box.title,
			pokemon: box.slots
				.filter((slot) => slot !== null)
				.map((pokemonId) => catalog.getPokemonEntry(pokemonId) as PokemonEntry)
		}))

	return { ...preset, tags, boxList: [...preset.boxList], pokemonOrder }
}

export function getAllPossibleTags(): BoxTags[] {
	return catalog.allTags()
}

/**
 * Gets the available tags for a specific Pokedex preset by checking which boxes
 * are included in that preset and what tags those boxes have.
 */
export function getAvailableTagsForPreset(presetId: string): BoxTags[] {
	if (!catalog.getPreset(presetId)) {
		console.warn(`Preset with id "${presetId}" not found`)
		return []
	}
	return catalog.getAvailableTags(presetId)
}
