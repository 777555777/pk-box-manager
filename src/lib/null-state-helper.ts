import { type AppSettings } from './state/storage-handler.ts'

export const pokemonNullProperties = {
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

export const pokemonNullState = {
	idEntry: { pokemonid: 'null', formid: null, id_national: 0 },
	...pokemonNullProperties
}

export const defaultWallpaper = '01-forest'

export const pokedexNullState = {
	version: '0.0.0',
	name: 'null',
	displayName: 'Null Dex',
	pokemon: { '0000-null': pokemonNullState },
	boxes: [
		{
			id: 'box-000',
			title: 'Null Box',
			settings: {
				wallpaper: defaultWallpaper
			},
			pokemon: ['0000-null']
		}
	]
}

export const defaultAppSettings: AppSettings = {
	language: 'en',
	boxSprites: 'original',
	font: 'pixel-font',
	badgeCycleOption: 'default',
	badgeDisplay: false
}
