import { type ServerBoxOrder } from '../routes/pkorder/+server.ts'
import { defaultWallpaper } from './null-state-helper.ts'
import type { DexStorage, PokemonEntry, BoxData, PokemonState } from './state/storage-handler.ts'

export const initialAppDefaults = {
	ball: '01-poke-ball',
	shiny: false,
	caughtIn: '',
	comment: ''
}

export const supportedPokedexList = {
	'order-national.json': {
		displayName: 'National Dex'
	},
	'order-national-forms.json': {
		displayName: 'National Dex mit Formen'
	},
	'order-national-test.json': {
		displayName: 'National Dex Test'
	},
	'order-test-small-1.json': {
		displayName: 'Kleiner Test Dex 1'
	},
	'order-test-small-2.json': {
		displayName: 'Kleiner Test Dex 2'
	},
	'order-background-test.json': {
		displayName: 'Hintergrund Test Dex'
	}
} as const

export type DexType = keyof typeof supportedPokedexList

export function initPokedex(pokedexOrder: ServerBoxOrder[], dexName: string): DexStorage {
	const initialBoxes = setupInitialBoxes(pokedexOrder)
	const initialPokemonList = setupInitialPokemonList(pokedexOrder)
	const initialDex = addDexMetaData(initialBoxes, initialPokemonList, dexName)

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
				isCustomized: false
			}
		}
	}

	return pokemonList
}

// prettier-ignore
function addDexMetaData(initialBoxes: BoxData[], pokemonList: Record<string, PokemonState>, dexName: string): DexStorage {
	return {
		version: '1.0.0',
		name: dexName,
		displayName: supportedPokedexList[dexName as DexType].displayName,
		pokemon: pokemonList,
		boxes: initialBoxes
	}
}

function formatIdentifier(entry: PokemonEntry): string {
	const paddedId = entry.id_national.toString().padStart(4, '0')
	return `${paddedId}-${entry.pokemonid}${entry.formid ? '-' + entry.formid : ''}`
}
