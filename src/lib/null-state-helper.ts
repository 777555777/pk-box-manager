export const pokemonNullProperties = {
	captured: false,
	ball: '01-poke-ball',
	shiny: false,
	caughtIn: '',
	ability: '',
	comment: '',
	isCustomized: false
}

export const pokemonNullState = {
	idEntry: { pokemonid: 'null', formid: null, id_national: 0 },
	...pokemonNullProperties
}

export const defaultWallpaper = 'forest'

export const pokedexNullState = {
	version: '0.0.0',
	name: 'null',
	displayName: 'Null Dex',
	pokemon: { '0000-null': pokemonNullState },
	boxSettings: {
		title_1: {
			wallpaper: defaultWallpaper
		}
	}
}
