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
	isCustomized: boolean
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
	Red: { title: 'Red', gen: 1, region: 'Kanto' },
	Blue: { title: 'Blue', gen: 1, region: 'Kanto' },
	Yellow: { title: 'Yellow', gen: 1, region: 'Kanto' },
	Green: { title: 'Green', gen: 1, region: 'Kanto' },

	// Generation 2
	Gold: { title: 'Gold', gen: 2, region: 'Johto' },
	Silver: { title: 'Silver', gen: 2, region: 'Johto' },
	Crystal: { title: 'Crystal', gen: 2, region: 'Johto' },

	// Generation 3
	Ruby: { title: 'Ruby', gen: 3, region: 'Hoenn' },
	Sapphire: { title: 'Sapphire', gen: 3, region: 'Hoenn' },
	Emerald: { title: 'Emerald', gen: 3, region: 'Hoenn' },
	FireRed: { title: 'Fire Red', gen: 3, region: 'Kanto' },
	LeafGreen: { title: 'Leaf Green', gen: 3, region: 'Kanto' },

	// Generation 4
	Diamond: { title: 'Diamond', gen: 4, region: 'Sinnoh' },
	Pearl: { title: 'Pearl', gen: 4, region: 'Sinnoh' },
	Platinum: { title: 'Platinum', gen: 4, region: 'Sinnoh' },
	HeartGold: { title: 'Heart Gold', gen: 4, region: 'Johto' },
	SoulSilver: { title: 'Soul Silver', gen: 4, region: 'Johto' },

	// Generation 5
	Black: { title: 'Black', gen: 5, region: 'Unova' },
	White: { title: 'White', gen: 5, region: 'Unova' },
	Black2: { title: 'Black 2', gen: 5, region: 'Unova' },
	White2: { title: 'White 2', gen: 5, region: 'Unova' },

	// Generation 6
	X: { title: 'X', gen: 6, region: 'Kalos' },
	Y: { title: 'Y', gen: 6, region: 'Kalos' },
	OmegaRuby: { title: 'Omega Ruby', gen: 6, region: 'Hoenn' },
	AlphaSapphire: { title: 'Alpha Sapphire', gen: 6, region: 'Hoenn' },

	// Generation 7
	Sun: { title: 'Sun', gen: 7, region: 'Alola' },
	Moon: { title: 'Moon', gen: 7, region: 'Alola' },
	UltraSun: { title: 'Ultra Sun', gen: 7, region: 'Alola' },
	UltraMoon: { title: 'Ultra Moon', gen: 7, region: 'Alola' },
	LetsGoPikachu: { title: 'Lets Go Pikachu', gen: 7, region: 'Kanto' },
	LetsGoEevee: { title: 'Lets Go Eevee', gen: 7, region: 'Kanto' },

	// Generation 8
	Sword: { title: 'Sword', gen: 8, region: 'Galar' },
	Shield: { title: 'Shield', gen: 8, region: 'Galar' },
	BrilliantDiamond: { title: 'Brilliant Diamond', gen: 8, region: 'Sinnoh' },
	ShiningPerl: { title: 'Shining Perl', gen: 8, region: 'Sinnoh' },
	LegendsArceus: { title: 'Legends Arceus', gen: 8, region: 'Hisui' },

	// Generation 9
	Violet: { title: 'Violet', gen: 9, region: 'Paldea' },
	Scarlet: { title: 'Scarlet', gen: 9, region: 'Paldea' }
} as const

export type GameType = keyof typeof Game
