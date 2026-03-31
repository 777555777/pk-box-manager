import { readdir } from 'node:fs/promises'
import pokedexBoxes from '../src/lib/data/pokedex-boxes.json' with { type: 'json' }
import pkStats from '../src/lib/data/pk-stats.json' with { type: 'json' }
import type { PokemonEntry } from '../src/lib/models/data-models.ts'

interface StaticPokemonData {
	originRegion: string
	stats: number[]
	types: string[] | null
	abilities: string[] | null
	genderRatio: { male: number | null; female: number | null }
	entry: PokemonEntry
}

export const typedPkStats = pkStats as Record<string, StaticPokemonData>

export function getExpectedPokemonIds(): string[] {
	return Array.from(new Set(pokedexBoxes.flatMap((box) => box.pokemon)))
}

export function getBasePokemonIds(): string[] {
	return getExpectedPokemonIds().filter(
		(pokemonId) => typedPkStats[pokemonId]?.entry.formid === null
	)
}

export async function getAllPokemonImages(): Promise<{
	normal: Set<string>
	forms: Set<string>
	shinyNormal: Set<string>
	shinyForms: Set<string>
}> {
	const imageBasePath = './project-data/images/pokemon'
	const results = {
		normal: new Set<string>(),
		forms: new Set<string>(),
		shinyNormal: new Set<string>(),
		shinyForms: new Set<string>()
	}

	const directories = [
		{ path: `${imageBasePath}/normal`, set: results.normal },
		{ path: `${imageBasePath}/forms`, set: results.forms },
		{ path: `${imageBasePath}/shiny-normal`, set: results.shinyNormal },
		{ path: `${imageBasePath}/shiny-forms`, set: results.shinyForms }
	]

	for (const { path, set } of directories) {
		const dirEntries = await readdir(path, { recursive: true, withFileTypes: true })
		for (const entry of dirEntries) {
			if (entry.isFile() && /\.(png|jpg|webp)$/.test(entry.name)) {
				set.add(entry.name.replace(/\.(png|jpg|webp)$/, ''))
			}
		}
	}

	return results
}
