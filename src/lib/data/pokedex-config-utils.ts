import pokedexBoxes from './pokedex-boxes.json' with { type: 'json' }
import pkStats from './pk-stats.json' with { type: 'json' }
import { dexPresets } from './pokedex.ts'
import {
	type PokemonEntry,
	type BoxTags,
	type DexConfig,
	type BoxOrderConfig
} from '../models/data-models.ts'

interface PokedexBox {
	id: string
	title: string
	wallpaper: string
	tags: string[]
	pokemon: string[]
}

interface StaticPokemonData {
	originRegion: string
	stats: number[]
	types: string[] | null
	abilities: string[] | null
	genderRatio: { male: number | null; female: number | null }
	entry: PokemonEntry
}

/**
 * Match and returns a Pokemon from PkStats by its ID (Identifier)
 * @param pokemonId - The ID (Identifier) of the Pokemon to find
 */
function findPokemon(pokemonId: string) {
	const pkEntry = (pkStats as Record<string, StaticPokemonData>)[pokemonId]

	if (!pkEntry) {
		console.warn(`Pokemon ID ${pokemonId} not found in pkStats`)
		return { pokemonid: 'null', formid: null, id_national: 0 }
	}
	return pkEntry.entry
}

/**
 * Returns true when the box tags match the selected tags according to rules:
 * - If no selectedTags -> true
 * - If box contains 'gigantamax' but selectedTags doesn't -> exclude
 * - If box contains 'forms' but selectedTags doesn't -> exclude
 * - Otherwise include when any box tag is present in selectedTags
 */
function matchesTags(boxTags: string[], selectedTags: string[]) {
	if (!selectedTags || selectedTags.length === 0) return true

	const selectedTagSet = new Set(selectedTags)
	// exclude special tags unless explicitly requested
	if (boxTags.includes('gigantamax') && !selectedTagSet.has('gigantamax')) return false
	if (boxTags.includes('forms') && !selectedTagSet.has('forms')) return false

	// include when any tag matches
	for (const tag of boxTags) {
		if (selectedTagSet.has(tag)) return true
	}
	return false
}

/**
 * Constructs the box order from the provided boxOrder array.
 * Filters boxes by tags using matchesTags.
 */
function getPokemonBoxOrderForConfig(dexConfig: DexConfig): BoxOrderConfig[] {
	const pokemonOrder: BoxOrderConfig[] = []
	for (const boxId of dexConfig.boxList) {
		const foundBox = pokedexBoxes.find((b: PokedexBox) => b.id === boxId)

		if (!foundBox) continue

		// only include box when it matches the requested tags
		if (!matchesTags(foundBox.tags, dexConfig.tags)) continue
		const box: BoxOrderConfig = {
			title: foundBox.title,
			pokemon: foundBox.pokemon
				.map((pokemonId) => findPokemon(pokemonId))
				.filter((p): p is PokemonEntry => p.pokemonid !== 'null') // filter out not found
		}
		pokemonOrder.push(box)
	}
	return pokemonOrder
}

/**
 * Get the dex config for a given dex name
 */
export function getDexConfig(dexPresetId: string, tags: BoxTags[]): DexConfig {
	let selectedConfig: DexConfig = dexPresets.nationalDex
	switch (dexPresetId) {
		case 'national':
			selectedConfig = dexPresets.nationalDex
			break
		case 'generation-1':
			selectedConfig = dexPresets.gen1Dex
			break
		case 'generation-2':
			selectedConfig = dexPresets.gen2Dex
			break
		case 'generation-3':
			selectedConfig = dexPresets.gen3Dex
			break
		case 'generation-4':
			selectedConfig = dexPresets.gen4Dex
			break
		case 'generation-5':
			selectedConfig = dexPresets.gen5Dex
			break
		case 'generation-6':
			selectedConfig = dexPresets.gen6Dex
			break
		default:
			// Default fallback to national dex
			selectedConfig = dexPresets.nationalDex
	}

	// Set specified tags
	selectedConfig.tags = tags

	const dexPokemonBoxOrder = getPokemonBoxOrderForConfig(selectedConfig)
	selectedConfig.pokemonOrder = dexPokemonBoxOrder

	return selectedConfig
}

export function getAllPossibleTags() {
	// pokedexBoxes
	const allTags = new Set<BoxTags>()
	for (const box of pokedexBoxes) {
		for (const tag of box.tags) {
			allTags.add(tag as BoxTags)
		}
	}
	return Array.from(allTags)
}

/**
 * Gets the available tags for a specific Pokedex preset by checking which boxes
 * are included in that preset and what tags those boxes have.
 */
export function getAvailableTagsForPreset(presetId: string): BoxTags[] {
	// Get the preset config
	const preset = Object.values(dexPresets).find((p) => p.presetId === presetId)
	if (!preset) {
		console.warn(`Preset with id "${presetId}" not found`)
		return []
	}

	// Get all tags from boxes that are included in this preset
	const availableTags = new Set<BoxTags>()

	for (const boxId of preset.boxList) {
		const box = pokedexBoxes.find((b) => b.id === boxId)
		if (box) {
			for (const tag of box.tags) {
				if (tag !== 'normal') {
					// Exclude 'normal' as it's always included
					availableTags.add(tag as BoxTags)
				}
			}
		}
	}

	return Array.from(availableTags)
}
