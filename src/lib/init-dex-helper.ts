import {
	type PokemonEditState,
	type BoxState,
	type DexState,
	type PokemonEntry,
	type BoxOrderConfig,
	type DexConfig
} from './models/data-models.ts'
import { defaultWallpaper } from './null-state-helper.ts'

export const initialAppDefaults = {
	ball: '01-poke-ball',
	shiny: false,
	caughtIn: '',
	comment: '',
	ribbons: [],
	marks: []
}

export function initPokedex(dexConfig: DexConfig): DexState {
	const initialBoxes = setupInitialBoxes(dexConfig.pokemonOrder)
	const initialPokemonList = setupInitialPokemonList(dexConfig.pokemonOrder)
	const initialDex = addDexMetaData(initialBoxes, initialPokemonList, dexConfig)

	// Return Object with all properties
	return initialDex
}

function setupInitialBoxes(pokedexOrder: BoxOrderConfig[]): BoxState[] {
	const initialBoxes: BoxState[] = []

	// initialize boxes with default settings
	let counter = 0
	for (const box of pokedexOrder) {
		counter++
		const boxData: BoxState = {
			id: `box-${counter.toString().padStart(3, '0')}`,
			title: box.title,
			settings: {
				wallpaper: defaultWallpaper
			},
			pokemon: []
		}

		for (const pokemon of box.pokemon) {
			const pokemonIdentifier = formatIdentifier(pokemon)
			boxData.pokemon.push(pokemonIdentifier)
		}

		initialBoxes.push(boxData)
	}

	return initialBoxes
}

function setupInitialPokemonList(pokedexOrder: BoxOrderConfig[]): Record<string, PokemonEditState> {
	const pokemonList: Record<string, PokemonEditState> = {}

	for (const box of pokedexOrder) {
		for (const pokemon of box.pokemon) {
			const pokemonIdentifier = formatIdentifier(pokemon)
			pokemonList[pokemonIdentifier] = {
				idEntry: pokemon,
				captured: false,
				ball: '01-poke-ball',
				shiny: false,
				caughtIn: '',
				ability: '',
				comment: '',
				ribbons: [],
				marks: [],
				isCustomized: false
			}
		}
	}

	return pokemonList
}

// prettier-ignore
function addDexMetaData(initialBoxes: BoxState[], pokemonList: Record<string, PokemonEditState>, dexConfig: DexConfig): DexState {
	return {
		version: '1.0.0',
		name: dexConfig.name,
		displayName: dexConfig.displayName,
		coverImage: dexConfig.coverImage,
		sortOrder: dexConfig.sortOrder,
		pokemon: pokemonList,
		boxes: initialBoxes
	}
}

function formatIdentifier(entry: PokemonEntry): string {
	const paddedId = entry.id_national.toString().padStart(4, '0')
	return `${paddedId}-${entry.pokemonid}${entry.formid ? '-' + entry.formid : ''}`
}
