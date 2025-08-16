import { type ServerBoxOrder } from '../routes/pkorder/+server.ts'
import { type PokedexConfig } from './data/pokedex.ts'
import { defaultWallpaper } from './null-state-helper.ts'
import type { DexStorage, PokemonEntry, BoxData, PokemonState } from './state/storage-handler.ts'

export const initialAppDefaults = {
	ball: '01-poke-ball',
	shiny: false,
	caughtIn: '',
	comment: '',
	ribbons: [],
	marks: []
}

export function initPokedex(dexConfig: PokedexConfig): DexStorage {
	const initialBoxes = setupInitialBoxes(dexConfig.pokemonOrder)
	const initialPokemonList = setupInitialPokemonList(dexConfig.pokemonOrder)
	const initialDex = addDexMetaData(initialBoxes, initialPokemonList, dexConfig)

	// Return Object with all properties
	return initialDex
}

function setupInitialBoxes(pokedexOrder: ServerBoxOrder[]): BoxData[] {
	const initialBoxes: BoxData[] = []

	// initialize boxes with default settings
	let counter = 0
	for (const box of pokedexOrder) {
		counter++
		const boxData: BoxData = {
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

function setupInitialPokemonList(pokedexOrder: ServerBoxOrder[]): Record<string, PokemonState> {
	const pokemonList: Record<string, PokemonState> = {}

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
function addDexMetaData(initialBoxes: BoxData[], pokemonList: Record<string, PokemonState>, dexConfig: PokedexConfig): DexStorage {
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
