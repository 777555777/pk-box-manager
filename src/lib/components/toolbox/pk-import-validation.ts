import { getIdentifier } from '../../spriteheet-helper.ts'
import { pkState } from '../../state/pk-state.svelte.ts'
import { type DexStorage } from '../../state/storage-handler.ts'

export async function validateImportedDexState(importedFile: unknown): Promise<DexStorage> {
	let dexData: DexStorage

	// 1. Check if the input is a valid JSON object
	if (typeof importedFile === 'string') {
		try {
			dexData = JSON.parse(importedFile)
		} catch (error) {
			console.error(error)
			throw new Error('The imported file does not contain valid JSON.')
		}
	} else if (typeof importedFile === 'object' && importedFile !== null) {
		dexData = importedFile as DexStorage // Assume the structure is correct from this point on
	} else {
		throw new Error('The imported file has an invalid format.')
	}

	// 2. Validate required metadata fields
	if (!dexData.version || typeof dexData.version !== 'string') {
		throw new Error('Missing or invalid "version" property in the import file.')
	}

	if (!dexData.name || typeof dexData.name !== 'string') {
		throw new Error('Missing or invalid "name" property in the import file.')
	}

	if (!dexData.displayName || typeof dexData.displayName !== 'string') {
		throw new Error('Missing or invalid "displayName" property in the import file.')
	}

	// 2.5 Check whether the data refers to a supported Dex
	const targetDex = await pkState.loadBoxOrder(dexData.name)
	if (!targetDex) {
		throw new Error('Invalid value in the "name" property – no matching Dex found.')
	}

	// 3. Validate the existence and structure of the Pokémon object
	if (!dexData.pokemon || typeof dexData.pokemon !== 'object' || dexData.pokemon === null) {
		throw new Error('Missing or invalid "pokemon" object in the import file.')
	}

	// 4. Validate each individual Pokémon entry

	// Create a list of all valid Pokémon identifiers for this Dex
	const dexPokemon = []
	for (const box of targetDex) {
		for (const pokemon of box.pokemon) {
			dexPokemon.push(getIdentifier(pokemon))
		}
	}

	for (const pokemonKey in dexData.pokemon) {
		const pokemon = dexData.pokemon[pokemonKey]

		if (!dexPokemon.includes(getIdentifier(pokemon.idEntry))) {
			console.log('pokemon', pokemon)
			throw new Error(
				`The Pokémon ${pokemonKey} is not part of the Pokédex: ${dexData.name} : ${pokemonKey}`
			)
		}

		// Check the structure of each Pokémon entry
		if (!pokemon.idEntry || typeof pokemon.idEntry !== 'object') {
			throw new Error(`Missing or invalid "idEntry" for Pokémon: ${pokemonKey}`)
		}

		const idEntry = pokemon.idEntry
		// We want to allow: string
		if (!idEntry.pokemonid || typeof idEntry.pokemonid !== 'string') {
			throw new Error(`Missing or invalid "pokemonid" for Pokémon: ${pokemonKey}`)
		}

		// We want to allow: string || null
		if (typeof idEntry.formid !== 'string' && idEntry.formid !== null) {
			throw new Error(`Missing or invalid "formid" for Pokémon: ${pokemonKey}`)
		}

		// We want to allow: number
		if (idEntry.id_national === undefined || typeof idEntry.id_national !== 'number') {
			throw new Error(`Missing or invalid "id_national" for Pokémon: ${pokemonKey}`)
		}

		// Validate required fields for each Pokémon entry
		// We want to allow: boolean
		if (pokemon.captured === undefined || typeof pokemon.captured !== 'boolean') {
			throw new Error(`Missing or invalid "captured" field for Pokémon: ${pokemonKey}`)
		}

		// We want to allow: string
		if (!pokemon.ball || typeof pokemon.ball !== 'string') {
			// Optionally: Validate that the ball is one of the supported types
			throw new Error(`Missing or invalid "ball" field for Pokémon: ${pokemonKey}`)
		}

		if (pokemon.shiny === undefined || typeof pokemon.shiny !== 'boolean') {
			throw new Error(`Missing or invalid "shiny" field for Pokémon: ${pokemonKey}`)
		}

		// Validate optional fields (can be empty, but must be strings if present)
		// We want to allow: string
		if (pokemon.caughtIn !== undefined && typeof pokemon.caughtIn !== 'string') {
			throw new Error(`Invalid "caughtIn" field for Pokémon: ${pokemonKey}`)
		}
		// We want to allow: string
		if (pokemon.ability !== undefined && typeof pokemon.ability !== 'string') {
			throw new Error(`Invalid "ability" field for Pokémon: ${pokemonKey}`)
		}
		// We want to allow: string
		if (pokemon.comment !== undefined && typeof pokemon.comment !== 'string') {
			throw new Error(`Invalid "comment" field for Pokémon: ${pokemonKey}`)
		}
		// We want to allow: boolean
		if (pokemon.isCustomized === undefined || typeof pokemon.isCustomized !== 'boolean') {
			throw new Error(`Missing or invalid "isCustomized" field for Pokémon: ${pokemonKey}`)
		}
	}

	// 5. If all validations pass, return the verified file
	return dexData
}
