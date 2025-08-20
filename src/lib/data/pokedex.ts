import { type DexConfig } from '../models/data-models.ts'

const boxOrderNational = [
	'kanto-1',
	'kanto-2',
	'kanto-3',
	'kanto-4',
	'kanto-5',
	'kanto-6',
	'kanto-females',
	'cap-pikachu',
	'johto-1',
	'johto-2',
	'johto-3',
	'johto-4',
	'johto-females',
	'unown-dex',
	'hoenn-1',
	'hoenn-2',
	'hoenn-3',
	'hoenn-4',
	'hoenn-5',
	'hoenn-females',
	'hoenn-alternate',
	'sinnoh-1',
	'sinnoh-2',
	'sinnoh-3',
	'sinnoh-4',
	'sinnoh-female-1',
	'sinnoh-female-2',
	'sinnoh-alternate',
	'unova-1',
	'unova-2',
	'unova-3',
	'unova-4',
	'unova-5',
	'unova-6',
	'unova-alternate',
	'kalos-1',
	'kalos-2',
	'kalos-3',
	'kalos-alternate-1',
	'kalos-alternate-2',
	'vivillon-pattern',
	'alola-1',
	'alola-2',
	'alola-3',
	'alola-alternate',
	'alola-forms',
	'unknown',
	'galar-1',
	'galar-2',
	'galar-3',
	'galar-alternate',
	'galar-forms',
	'alcremie-1',
	'alcremie-2',
	'alcremie-3',
	'gigantamax-1',
	'gigantamax-2',
	'hisui',
	'hisui-forms',
	'paldea-1',
	'paldea-2',
	'paldea-3',
	'paldea-4',
	'paldea-alternate',
	'paldea-forms'
]

//  Beispiel custom:
// const customDex: DexConfig = {
//   id: crypto.randomUUID(),   // stabil, unabhängig vom Namen
//   configVersion: "1.0.0",
//   type: "custom",
//   name: "my-shiny-hoenn",
//   displayName: "My Shiny Hoenn Dex",
//   coverImage: "custom-cover.png",
//   sortOrder: 99,
//   tags: ["shiny"],
//   boxList: [],
//   pokemonOrder: [],
//   createdAt: Date.now(),
//   updatedAt: Date.now()
// }

// Exported because it is the default Pokedex
export const nationalDex: DexConfig = {
	id: 'national',
	configVersion: '',
	type: 'preset',
	name: 'national',
	displayName: 'National Dex',
	coverImage: 'national-cover.png',
	sortOrder: 0,
	tags: ['normal'],
	boxList: boxOrderNational,
	pokemonOrder: [],
	createdAt: 0,
	updatedAt: 0
}

const gen1Dex: DexConfig = {
	id: 'generation-1',
	configVersion: '',
	type: 'preset',
	name: 'generation-1',
	displayName: 'Generation 1',
	coverImage: 'gen1-cover.png',
	sortOrder: 1,
	tags: ['normal'],
	boxList: boxOrderNational.slice(0, 8), // Kanto-1 to Cap-Pikachu
	pokemonOrder: [],
	createdAt: 0,
	updatedAt: 0
}

const gen2Dex: DexConfig = {
	id: 'generation-2',
	configVersion: '',
	type: 'preset',
	name: 'generation-2',
	displayName: 'Generation 2',
	coverImage: 'gen2-cover.png',
	sortOrder: 2,
	tags: ['normal'],
	boxList: boxOrderNational.slice(0, 14), // 9, 14 is Johto-1 to Unown-Dex
	pokemonOrder: [],
	createdAt: 0,
	updatedAt: 0
}

const gen3Dex: DexConfig = {
	id: 'generation-3',
	configVersion: '',
	type: 'preset',
	name: 'generation-3',
	displayName: 'Generation 3',
	coverImage: 'gen3-cover.png',
	sortOrder: 3,
	tags: ['normal'],
	boxList: boxOrderNational.slice(0, 21), // 15, 21 is Hoenn-1 to Hoenn-Alternate
	pokemonOrder: [],
	createdAt: 0,
	updatedAt: 0
}

const gen4Dex: DexConfig = {
	id: 'generation-4',
	configVersion: '',
	type: 'preset',
	name: 'generation-4',
	displayName: 'Generation 4',
	coverImage: 'gen4-cover.png',
	sortOrder: 4,
	tags: ['normal'],
	boxList: boxOrderNational.slice(0, 28), // 21, 28 is Sinnoh-1 to Sinnoh-Alternate
	pokemonOrder: [],
	createdAt: 0,
	updatedAt: 0
}

const gen5Dex: DexConfig = {
	id: 'generation-5',
	configVersion: '',
	type: 'preset',
	name: 'generation-5',
	displayName: 'Generation 5',
	coverImage: 'gen5-cover.png',
	sortOrder: 5,
	tags: ['normal'],
	boxList: boxOrderNational.slice(0, 35), // 28, 35 is Unova-1 to Unova-Alternate
	pokemonOrder: [],
	createdAt: 0,
	updatedAt: 0
}

const gen6Dex: DexConfig = {
	id: 'generation-6',
	configVersion: '',
	type: 'preset',
	name: 'generation-6',
	displayName: 'Generation 6',
	coverImage: 'gen6-cover.png',
	sortOrder: 6,
	tags: ['normal'],
	boxList: boxOrderNational.slice(0, 41), // 36, 41 is Kalos-1 to Vivillon-Pattern
	pokemonOrder: [],
	createdAt: 0,
	updatedAt: 0
}

export const dexPresets = {
	nationalDex,
	gen1Dex,
	gen2Dex,
	gen3Dex,
	gen4Dex,
	gen5Dex,
	gen6Dex
}
