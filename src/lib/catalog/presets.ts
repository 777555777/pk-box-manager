import type { PresetDefinition } from './types.ts'

/**
 * Box order of the National Dex. New games append their boxes at the end,
 * existing preset dexes then show the new boxes automatically.
 */
const NATIONAL_BOXES = [
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

/** All National Dex boxes up to and including `lastBoxId`. */
function nationalThrough(lastBoxId: string): string[] {
	const index = NATIONAL_BOXES.indexOf(lastBoxId)
	if (index === -1) throw new Error(`Unknown national box "${lastBoxId}"`)
	return NATIONAL_BOXES.slice(0, index + 1)
}

/** Preset dexes in display order. Ids are persisted in user data and must never change. */
export const presetDefinitions: PresetDefinition[] = [
	{ id: 'national', name: 'National Dex', coverImage: 'national.png', boxes: NATIONAL_BOXES },
	{
		id: 'generation-1',
		name: 'Generation 1',
		coverImage: 'gen-1.png',
		boxes: nationalThrough('cap-pikachu')
	},
	{
		id: 'generation-2',
		name: 'Generation 2',
		coverImage: 'gen-2.png',
		boxes: nationalThrough('unown-dex')
	},
	{
		id: 'generation-3',
		name: 'Generation 3',
		coverImage: 'gen-3.png',
		boxes: nationalThrough('hoenn-alternate')
	},
	{
		id: 'generation-4',
		name: 'Generation 4',
		coverImage: 'gen-4.png',
		boxes: nationalThrough('sinnoh-alternate')
	},
	{
		id: 'generation-5',
		name: 'Generation 5',
		coverImage: 'gen-5.png',
		boxes: nationalThrough('unova-alternate')
	},
	{
		id: 'generation-6',
		name: 'Generation 6',
		coverImage: 'gen-6.png',
		boxes: nationalThrough('vivillon-pattern')
	}
]
