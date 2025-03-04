/**
 * Describes order-XXX.json
 */
export interface BoxOrder {
	title: string
	pokemon: PokemonEntry[]
}

export interface PokemonEntry {
	pokemonid: string
	formid: string | null
	id_national: number
}

/**
 * Describes static-pokemon-data.json
 */
// export interface StaticPokemonData {
// 	pokemonid: string
// 	formid: string | null
// 	formname: string | null
// 	gen: number
// 	stats: PokemonStats
// 	gender: string
// 	id_national: number
// 	types: [PokemonType] | [PokemonType, PokemonType]
// 	originRegion: Region
// }

/**
 * Describes user-edited-data.json
 */
export interface PokemonData {
	pokemonid: string
	formid: string | null
	id_national: number
	pokemonInfo: PokemonUserInfo
}

export interface PokemonUserInfo {
	captured: boolean
	ball: string
	shiny: boolean
	caughtIn: string
	ability: string
	comment: string
}

// ===========================================================

// type PokemonStats = [number, number, number, number, number, number]

export const PokemonType = {
	Normal: 'normal',
	Fire: 'fire',
	Water: 'water',
	Electric: 'electric',
	Grass: 'grass',
	Ice: 'ice',
	Fighting: 'fighting',
	Poison: 'poison',
	Ground: 'ground',
	Flying: 'flying',
	Psychic: 'psychic',
	Bug: 'bug',
	Rock: 'rock',
	Ghost: 'ghost',
	Dragon: 'dragon',
	Dark: 'dark',
	Steel: 'steel',
	Fairy: 'fairy'
} as const

export const Region = {
	Kanto: 'kanto',
	Johto: 'johto',
	Hoenn: 'hoenn',
	Sinnoh: 'sinnoh',
	Unova: 'unova',
	Kalos: 'kalos',
	Alola: 'alola',
	Galar: 'galar',
	Hisui: 'hisui',
	Paldea: 'paldea'
} as const

export const Generations = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const

export const Game = {
	// Generation 1
	Red: { title: 'Red', gen: 1 },
	Blue: { title: 'Blue', gen: 1 },
	Yellow: { title: 'Yellow', gen: 1 },
	Green: { title: 'Green', gen: 1 },

	// Generation 2
	Gold: { title: 'Gold', gen: 2 },
	Silver: { title: 'Silver', gen: 2 },
	Crystal: { title: 'Crystal', gen: 2 },

	// Generation 3
	Ruby: { title: 'Ruby', gen: 3 },
	Sapphire: { title: 'Sapphire', gen: 3 },
	Emerald: { title: 'Emerald', gen: 3 },
	FireRed: { title: 'Fire Red', gen: 3 },
	LeafGreen: { title: 'Leaf Green', gen: 3 },

	// Generation 4
	Diamond: { title: 'Diamond', gen: 4 },
	Pearl: { title: 'Pearl', gen: 4 },
	Platinum: { title: 'Platinum', gen: 4 },
	HeartGold: { title: 'Heart Gold', gen: 4 },
	SoulSilver: { title: 'Soul Silver', gen: 4 },

	// Generation 5
	Black: { title: 'Black', gen: 5 },
	White: { title: 'White', gen: 5 },
	Black2: { title: 'Black 2', gen: 5 },
	White2: { title: 'White 2', gen: 5 },

	// Generation 6
	X: { title: 'X', gen: 6 },
	Y: { title: 'Y', gen: 6 },
	OmegaRuby: { title: 'Omega Ruby', gen: 6 },
	AlphaSapphire: { title: 'Alpha Sapphire', gen: 6 },

	// Generation 7
	Sun: { title: 'Sun', gen: 7 },
	Moon: { title: 'Moon', gen: 7 },
	UltraSun: { title: 'Ultra Sun', gen: 7 },
	UltraMoon: { title: 'Ultra Moon', gen: 7 },
	LetsGoPikachu: { title: 'Lets Go Pikachu', gen: 7 },
	LetsGoEevee: { title: 'Lets Go Eevee', gen: 7 },

	// Generation 8
	Sword: { title: 'Sword', gen: 8 },
	Shield: { title: 'Shield', gen: 8 },
	BrilliantDiamond: { title: 'Brilliant Diamond', gen: 8 },
	ShiningPerl: { title: 'Shining Perl', gen: 8 },
	LegendsArceus: { title: 'Legends Arceus', gen: 8 },

	// Generation 9
	Violet: { title: 'Violet', gen: 9 },
	Scarlet: { title: 'Scarlet', gen: 9 }
} as const

export type GameType = keyof typeof Game
