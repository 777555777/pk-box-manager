import { type DexState } from '../../state/storage-handler.ts'
import { dexPresets } from '../../data/pokedex.ts'

export function validateImportedDexState(importedFile: unknown): DexState {
	let dexData: DexState

	// 1. Check if the input is a valid JSON object
	if (typeof importedFile === 'string') {
		try {
			dexData = JSON.parse(importedFile)
		} catch (error) {
			console.error(error)
			throw new Error('The imported file does not contain valid JSON.')
		}
	} else if (typeof importedFile === 'object' && importedFile !== null) {
		dexData = importedFile as DexState // Assume the structure is correct from this point on
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

	// 2.1 Validate or set default coverImage
	if (!dexData.coverImage || typeof dexData.coverImage !== 'string') {
		// Set default based on supported pokedex list or fallback
		const dexConfig = dexPresets[dexData.name as keyof typeof dexPresets]
		if (dexConfig) {
			dexData.coverImage = dexConfig.coverImage
			console.warn(`Missing coverImage for ${dexData.name}, using default: ${dexConfig.coverImage}`)
		} else {
			dexData.coverImage = 'default-cover'
			console.warn(`Missing coverImage for ${dexData.name}, using fallback: default-cover`)
		}
	}

	// 2.2 Validate or set default sortOrder
	if (!dexData.sortOrder || typeof dexData.sortOrder !== 'object' || dexData.sortOrder === null) {
		// Set default based on supported pokedex list or fallback
		const dexConfig = dexPresets[dexData.name as keyof typeof dexPresets]
		if (dexConfig) {
			dexData.sortOrder = dexConfig.sortOrder
			console.warn(
				`Missing sortOrder for ${dexData.name}, using default: ${JSON.stringify(dexConfig.sortOrder)}`
			)
		} else {
			// For user-created or unknown dexes, use client type with high value
			dexData.sortOrder = { type: 'client', value: 1000 }
			console.warn(`Missing sortOrder for ${dexData.name}, using fallback: client/1000`)
		}
	} else {
		// Validate existing sortOrder structure
		if (!dexData.sortOrder.type || !['server', 'client'].includes(dexData.sortOrder.type)) {
			throw new Error('Invalid "sortOrder.type" property - must be "server" or "client".')
		}
		if (typeof dexData.sortOrder.value !== 'number') {
			throw new Error('Invalid "sortOrder.value" property - must be a number.')
		}
	}

	// 2.5 Check whether the data refers to a supported Dex
	if (!(dexData.name in supportedPokedexList)) {
		throw new Error(
			`Unsupported Pokedex: ${dexData.name}. Supported Pokedex types: ${Object.keys(supportedPokedexList).join(', ')}`
		)
	}

	// 2.6 Validate that we have a complete box structure in the import data
	// Since the import contains the full structure, we don't need to fetch from server
	if (!Array.isArray(dexData.boxes)) {
		throw new Error('Missing or invalid "boxes" array in the import file.')
	}

	if (dexData.boxes.length === 0) {
		throw new Error('Import file contains no boxes.')
	}

	// 3. Validate the existence and structure of the Pokémon object
	if (!dexData.pokemon || typeof dexData.pokemon !== 'object' || dexData.pokemon === null) {
		throw new Error('Missing or invalid "pokemon" object in the import file.')
	}

	// 4. Validate each individual Pokémon entry

	// Since we're validating a complete import, we validate the Pokemon structure
	// against the boxes that are also being imported
	const importedPokemonKeys = new Set(Object.keys(dexData.pokemon))
	const referencedPokemonKeys = new Set<string>()

	// Collect all pokemon references from boxes
	for (const box of dexData.boxes) {
		for (const pokemonKey of box.pokemon) {
			referencedPokemonKeys.add(pokemonKey)
		}
	}

	// Check if all referenced pokemon exist in the pokemon object
	for (const pokemonKey of referencedPokemonKeys) {
		if (!importedPokemonKeys.has(pokemonKey)) {
			throw new Error(
				`Pokemon "${pokemonKey}" is referenced in boxes but missing from pokemon object`
			)
		}
	}

	// Validate the structure of each Pokemon entry
	for (const pokemonKey in dexData.pokemon) {
		const pokemon = dexData.pokemon[pokemonKey]

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

		// Gracefully handle ribbons array (optional field with defaults)
		if (pokemon.ribbons !== undefined) {
			if (!Array.isArray(pokemon.ribbons)) {
				console.warn(`Invalid "ribbons" field for Pokémon: ${pokemonKey} - using empty array`)
				pokemon.ribbons = []
			} else {
				// Filter out non-string values
				const validRibbons = pokemon.ribbons.filter((ribbon) => typeof ribbon === 'string')
				if (validRibbons.length !== pokemon.ribbons.length) {
					console.warn(`Some invalid ribbons removed for Pokémon: ${pokemonKey}`)
				}
				pokemon.ribbons = validRibbons
			}
		} else {
			// Set default empty array if ribbons field is missing
			pokemon.ribbons = []
		}

		// Gracefully handle marks array (optional field with defaults)
		if (pokemon.marks !== undefined) {
			if (!Array.isArray(pokemon.marks)) {
				console.warn(`Invalid "marks" field for Pokémon: ${pokemonKey} - using empty array`)
				pokemon.marks = []
			} else {
				// Filter out non-string values
				const validMarks = pokemon.marks.filter((mark) => typeof mark === 'string')
				if (validMarks.length !== pokemon.marks.length) {
					console.warn(`Some invalid marks removed for Pokémon: ${pokemonKey}`)
				}
				pokemon.marks = validMarks
			}
		} else {
			// Set default empty array if marks field is missing
			pokemon.marks = []
		}
	}

	// 5. Validate each individual box entry (structure validation)
	for (let i = 0; i < dexData.boxes.length; i++) {
		const box = dexData.boxes[i]
		const boxIndex = `box[${i}]`

		// Check required fields for each box
		if (!box.id || typeof box.id !== 'string') {
			throw new Error(`Missing or invalid "id" field for ${boxIndex}`)
		}

		if (!box.title || typeof box.title !== 'string') {
			throw new Error(`Missing or invalid "title" field for ${boxIndex}`)
		}

		// Validate settings object
		if (!box.settings || typeof box.settings !== 'object' || box.settings === null) {
			throw new Error(`Missing or invalid "settings" object for ${boxIndex}`)
		}

		// Validate wallpaper in settings
		if (!box.settings.wallpaper || typeof box.settings.wallpaper !== 'string') {
			throw new Error(`Missing or invalid "wallpaper" in settings for ${boxIndex}`)
		}

		// Validate pokemon array
		if (!Array.isArray(box.pokemon)) {
			throw new Error(`Missing or invalid "pokemon" array for ${boxIndex}`)
		}

		// Validate that each pokemon reference exists in the pokemon object
		for (const pokemonKey of box.pokemon) {
			if (typeof pokemonKey !== 'string') {
				throw new Error(
					`Invalid pokemon reference in ${boxIndex}: expected string, got ${typeof pokemonKey}`
				)
			}

			if (!dexData.pokemon[pokemonKey]) {
				throw new Error(
					`Pokemon reference "${pokemonKey}" in ${boxIndex} does not exist in the pokemon object`
				)
			}
		}
	}

	// 6. If all validations pass, return the verified file
	return dexData
}
