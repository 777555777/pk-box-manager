/**
 * Describes order-XXX.json
 */
export interface BoxOrder {
	title: string
	pokemon: PokemonEntry[]
	wallpaper: string
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
	Red: { title: 'Red', gen: 1, region: 'Kanto', originMark: null },
	Blue: { title: 'Blue', gen: 1, region: 'Kanto', originMark: null },
	Yellow: { title: 'Yellow', gen: 1, region: 'Kanto', originMark: null },
	Green: { title: 'Green', gen: 1, region: 'Kanto', originMark: null },

	// Generation 2
	Gold: { title: 'Gold', gen: 2, region: 'Johto', originMark: null },
	Silver: { title: 'Silver', gen: 2, region: 'Johto', originMark: null },
	Crystal: { title: 'Crystal', gen: 2, region: 'Johto', originMark: null },

	// Generation 3
	Ruby: { title: 'Ruby', gen: 3, region: 'Hoenn', originMark: null },
	Sapphire: { title: 'Sapphire', gen: 3, region: 'Hoenn', originMark: null },
	Emerald: { title: 'Emerald', gen: 3, region: 'Hoenn', originMark: null },
	FireRed: { title: 'Fire Red', gen: 3, region: 'Kanto', originMark: null },
	LeafGreen: { title: 'Leaf Green', gen: 3, region: 'Kanto', originMark: null },

	// Generation 4
	Diamond: { title: 'Diamond', gen: 4, region: 'Sinnoh', originMark: null },
	Pearl: { title: 'Pearl', gen: 4, region: 'Sinnoh', originMark: null },
	Platinum: { title: 'Platinum', gen: 4, region: 'Sinnoh', originMark: null },
	HeartGold: { title: 'Heart Gold', gen: 4, region: 'Johto', originMark: null },
	SoulSilver: { title: 'Soul Silver', gen: 4, region: 'Johto', originMark: null },

	// Generation 5
	Black: { title: 'Black', gen: 5, region: 'Unova', originMark: null },
	White: { title: 'White', gen: 5, region: 'Unova', originMark: null },
	Black2: { title: 'Black 2', gen: 5, region: 'Unova', originMark: null },
	White2: { title: 'White 2', gen: 5, region: 'Unova', originMark: null },

	// Generation 6
	X: { title: 'X', gen: 6, region: 'Kalos', originMark: 'pentagon' },
	Y: { title: 'Y', gen: 6, region: 'Kalos', originMark: 'pentagon' },
	OmegaRuby: { title: 'Omega Ruby', gen: 6, region: 'Hoenn', originMark: 'pentagon' },
	AlphaSapphire: { title: 'Alpha Sapphire', gen: 6, region: 'Hoenn', originMark: 'pentagon' },

	// Generation 7
	Sun: { title: 'Sun', gen: 7, region: 'Alola', originMark: 'clover' },
	Moon: { title: 'Moon', gen: 7, region: 'Alola', originMark: 'clover' },
	UltraSun: { title: 'Ultra Sun', gen: 7, region: 'Alola', originMark: 'clover' },
	UltraMoon: { title: 'Ultra Moon', gen: 7, region: 'Alola', originMark: 'clover' },
	LetsGoPikachu: { title: 'Lets Go Pikachu', gen: 7, region: 'Kanto', originMark: 'lets-go' },
	LetsGoEevee: { title: 'Lets Go Eevee', gen: 7, region: 'Kanto', originMark: 'lets-go' },

	// Generation 7 Virtual console
	RedVC: { title: 'Red virtual console', gen: 7, region: 'Kanto', originMark: 'game-boy' },
	BlueVC: { title: 'Blue virtual console', gen: 7, region: 'Kanto', originMark: 'game-boy' },
	YellowVC: { title: 'Yellow virtual console', gen: 7, region: 'Kanto', originMark: 'game-boy' },
	GreenVC: { title: 'Green virtual console', gen: 7, region: 'Kanto', originMark: 'game-boy' },

	// Generation 7 Virtual console
	GoldVC: { title: 'Gold virtual console', gen: 7, region: 'Johto', originMark: 'game-boy' },
	SilverVC: { title: 'Silver virtual console', gen: 7, region: 'Johto', originMark: 'game-boy' },
	CrystalVC: { title: 'Crystal virtual console', gen: 7, region: 'Johto', originMark: 'game-boy' },

	// Generation 8
	Sword: { title: 'Sword', gen: 8, region: 'Galar', originMark: 'galar' },
	Shield: { title: 'Shield', gen: 8, region: 'Galar', originMark: 'galar' },
	BrilliantDiamond: { title: 'Brilliant Diamond', gen: 8, region: 'Sinnoh', originMark: 'sinnoh' },
	ShiningPerl: { title: 'Shining Perl', gen: 8, region: 'Sinnoh', originMark: 'sinnoh' },
	LegendsArceus: { title: 'Legends Arceus', gen: 8, region: 'Hisui', originMark: 'hisui' },

	// Generation 9
	Violet: { title: 'Violet', gen: 9, region: 'Paldea', originMark: 'paldea' },
	Scarlet: { title: 'Scarlet', gen: 9, region: 'Paldea', originMark: 'paldea' },

	// Spin-offs - Changes generation on update
	Go: { title: 'Pokemon Go', gen: 9, region: 'Go', originMark: 'go' }
} as const

export type GameType = keyof typeof Game
