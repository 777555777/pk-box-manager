import pokedexBoxes from './pokedex-boxes.json' with { type: 'json' }
import pkStats from './pk-stats.json' with { type: 'json' }
import {
	dexPresets,
	type Tags,
	type PokedexConfig,
	type BoxOrder,
	type PokemonEntry
} from './pokedex.ts'

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
function getPokemonBoxOrderForConfig(dexConfig: PokedexConfig): BoxOrder[] {
	const pokemonOrder: BoxOrder[] = []
	for (const boxId of dexConfig.boxList) {
		const foundBox = pokedexBoxes.find((b: PokedexBox) => b.id === boxId)

		if (!foundBox) continue

		// only include box when it matches the requested tags
		if (!matchesTags(foundBox.tags, dexConfig.tags)) continue
		const box: BoxOrder = {
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
export function getDexConfig(selectedDexName: string, tags: Tags[]): PokedexConfig {
	console.log('tags', tags)
	let selectedConfig: PokedexConfig = dexPresets.nationalDex
	switch (selectedDexName) {
		case 'national':
		case 'national-dex':
		case 'national-dex-forms':
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
	console.log('before-selectedConfig', selectedConfig)

	// Set specified tags
	selectedConfig.tags = tags

	const dexPokemonBoxOrder = getPokemonBoxOrderForConfig(selectedConfig)
	selectedConfig.pokemonOrder = dexPokemonBoxOrder
	console.log('final-selectedConfig', selectedConfig) // geloggter wert ist korrekt

	return selectedConfig
}
