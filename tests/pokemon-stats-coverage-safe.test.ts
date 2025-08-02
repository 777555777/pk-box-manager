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

// NON-BREAKING Test: Zeigt fehlende Stats an, aber lässt Tests nicht fehlschlagen
Deno.test('Pokemon Stats Coverage Report (informativ)', async () => {
	console.log('🔍 Pokemon Stats Coverage Report')
	console.log('='.repeat(50))

	const allPokemon = await getAllPokemonFromOrderFiles()
	console.log(`📊 Gesamt Pokemon-Einträge in JSON: ${allPokemon.length}`)

	const missingStats: string[] = []
	const checkedKeys = new Set<string>()

	for (const pokemon of allPokemon) {
		const statsKey = generateStatsKey(pokemon.id_national, pokemon.pokemonid, pokemon.formid)

		if (checkedKeys.has(statsKey)) {
			continue
		}
		checkedKeys.add(statsKey)

		if (!(statsKey in pkStats)) {
			const baseKey = generateStatsKey(pokemon.id_national, pokemon.pokemonid, null)
			const hasAnyStats = [statsKey, baseKey].some((key) => key in pkStats)

			if (!hasAnyStats) {
				missingStats.push(statsKey)
			}
		}
	}

	console.log(`✅ Eindeutige Pokemon geprüft: ${checkedKeys.size}`)
	console.log(`📈 Pokemon mit Stats: ${checkedKeys.size - missingStats.length}`)
	console.log(`❌ Pokemon ohne Stats: ${missingStats.length}`)
	console.log(
		`📊 Coverage: ${(((checkedKeys.size - missingStats.length) / checkedKeys.size) * 100).toFixed(1)}%`
	)

	if (missingStats.length > 0) {
		console.log(`\n❌ Fehlende Stats:`)
		missingStats.forEach((key) => console.log(`  - ${key}`))

		console.log(`\n🔍 Ähnliche verfügbare Keys (für Debugging):`)
		missingStats.slice(0, 3).forEach((missingKey) => {
			const pokemonName = missingKey.split('-')[1]
			const relatedKeys = Object.keys(pkStats)
				.filter((key) => key.includes(pokemonName))
				.slice(0, 3)
			console.log(`  ${missingKey} -> ${relatedKeys.join(', ')}`)
		})
	} else {
		console.log('🎉 Perfekte Coverage! Alle Pokemon haben Stats!')
	}

	// Dieser Test schlägt nie fehl - er ist nur informativ
	console.log('\n✅ Report completed')
})

// BREAKING Test: Schlägt fehl wenn kritische Pokemon keine Stats haben
Deno.test('Kritische Pokemon haben Stats', async () => {
	const allPokemon = await getAllPokemonFromOrderFiles()
	const criticalMissing: string[] = []

	// Basis-Pokemon (ohne Forms) sollten immer Stats haben
	const basePokemon = allPokemon.filter((p) => p.formid === null)
	const uniqueBasePokemon = Array.from(
		new Set(basePokemon.map((p) => `${p.id_national}-${p.pokemonid}`))
	)

	for (const basePokemonKey of uniqueBasePokemon) {
		const [nationalId, pokemonId] = basePokemonKey.split('-')
		const statsKey = generateStatsKey(parseInt(nationalId), pokemonId, null)

		if (!(statsKey in pkStats)) {
			criticalMissing.push(statsKey)
		}
	}

	if (criticalMissing.length > 0) {
		console.error(`❌ Kritische fehlende Basis-Pokemon Stats: ${criticalMissing.join(', ')}`)
	}

	assertEquals(criticalMissing.length, 0, `Basis-Pokemon ohne Stats: ${criticalMissing.join(', ')}`)
})

Deno.test('pk-stats.ts ist korrekt importierbar', () => {
	assertExists(pkStats)
	assertEquals(typeof pkStats, 'object')

	const statsKeys = Object.keys(pkStats)
	console.log(`📊 Anzahl verfügbarer Stats: ${statsKeys.length}`)

	assertExists(pkStats['0001-bulbasaur'], 'Bulbasaur Stats sollten verfügbar sein')
})

Deno.test('Stats-Struktur Validierung', () => {
	const bulbasaurStats = pkStats['0001-bulbasaur']

	assertExists(bulbasaurStats)
	assertExists(bulbasaurStats.stats)
	assertExists(bulbasaurStats.types)
	assertExists(bulbasaurStats.abilities)
	assertExists(bulbasaurStats.genderRatio)

	assertEquals(bulbasaurStats.stats.length, 6)
	console.log('✅ Stats-Struktur ist valid')
})
