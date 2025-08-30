import { parse, ValiError, flatten } from 'valibot'
import { DexSaveSchema, type ValidatedDexSave } from './dex-schemas.ts'
import { getIdentifier } from '../spriteheet-helper.ts'

/**
 * Validates an imported DexSave object against the schema.
 * Performs both structural validation and logical consistency checks.
 *
 * @param importedFile - The raw imported data (JSON string or object)
 * @returns Validated DexSave object
 * @throws Error with descriptive message if validation fails
 */
export function validateImportedDexSave(importedFile: unknown): ValidatedDexSave {
	const rawData = parseImportedData(importedFile)
	const validatedDex = validateStructure(rawData)
	validateConsistency(validatedDex)

	return validatedDex
}

/**
 * Parses the imported data from string or object format.
 */
function parseImportedData(importedFile: unknown): unknown {
	if (typeof importedFile === 'string') {
		try {
			return JSON.parse(importedFile)
		} catch {
			throw new Error('The imported file does not contain valid JSON.')
		}
	}

	if (typeof importedFile === 'object' && importedFile !== null) {
		return importedFile
	}

	throw new Error('The imported file has an invalid format. Expected JSON string or object.')
}

/**
 * Validates the data structure against the Valibot schema.
 */
function validateStructure(rawData: unknown): ValidatedDexSave {
	try {
		return parse(DexSaveSchema, rawData)
	} catch (error) {
		if (error instanceof ValiError) {
			const errorMessages = flatten(error.issues)

			// Cast the flattened nested errors to a known shape so TypeScript knows 'details' is string[]
			const nested = (errorMessages as unknown as { nested: Record<string, string[]> }).nested

			const messages = Object.entries(nested).map(
				([field, details]) => `${field}:\n${details.join(', ')}\n`
			)

			throw new Error(`Schema validation failed:\n\n${messages.join('\n')}`)
		}

		const errorMessage = error instanceof Error ? error.message : 'Unknown validation error'
		throw new Error(`Schema validation failed: ${JSON.stringify({ errorMessage }, null, 2)}`)
	}
}

/**
 * Performs additional consistency checks between config, state, and meta sections.
 */
function validateConsistency(dex: ValidatedDexSave): void {
	validatePokemonReferences(dex)
	validatePokemonOrderConsistency(dex)
	validateTimestamps(dex)
	validateMetaCounters(dex)
}

/**
 * Validates that all pokemon referenced in boxes actually exist in the pokemon object.
 */
function validatePokemonReferences(dex: ValidatedDexSave): void {
	const statePokemonKeys = new Set(Object.keys(dex.state.pokemon))
	const referencedPokemonKeys = new Set<string>()

	// Collect all pokemon references from boxes
	for (const box of dex.state.boxes) {
		for (const pokemonKey of box.pokemon) {
			referencedPokemonKeys.add(pokemonKey)
		}
	}

	// Check if all referenced pokemon exist in the pokemon object
	for (const pokemonKey of referencedPokemonKeys) {
		if (!statePokemonKeys.has(pokemonKey)) {
			throw new Error(
				`Pokemon "${pokemonKey}" is referenced in boxes but missing from pokemon object`
			)
		}
	}
}

/**
 * Validates that pokemon in config.pokemonOrder match with state.pokemon entries.
 * Also validates that pokemon IDs are consistent across the data structure.
 */
function validatePokemonOrderConsistency(dex: ValidatedDexSave): void {
	const statePokemonKeys = new Set(Object.keys(dex.state.pokemon))
	const configPokemonIds = new Set<string>()
	const inconsistencies: string[] = []

	// Collect all pokemon IDs from config.pokemonOrder
	for (const section of dex.config.pokemonOrder) {
		for (const pokemon of section.pokemon) {
			const expectedKey = getIdentifier(pokemon)
			configPokemonIds.add(expectedKey)

			// Check if the corresponding state pokemon exists
			if (!statePokemonKeys.has(expectedKey)) {
				inconsistencies.push(
					`Pokemon "${pokemon.pokemonid}" (${expectedKey}) from config.pokemonOrder is missing in state.pokemon`
				)
			} else {
				// Validate that the pokemon data is consistent
				const statePokemon = dex.state.pokemon[expectedKey]
				if (
					statePokemon.idEntry.pokemonid !== pokemon.pokemonid ||
					statePokemon.idEntry.id_national !== pokemon.id_national ||
					statePokemon.idEntry.formid !== pokemon.formid
				) {
					inconsistencies.push(
						`Pokemon "${expectedKey}" has inconsistent data between config.pokemonOrder and state.pokemon`
					)
				}
			}
		}
	}

	// Check for state pokemon that are not in config.pokemonOrder
	for (const pokemonKey of statePokemonKeys) {
		if (!configPokemonIds.has(pokemonKey)) {
			inconsistencies.push(
				`Pokemon "${pokemonKey}" exists in state.pokemon but is missing from config.pokemonOrder`
			)
		}
	}

	if (inconsistencies.length > 0) {
		throw new Error(`Pokemon data inconsistencies found:\n- ${inconsistencies.join('\n- ')}`)
	}
}

/**
 * Validates timestamp logic (createdAt should not be after updatedAt).
 */
function validateTimestamps(dex: ValidatedDexSave): void {
	const { createdAt, updatedAt } = dex.meta

	if (createdAt > updatedAt) {
		throw new Error(
			`Invalid timestamps: createdAt (${createdAt}) cannot be greater than updatedAt (${updatedAt})`
		)
	}
}

/**
 * Validates that meta counters make logical sense.
 */
function validateMetaCounters(dex: ValidatedDexSave): void {
	const { totalPokemon, totalCaught, totalShiny } = dex.meta

	if (totalCaught > totalPokemon) {
		throw new Error(
			`Invalid counters: totalCaught (${totalCaught}) cannot be greater than totalPokemon (${totalPokemon})`
		)
	}

	if (totalShiny > totalCaught) {
		throw new Error(
			`Invalid counters: totalShiny (${totalShiny}) cannot be greater than totalCaught (${totalCaught})`
		)
	}
}

/**
 * Type guard to check if an object is a valid DexSave.
 *
 * @param obj - Object to check
 * @returns True if object is a valid DexSave
 */
export function isDexSave(obj: unknown): obj is ValidatedDexSave {
	try {
		parse(DexSaveSchema, obj)
		return true
	} catch {
		return false
	}
}

/**
 * Validates and sanitizes optional fields with default values.
 * Ensures that optional arrays and strings have sensible defaults.
 *
 * @param dex - The validated dex to sanitize
 * @returns Sanitized dex with proper defaults
 */
export function sanitizeOptionalFields(dex: ValidatedDexSave): ValidatedDexSave {
	// Create a deep copy to avoid mutations
	const sanitizedDex = structuredClone(dex)

	// Sanitize pokemon optional fields
	for (const pokemon of Object.values(sanitizedDex.state.pokemon)) {
		// Ensure arrays are never null/undefined
		pokemon.ribbons = Array.isArray(pokemon.ribbons) ? pokemon.ribbons : []
		pokemon.marks = Array.isArray(pokemon.marks) ? pokemon.marks : []

		// Ensure strings are never null/undefined
		pokemon.caughtIn = pokemon.caughtIn || ''
		pokemon.ability = pokemon.ability || ''
		pokemon.comment = pokemon.comment || ''
	}

	return sanitizedDex
}
