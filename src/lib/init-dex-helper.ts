import { defaultWallpaper } from './null-state-helper.ts'
import type { DexStorage, PokemonEntry, BoxOrder, PokemonState } from './state/storage-handler.ts'

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

export function initPokedex(pokedexOrder: BoxOrder[], dexName: string): DexStorage {
	const initialDexPokemon = setupInitialPokedex(pokedexOrder)
	const boxSettings = addBoxSettings(pokedexOrder)
	const initialDex = addDexMetaData(initialDexPokemon, dexName)

	// Return Object with all properties
	return {
		...initialDex,
		boxSettings
	}
}

function setupInitialPokedex(pokedexOrder: BoxOrder[]): Record<string, PokemonState> {
	const initialPokedex: Record<string, PokemonState> = {}

	for (const box of pokedexOrder) {
		for (const pokemon of box.pokemon) {
			const pokemonIdentifier = formatIdentifier(pokemon)
			initialPokedex[pokemonIdentifier] = {
				idEntry: pokemon,
				captured: false,
				ball: '01-poke-ball',
				shiny: false,
				caughtIn: '',
				ability: '',
				comment: '',
				isCustomized: false // Initial nicht angepasst
			}
		}
	}

	return initialPokedex
}

// prettier-ignore
function addDexMetaData(initialData: Record<string, PokemonState>, dexName: string) {
	return {
		version: '1.0.0',
		name: dexName,
		displayName: supportedPokedexList[dexName as DexType].displayName,
		pokemon: { ...initialData }
	}
}

function formatIdentifier(entry: PokemonEntry): string {
	const paddedId = entry.id_national.toString().padStart(4, '0')
	return `${paddedId}-${entry.pokemonid}${entry.formid ? '-' + entry.formid : ''}`
}

function addBoxSettings(pokedexOrder: BoxOrder[]) {
	const boxSettings: Record<string, { wallpaper: string }> = {}
	for (const box of pokedexOrder) {
		const boxId = box.title.replace(/\s+/g, '-').toLowerCase()
		boxSettings[boxId] = {
			wallpaper: box.wallpaper || defaultWallpaper
		}
	}
	return boxSettings
}
