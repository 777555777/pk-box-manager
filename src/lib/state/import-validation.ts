import { getIdentifier } from '../spriteheet-helper.ts'
import { getBoxOrder, type DexStorage } from './storage-handler.ts'

export function validateImportedDexState(importedFile: unknown): DexStorage {
	let dexData: DexStorage

	// 1. Prüfen, ob es sich um ein gültiges JSON-Objekt handelt
	if (typeof importedFile === 'string') {
		try {
			dexData = JSON.parse(importedFile)
		} catch (error) {
			console.error(error)
			throw new Error('Die importierte Datei enthält kein gültiges JSON.')
		}
	} else if (typeof importedFile === 'object' && importedFile !== null) {
		dexData = importedFile as DexStorage // Assume from here on that the import has the required structure
	} else {
		throw new Error('Die importierte Datei hat ein ungültiges Format.')
	}

	// 2. Prüfen der erforderlichen Metadaten
	if (!dexData.version || typeof dexData.version !== 'string') {
		throw new Error('Ungültige oder fehlende Version in der Importdatei.')
	}

	if (!dexData.name || typeof dexData.name !== 'string') {
		throw new Error('Ungültiger oder fehlender Dex Name in der Importdatei.')
	}

	if (!dexData.displayName || typeof dexData.displayName !== 'string') {
		throw new Error('Ungültiger oder fehlender Anzeigename in der Importdatei.')
	}

	// // 2.5 Prüfen ob die Daten zu einem supporteten Dex gehören
	if (!getBoxOrder(dexData.name)) {
		throw new Error('Ungültiger Wert in der Eigenschaft "name"')
	}

	// 3. Prüfen des Pokemon-Objekts
	if (!dexData.pokemon || typeof dexData.pokemon !== 'object' || dexData.pokemon === null) {
		throw new Error('Ungültiges oder fehlendes Pokemon-Objekt in der Importdatei.')
	}

	// 4. Prüfen jedes Pokemon-Eintrags

	// Liste aller valider Pokemon im Dex erstellen
	const targetDex = getBoxOrder(dexData.name)
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
				`Das Pokemon ${pokemonKey} ist nicht teil des Pokedexs: ${dexData.name} : ${pokemonKey}`
			)
		}

		// Prüfen der Struktur jedes Pokemon-Eintrags
		if (!pokemon.idEntry || typeof pokemon.idEntry !== 'object') {
			throw new Error(`Ungültiger oder fehlender idEntry für Pokemon: ${pokemonKey}`)
		}

		const idEntry = pokemon.idEntry
		// We want to allow: string
		if (!idEntry.pokemonid || typeof idEntry.pokemonid !== 'string') {
			throw new Error(`Ungültige oder fehlende pokemonid für Pokemon: ${pokemonKey}`)
		}

		// We want to allow: string || null
		if (typeof idEntry.formid !== 'string' && idEntry.formid !== null) {
			throw new Error(`Ungültige oder fehlende formid für Pokemon: ${pokemonKey}`)
		}

		// We want to allow: number
		if (idEntry.id_national === undefined || typeof idEntry.id_national !== 'number') {
			throw new Error(`Ungültige oder fehlende id_national für Pokemon: ${pokemonKey}`)
		}

		// Prüfen der erforderlichen Felder für jeden Pokemon-Eintrag
		// We want to allow: boolean
		if (pokemon.captured === undefined || typeof pokemon.captured !== 'boolean') {
			throw new Error(`Ungültiges oder fehlendes 'captured' Feld für Pokemon: ${pokemonKey}`)
		}

		// We want to allow: string
		if (!pokemon.ball || typeof pokemon.ball !== 'string') {
			// we could even check if the ball is supported
			throw new Error(`Ungültiges oder fehlendes 'ball' Feld für Pokemon: ${pokemonKey}`)
		}

		// We want to allow: boolean
		if (pokemon.shiny === undefined || typeof pokemon.shiny !== 'boolean') {
			throw new Error(`Ungültiges oder fehlendes 'shiny' Feld für Pokemon: ${pokemonKey}`)
		}

		// Optionale Felder prüfen (könnten leer sein, aber sollten String-Typ haben)
		// We want to allow: string
		if (pokemon.caughtIn !== undefined && typeof pokemon.caughtIn !== 'string') {
			throw new Error(`Ungültiges 'caughtIn' Feld für Pokemon: ${pokemonKey}`)
		}

		// We want to allow: string
		if (pokemon.ability !== undefined && typeof pokemon.ability !== 'string') {
			throw new Error(`Ungültiges 'ability' Feld für Pokemon: ${pokemonKey}`)
		}

		// We want to allow: string
		if (pokemon.comment !== undefined && typeof pokemon.comment !== 'string') {
			throw new Error(`Ungültiges 'comment' Feld für Pokemon: ${pokemonKey}`)
		}
	}

	// 5. Wenn alle Prüfungen bestanden wurden, geben wir die validierte Datei zurück
	return dexData
}
