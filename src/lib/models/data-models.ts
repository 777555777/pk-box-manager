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
// export interface PokemonData {
// 	pokemonid: string
// 	formid: string | null
// 	id_national: number
// 	pokemonInfo: PokemonUserInfo
// }

// interface PokemonUserInfo {
// 	captured: boolean
// 	ball: string
// 	shiny: boolean
// 	caughtIn: string
// 	ability: string
// 	comment: string
// }

// ===========================================================

// type PokemonStats = [number, number, number, number, number, number]

// export const PokemonType = {
// 	Normal: 'normal',
// 	Fire: 'fire',
// 	Water: 'water',
// 	Electric: 'electric',
// 	Grass: 'grass',
// 	Ice: 'ice',
// 	Fighting: 'fighting',
// 	Poison: 'poison',
// 	Ground: 'ground',
// 	Flying: 'flying',
// 	Psychic: 'psychic',
// 	Bug: 'bug',
// 	Rock: 'rock',
// 	Ghost: 'ghost',
// 	Dragon: 'dragon',
// 	Dark: 'dark',
// 	Steel: 'steel',
// 	Fairy: 'fairy'
// } as const

// export const Region = {
// 	Kanto: 'kanto',
// 	Johto: 'johto',
// 	Hoenn: 'hoenn',
// 	Sinnoh: 'sinnoh',
// 	Unova: 'unova',
// 	Kalos: 'kalos',
// 	Alola: 'alola',
// 	Galar: 'galar',
// 	Hisui: 'hisui',
// 	Paldea: 'paldea'
// } as const
