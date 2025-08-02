/// <reference lib="deno.ns" />
import { assertEquals, assertExists } from 'https://deno.land/std@0.207.0/assert/mod.ts'
import { walk } from 'https://deno.land/std@0.207.0/fs/walk.ts'
import { pkStats } from '../src/routes/pkinfo/pk-stats.ts'

interface PokemonEntry {
	pokemonid: string
	formid: string | null
	id_national: number
}

interface BoxData {
	title: string
	pokemon: PokemonEntry[]
}

/**
 * Generiert den erwarteten Stats-Key basierend auf National Dex Nummer, Pokemon ID und Form ID
 */
function generateStatsKey(nationalId: number, pokemonId: string, formId: string | null): string {
	const paddedId = nationalId.toString().padStart(4, '0')

	if (formId) {
		// Spezialbehandlung für Unown: formid kann "a" oder "unown-a" sein
		if (pokemonId === 'unown' && formId.startsWith('unown-')) {
			// Entferne das "unown-" Prefix: "unown-a" -> "a"
			const letter = formId.replace('unown-', '')
			return `${paddedId}-${pokemonId}-${letter}`
		}
		return `${paddedId}-${pokemonId}-${formId}`
	}
	return `${paddedId}-${pokemonId}`
}

/**
 * Sammelt alle Pokemon aus allen JSON-Dateien im pkorder/order Verzeichnis
 */
async function getAllPokemonFromOrderFiles(): Promise<PokemonEntry[]> {
	const allPokemon: PokemonEntry[] = []
	const orderDir = './src/routes/pkorder/order'

	for await (const entry of walk(orderDir, { exts: ['.json'] })) {
		if (entry.isFile) {
			try {
				const content = await Deno.readTextFile(entry.path)
				const boxData: BoxData[] = JSON.parse(content)

				for (const box of boxData) {
					allPokemon.push(...box.pokemon)
				}
			} catch (error) {
				console.warn(`Warnung: Konnte ${entry.path} nicht lesen:`, error)
			}
		}
	}

	return allPokemon
}

Deno.test(
	'Alle Pokemon aus pkorder JSON-Dateien haben entsprechende Stats in pk-stats.ts',
	async () => {
		console.log('🔍 Sammle alle Pokemon aus pkorder JSON-Dateien...')

		const allPokemon = await getAllPokemonFromOrderFiles()

		console.log(`📊 Gefunden: ${allPokemon.length} Pokemon-Einträge`)

		const missingStats: string[] = []
		const checkedKeys = new Set<string>()

		for (const pokemon of allPokemon) {
			const statsKey = generateStatsKey(pokemon.id_national, pokemon.pokemonid, pokemon.formid)

			// Vermeide Duplikate in der Prüfung
			if (checkedKeys.has(statsKey)) {
				continue
			}
			checkedKeys.add(statsKey)

			if (!(statsKey in pkStats)) {
				// Fallback: Prüfe, ob es eine Default-Form gibt (ohne form)
				const baseKey = generateStatsKey(pokemon.id_national, pokemon.pokemonid, null)

				// Fallback: Prüfe, ob es alternative Schreibweisen gibt
				const possibleKeys = [
					statsKey,
					baseKey
					// Weitere Fallbacks können hier hinzugefügt werden
				]

				const hasAnyStats = possibleKeys.some((key) => key in pkStats)

				if (!hasAnyStats) {
					missingStats.push(statsKey)
				}
			}
		}

		console.log(`✅ Eindeutige Pokemon geprüft: ${checkedKeys.size}`)

		if (missingStats.length > 0) {
			console.error(`❌ Fehlende Stats für ${missingStats.length} Pokemon:`)
			missingStats.forEach((key) => console.error(`  - ${key}`))

			// Zeige auch ein paar Beispiele von verfügbaren Keys zum Vergleich
			const availableKeys = Object.keys(pkStats).slice(0, 5)
			console.log(`\n📝 Beispiele verfügbarer Stats-Keys: ${availableKeys.join(', ')}`)

			// Zeige related Keys für besseres Debugging
			console.log(`\n🔍 Suche nach ähnlichen Keys für die ersten fehlenden Pokemon:`)
			missingStats.slice(0, 3).forEach((missingKey) => {
				const relatedKeys = Object.keys(pkStats)
					.filter(
						(key) => key.includes(missingKey.split('-')[1]) // Suche nach Pokemon-Namen
					)
					.slice(0, 3)
				console.log(`  ${missingKey} -> ähnliche Keys: ${relatedKeys.join(', ')}`)
			})
		} else {
			console.log('🎉 Alle Pokemon haben entsprechende Stats!')
		}

		assertEquals(missingStats.length, 0, `Fehlende Stats für Pokemon: ${missingStats.join(', ')}`)
	}
)

Deno.test('pk-stats.ts ist korrekt importierbar', () => {
	assertExists(pkStats)

	// Prüfe, dass pkStats ein Objekt ist und mindestens einen Eintrag hat
	assertEquals(typeof pkStats, 'object')

	const statsKeys = Object.keys(pkStats)
	console.log(`📊 Anzahl verfügbarer Stats: ${statsKeys.length}`)

	// Mindestens Bulbasaur sollte da sein
	assertExists(pkStats['0001-bulbasaur'], 'Bulbasaur Stats sollten verfügbar sein')
})

Deno.test('Beispiel-Validierung der Stats-Struktur', () => {
	const bulbasaurStats = pkStats['0001-bulbasaur']

	assertExists(bulbasaurStats)
	assertExists(bulbasaurStats.stats)
	assertExists(bulbasaurStats.types)
	assertExists(bulbasaurStats.abilities)
	assertExists(bulbasaurStats.genderRatio)

	// Stats sollten ein Array mit 6 Zahlen sein (HP, Atk, Def, SpA, SpD, Spe)
	assertEquals(bulbasaurStats.stats.length, 6)

	console.log('✅ Stats-Struktur Validierung erfolgreich')
})
