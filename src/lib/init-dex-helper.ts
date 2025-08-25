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
	totalShiny: 0,
	isSystemDefault: false
}

export function initPokedex(dexConfig: DexConfig, isSystemDefault: boolean = false): DexSave {
	// Build the state side of pokedex
	const initialBoxes = setupInitialBoxes(dexConfig.pokemonOrder)
	const initialPokemonList = setupInitialPokemonList(dexConfig.pokemonOrder)
	const initialState = addConfigData(initialBoxes, initialPokemonList, dexConfig)

	// Create ID: if it's the system default, use deterministic ID; otherwise add timestamp
	let dexSaveId = ''
	if (isSystemDefault) {
		dexSaveId = `${dexConfig.type}-${dexConfig.presetId}-${dexConfig.tags.join('-')}`
	} else {
		dexSaveId = `${dexConfig.type}-${dexConfig.presetId}-${dexConfig.tags.join('-')}-${Date.now()}`
	}

	// Create meta data with correct system default flag
	const metaData: DexMeta = {
		...initialMetaData,
		isSystemDefault: isSystemDefault
	}

	const dexSave = {
		id: dexSaveId,
		config: dexConfig,
		state: initialState,
		meta: metaData
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
		name: dexConfig.presetId,
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
