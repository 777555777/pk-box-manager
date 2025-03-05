import { type PokemonEntry } from './models/data-models.ts'
import { Pokemon } from './models/pokemon-models.ts'
import { Forms } from './models/forms-models.ts'

interface SpriteData {
	sheet: string
	pos: Coordinates
}

type Coordinates = { x: number; y: number }

export const combinedPokemon: Record<string, SpriteData> = { ...Pokemon, ...Forms }

// TODO: This function is a duplicate. the same function is in storage-handler.ts
export function getIdentifier(entry: PokemonEntry) {
	const paddedId = entry.id_national.toString().padStart(4, '0')
	return `${paddedId}-${entry.pokemonid}${entry.formid ? '-' + entry.formid : ''}`
}

export function getPokemon(identifier: string): SpriteData {
	if (identifier in combinedPokemon) {
		return combinedPokemon[identifier]
	}
	// return null object Pokemon
	// displays as questionmark icon
	return combinedPokemon['0000-null']
}

export function setCssPosition(pos: Coordinates) {
	return `object-position: ${pos.x}px ${pos.y}px;`
}
