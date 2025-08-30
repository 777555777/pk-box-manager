import {
	type PokemonEditState,
	type BoxState,
	type DexState,
	type BoxOrderConfig,
	type DexConfig,
	type DexSave,
	type DexMeta,
	BoxTags
} from './models/data-models.ts'
import { defaultWallpaper } from './null-state-helper.ts'
import { getIdentifier } from './spriteheet-helper.ts'

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
	const initialState = addConfigData(initialBoxes, initialPokemonList)

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
			const pokemonIdentifier = getIdentifier(pokemon)
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
			const pokemonIdentifier = getIdentifier(pokemon)
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
function addConfigData(initialBoxes: BoxState[], pokemonList: Record<string, PokemonEditState>): DexState {
	return {
		stateVersion: '1.0.0',
		pokemon: pokemonList,
		boxes: initialBoxes
	}
}

// Format tag display name
export function formatTagName(tag: BoxTags): string {
	if (tag === 'gigantamax') {
		return 'G-Max'
	}
	return tag.charAt(0).toUpperCase() + tag.slice(1)
}
