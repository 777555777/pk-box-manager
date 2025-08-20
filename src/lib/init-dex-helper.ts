import {
	type PokemonEditState,
	type BoxState,
	type DexState,
	type PokemonEntry,
	type BoxOrderConfig,
	type DexConfig,
	type DexSave,
	type DexMeta
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

const initialMetaData: DexMeta = {
	createdAt: 0,
	updatedAt: 0,
	totalPokemon: 0,
	totalCaught: 0,
	totalShiny: 0
}

export function initPokedex(dexConfig: DexConfig): DexSave {
	// Build the state side of pokedex
	const initialBoxes = setupInitialBoxes(dexConfig.pokemonOrder)
	const initialPokemonList = setupInitialPokemonList(dexConfig.pokemonOrder)
	const initialState = addConfigData(initialBoxes, initialPokemonList, dexConfig)

	// Create the final DexSave object
	const dexSaveId = `${dexConfig.type}-${dexConfig.id}-${dexConfig.tags.join('-')}`
	const dexSave = {
		id: dexSaveId,
		config: dexConfig,
		state: initialState,
		meta: initialMetaData
	}

	return dexSave
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
function addConfigData(initialBoxes: BoxState[], pokemonList: Record<string, PokemonEditState>, dexConfig: DexConfig): DexState {
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
