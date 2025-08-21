import { type PokemonEntry } from './models/data-models.ts'
import { Pokemon } from './models/pokemon-models.ts'
import { Forms } from './models/forms-models.ts'
import pkStats from './data/pk-stats.json' with { type: 'json' }

interface SpriteData {
	sheet: string
	pos: Coordinates
}

type PkStatsIdentifier = keyof typeof pkStats

type Coordinates = { x: number; y: number }

export const combinedPokemon: Record<string, SpriteData> = { ...Pokemon, ...Forms }

// TODO: This function is a duplicate. the same function is in storage-handler.ts
export function getIdentifier(entry: PokemonEntry): PkStatsIdentifier {
	const paddedId = entry.id_national.toString().padStart(4, '0')
	return `${paddedId}-${entry.pokemonid}${entry.formid ? '-' + entry.formid : ''}` as PkStatsIdentifier
}

export function getPokemonSpriteData(identifier: string): SpriteData {
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

export function getBackgroundStyle(
	rows: number,
	columns: number,
	spriteWidth: number,
	spriteHeight: number,
	spriteData: Coordinates
) {
	// Calculate the index of the sprite in the sprite sheet
	const xIndex = Math.abs(spriteData.x / spriteWidth)
	const yIndex = Math.abs(spriteData.y / spriteHeight)

	const percentX = (xIndex / (columns - 1)) * 100
	const percentY = (yIndex / (rows - 1)) * 100

	// console.log(`xIndex: ${xIndex}, yIndex: ${yIndex}, percentX: ${percentX}, percentY: ${percentY}`)
	// console.log(
	// 	`background-Size: ${columns * 100}% ${rows * 100}%; background-Position: ${percentX}% ${percentY}%;`
	// )
	return `background-Size: ${columns * 100}% ${rows * 100}%; background-Position: ${percentX}% ${percentY}%;`
}
