// #region Core data model

export interface PokemonEntry {
	pokemonid: string
	formid: string | null
	id_national: number
}

// =================================
// This is the state for each box/Pokemon
export interface BoxState {
	id: string
	title: string
	settings: {
		wallpaper: string
	}
	pokemon: string[] // This lists the order of Pokemon in the box
}

export interface PokemonEditState {
	idEntry: PokemonEntry
	captured: boolean
	ball: string
	shiny: boolean
	caughtIn: string
	ability: string
	comment: string
	ribbons: string[]
	marks: string[]
	isCustomized: boolean
}

export interface DexState {
	stateVersion: string
	pokemon: Record<string, PokemonEditState>
	boxes: BoxState[]
}

// =================================
// This is the order configuration for each box and metadata for the Dex
export interface BoxOrderConfig {
	title: string
	pokemon: PokemonEntry[]
}

export interface DexConfig {
	presetId: string
	configVersion: string
	type: 'preset' | 'custom'
	displayName: string
	coverImage: string
	sortOrder: number
	tags: BoxTags[]
	boxList: string[] // This lists the order of the boxes
	pokemonOrder: BoxOrderConfig[] // This lists the order of Pokemon in boxes
	createdAt: number
	updatedAt: number
}

// =================================

export interface DexMeta {
	createdAt: number
	updatedAt: number
	totalPokemon: number
	totalCaught: number
	totalShiny: number
	isSystemDefault?: boolean
}

// =================================
// This is the save format for the Dex, which includes both configuration and state
export interface DexSave {
	id: string
	config: DexConfig
	state: DexState
	meta: DexMeta
}

// #endregion
// ===========================================================

export type BoxTags = 'normal' | 'forms' | 'gigantamax'

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

	// Generation 7 VC
	RedVC: { title: 'Red VC', gen: 7, region: 'Kanto', originMark: 'game-boy' },
	BlueVC: { title: 'Blue VC', gen: 7, region: 'Kanto', originMark: 'game-boy' },
	YellowVC: { title: 'Yellow VC', gen: 7, region: 'Kanto', originMark: 'game-boy' },
	GreenVC: { title: 'Green VC', gen: 7, region: 'Kanto', originMark: 'game-boy' },

	// Generation 7 VC
	GoldVC: { title: 'Gold VC', gen: 7, region: 'Johto', originMark: 'game-boy' },
	SilverVC: { title: 'Silver VC', gen: 7, region: 'Johto', originMark: 'game-boy' },
	CrystalVC: { title: 'Crystal VC', gen: 7, region: 'Johto', originMark: 'game-boy' },

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
