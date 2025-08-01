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
	coverImage: 'null-cover',
	sortOrder: {
		type: 'server' as const,
		value: 0
	},
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
	boxSprites: 'default',
	font: 'pixel',
	badgeCycleOption: 'default',
	badgeDisplay: false,
	conditionalBadgeDisplay: {
		ribbon: '001-national-ribbon',
		mark: 'absent-minded-mark'
	}
}
