import { type ServerBoxOrder } from '../routes/pkorder/+server.ts'
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

export const supportedPokedexList = {
	'national-dex.json': {
		displayName: 'National Dex',
		coverImage: 'national-dex-cover',
		sortOrder: { type: 'server', value: 1 }
	},
	'national-dex-forms.json': {
		displayName: 'National Dex with forms',
		coverImage: 'national-dex-forms-cover',
		sortOrder: { type: 'server', value: 2 }
	},
	'generation-1.json': {
		displayName: 'Generation 1',
		coverImage: 'gen1-cover',
		sortOrder: { type: 'server', value: 10 }
	},
	'generation-1-forms.json': {
		displayName: 'Generation 1 with forms',
		coverImage: 'gen1-forms-cover',
		sortOrder: { type: 'server', value: 11 }
	},
	'generation-2.json': {
		displayName: 'Generation 2',
		coverImage: 'gen2-cover',
		sortOrder: { type: 'server', value: 20 }
	},
	'generation-2-forms.json': {
		displayName: 'Generation 2 with forms',
		coverImage: 'gen2-forms-cover',
		sortOrder: { type: 'server', value: 21 }
	},
	'generation-3.json': {
		displayName: 'Generation 3',
		coverImage: 'gen3-cover',
		sortOrder: { type: 'server', value: 30 }
	},
	'generation-3-forms.json': {
		displayName: 'Generation 3 with forms',
		coverImage: 'gen3-forms-cover',
		sortOrder: { type: 'server', value: 31 }
	},
	'generation-4.json': {
		displayName: 'Generation 4',
		coverImage: 'gen4-cover',
		sortOrder: { type: 'server', value: 40 }
	},
	'generation-4-forms.json': {
		displayName: 'Generation 4 with forms',
		coverImage: 'gen4-forms-cover',
		sortOrder: { type: 'server', value: 41 }
	},
	'generation-5.json': {
		displayName: 'Generation 5',
		coverImage: 'gen5-cover',
		sortOrder: { type: 'server', value: 50 }
	},
	'generation-5-forms.json': {
		displayName: 'Generation 5 with forms',
		coverImage: 'gen5-forms-cover',
		sortOrder: { type: 'server', value: 51 }
	},
	'generation-6.json': {
		displayName: 'Generation 6',
		coverImage: 'gen6-cover',
		sortOrder: { type: 'server', value: 60 }
	},
	'generation-6-forms.json': {
		displayName: 'Generation 6 with forms',
		coverImage: 'gen6-forms-cover',
		sortOrder: { type: 'server', value: 61 }
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
				ribbons: [],
				marks: [],
				isCustomized: false
			}
		}
	}

	return pokemonList
}

// prettier-ignore
function addDexMetaData(initialBoxes: BoxData[], pokemonList: Record<string, PokemonState>, dexName: string): DexStorage {
	const dexConfig = supportedPokedexList[dexName as DexType]
	return {
		version: '1.0.0',
		name: dexName,
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
