import type { PokemonId } from '../catalog/types.ts'
import type { DexEntry, DexStats } from './types.ts'

/**
 * Counts the pokemon of a dex. Only entries whose pokemon is part of the layout
 * are counted, orphaned entries (e.g. after a layout change) are ignored.
 * @param layoutPokemonIds all pokemon ids of the resolved layout
 */
export function computeStats(
	layoutPokemonIds: Iterable<PokemonId>,
	entries: Iterable<Pick<DexEntry, 'pokemonId' | 'captured' | 'shiny'>>
): DexStats {
	const inLayout = new Set(layoutPokemonIds)
	let caught = 0
	let shiny = 0

	for (const entry of entries) {
		if (!entry.captured || !inLayout.has(entry.pokemonId)) continue
		caught++
		if (entry.shiny) shiny++
	}

	return { total: inLayout.size, caught, shiny }
}
