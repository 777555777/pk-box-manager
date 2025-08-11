/// <reference lib="deno.ns" />
import { assertEquals, assertExists } from 'https://deno.land/std@0.207.0/assert/mod.ts'
import { walk } from 'https://deno.land/std@0.207.0/fs/walk.ts'
import pkStats from '../src/routes/pkinfo/pk-stats.json' with { type: 'json' }

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

/**
 * Sammelt alle verfügbaren Bilder aus den Pokemon-Image-Verzeichnissen
 */
async function getAllPokemonImages(): Promise<{
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
		try {
			for await (const entry of walk(path, { exts: ['.png', '.jpg', '.webp'] })) {
				if (entry.isFile) {
					// Extrahiere nur den Dateinamen ohne Erweiterung
					const fileName = entry.name.replace(/\.(png|jpg|webp)$/, '')
					set.add(fileName)
				}
			}
		} catch (error) {
			console.warn(`Warnung: Konnte Bilder-Verzeichnis ${path} nicht lesen:`, error)
		}
	}

	return results
}

// Nicht-fehlschlagender Informationstest
Deno.test('Pokemon Stats Coverage Report', async () => {
	console.log('🔍 Pokemon Stats Coverage Analysis')
	console.log('='.repeat(60))

	const allPokemon = await getAllPokemonFromOrderFiles()
	console.log(`📊 Gesamt Pokemon-Einträge in JSON-Dateien: ${allPokemon.length}`)

	const missingStats: string[] = []
	const foundStats: string[] = []
	const checkedKeys = new Set<string>()

	for (const pokemon of allPokemon) {
		const statsKey = generateStatsKey(pokemon.id_national, pokemon.pokemonid, pokemon.formid)

		if (checkedKeys.has(statsKey)) {
			continue
		}
		checkedKeys.add(statsKey)

		if (statsKey in pkStats) {
			foundStats.push(statsKey)
		} else {
			// Prüfe Fallbacks für bessere Toleranz
			const possibleKeys = [
				statsKey,
				generateStatsKey(pokemon.id_national, pokemon.pokemonid, null) // ohne Form
			]

			const hasAnyStats = possibleKeys.some((key) => key in pkStats)

			if (hasAnyStats) {
				foundStats.push(statsKey)
			} else {
				missingStats.push(statsKey)
			}
		}
	}

	const coveragePercent = ((foundStats.length / checkedKeys.size) * 100).toFixed(1)

	console.log(`✅ Eindeutige Pokemon analysiert: ${checkedKeys.size}`)
	console.log(`📈 Pokemon mit verfügbaren Stats: ${foundStats.length}`)
	console.log(`❌ Pokemon ohne verfügbare Stats: ${missingStats.length}`)
	console.log(`📊 Stats Coverage: ${coveragePercent}%`)

	if (missingStats.length > 0) {
		console.log(`\n❌ Pokemon ohne passende Stats (Top 10):`)
		missingStats.slice(0, 10).forEach((key, i) => {
			console.log(`  ${i + 1}. ${key}`)
		})

		if (missingStats.length > 10) {
			console.log(`  ... und ${missingStats.length - 10} weitere`)
		}
	}

	// Dieser Test dokumentiert nur - er schlägt nie fehl
	console.log(`\n✅ Report abgeschlossen`)
	console.log(`💡 Hinweis: Dieser Test dient zur Dokumentation der Stats-Coverage`)
})

// Neuer Test: Überschüssige Stats finden
Deno.test('Überschüssige Stats Analysis', async () => {
	console.log('\n🔍 Überschüssige Stats Analysis')
	console.log('='.repeat(60))

	const allPokemon = await getAllPokemonFromOrderFiles()

	// Sammle alle erwarteten Stats-Keys
	const expectedStatsKeys = new Set<string>()
	for (const pokemon of allPokemon) {
		const statsKey = generateStatsKey(pokemon.id_national, pokemon.pokemonid, pokemon.formid)
		expectedStatsKeys.add(statsKey)

		// Auch Base-Form hinzufügen falls nicht vorhanden
		const baseKey = generateStatsKey(pokemon.id_national, pokemon.pokemonid, null)
		expectedStatsKeys.add(baseKey)
	}

	// Alle verfügbaren Stats-Keys
	const availableStatsKeys = new Set(Object.keys(pkStats))

	// Finde überschüssige Stats
	const excessStats: string[] = []
	for (const statsKey of availableStatsKeys) {
		if (!expectedStatsKeys.has(statsKey)) {
			excessStats.push(statsKey)
		}
	}

	console.log(`📊 Verfügbare Stats: ${availableStatsKeys.size}`)
	console.log(`📊 Erwartete Stats: ${expectedStatsKeys.size}`)
	console.log(`📈 Überschüssige Stats: ${excessStats.length}`)

	if (excessStats.length > 0) {
		console.log(`\n✨ Überschüssige Stats (Top 15):`)
		excessStats.slice(0, 15).forEach((key, i) => {
			console.log(`  ${i + 1}. ${key}`)
		})

		if (excessStats.length > 15) {
			console.log(`  ... und ${excessStats.length - 15} weitere`)
		}

		console.log(`\n💡 Diese Stats existieren, haben aber keine entsprechenden JSON-Einträge`)
	} else {
		console.log(`🎉 Perfekte Synchronisation! Keine überschüssigen Stats gefunden.`)
	}
})

// Neuer Test: Pokemon Bilder Coverage
Deno.test('Pokemon Images Coverage Report', async () => {
	console.log('\n🔍 Pokemon Images Coverage Analysis')
	console.log('='.repeat(60))

	const allPokemon = await getAllPokemonFromOrderFiles()
	const images = await getAllPokemonImages()

	// Sammle alle erwarteten Image-Keys
	const expectedImageKeys = new Set<string>()
	for (const pokemon of allPokemon) {
		const imageKey = generateStatsKey(pokemon.id_national, pokemon.pokemonid, pokemon.formid)
		expectedImageKeys.add(imageKey)
	}

	console.log(`📊 Erwartete Pokemon: ${expectedImageKeys.size}`)
	console.log(`📊 Normale Bilder: ${images.normal.size}`)
	console.log(`📊 Form Bilder: ${images.forms.size}`)
	console.log(`📊 Shiny Normale: ${images.shinyNormal.size}`)
	console.log(`📊 Shiny Forms: ${images.shinyForms.size}`)

	// Analyse für normale Bilder
	const missingNormalImages: string[] = []
	const missingShinyNormalImages: string[] = []

	for (const imageKey of expectedImageKeys) {
		// Prüfe normale Bilder (normal + forms)
		const hasNormalImage = images.normal.has(imageKey) || images.forms.has(imageKey)
		if (!hasNormalImage) {
			missingNormalImages.push(imageKey)
		}

		// Prüfe shiny Bilder (shiny-normal + shiny-forms)
		const hasShinyImage = images.shinyNormal.has(imageKey) || images.shinyForms.has(imageKey)
		if (!hasShinyImage) {
			missingShinyNormalImages.push(imageKey)
		}
	}

	const normalCoverage = (
		((expectedImageKeys.size - missingNormalImages.length) / expectedImageKeys.size) *
		100
	).toFixed(1)
	const shinyCoverage = (
		((expectedImageKeys.size - missingShinyNormalImages.length) / expectedImageKeys.size) *
		100
	).toFixed(1)

	console.log(`📈 Normale Bilder Coverage: ${normalCoverage}%`)
	console.log(`✨ Shiny Bilder Coverage: ${shinyCoverage}%`)

	if (missingNormalImages.length > 0) {
		console.log(`\n❌ Fehlende normale Bilder (Top 10):`)
		missingNormalImages.slice(0, 10).forEach((key, i) => {
			console.log(`  ${i + 1}. ${key}`)
		})
		if (missingNormalImages.length > 10) {
			console.log(`  ... und ${missingNormalImages.length - 10} weitere`)
		}
	}

	if (missingShinyNormalImages.length > 0) {
		console.log(`\n✨ Fehlende shiny Bilder (Top 10):`)
		missingShinyNormalImages.slice(0, 10).forEach((key, i) => {
			console.log(`  ${i + 1}. ${key}`)
		})
		if (missingShinyNormalImages.length > 10) {
			console.log(`  ... und ${missingShinyNormalImages.length - 10} weitere`)
		}
	}

	console.log(`\n💡 Hinweis: Dieser Test zeigt die Verfügbarkeit von Pokemon-Bildern`)
})

// Überschüssige Bilder finden
Deno.test('Überschüssige Pokemon Bilder Analysis', async () => {
	console.log('\n🔍 Überschüssige Pokemon Bilder Analysis')
	console.log('='.repeat(60))

	const allPokemon = await getAllPokemonFromOrderFiles()
	const images = await getAllPokemonImages()

	// Sammle alle erwarteten Image-Keys
	const expectedImageKeys = new Set<string>()
	for (const pokemon of allPokemon) {
		const imageKey = generateStatsKey(pokemon.id_national, pokemon.pokemonid, pokemon.formid)
		expectedImageKeys.add(imageKey)
	}

	// Finde überschüssige Bilder
	const excessNormalImages = [...images.normal, ...images.forms].filter(
		(img) => !expectedImageKeys.has(img)
	)
	const excessShinyImages = [...images.shinyNormal, ...images.shinyForms].filter(
		(img) => !expectedImageKeys.has(img)
	)

	console.log(`📈 Überschüssige normale Bilder: ${excessNormalImages.length}`)
	console.log(`✨ Überschüssige shiny Bilder: ${excessShinyImages.length}`)

	if (excessNormalImages.length > 0) {
		console.log(`\n📈 Überschüssige normale Bilder (Top 10):`)
		excessNormalImages.slice(0, 10).forEach((key, i) => {
			console.log(`  ${i + 1}. ${key}`)
		})
		if (excessNormalImages.length > 10) {
			console.log(`  ... und ${excessNormalImages.length - 10} weitere`)
		}
	}

	if (excessShinyImages.length > 0) {
		console.log(`\n✨ Überschüssige shiny Bilder (Top 10):`)
		excessShinyImages.slice(0, 10).forEach((key, i) => {
			console.log(`  ${i + 1}. ${key}`)
		})
		if (excessShinyImages.length > 10) {
			console.log(`  ... und ${excessShinyImages.length - 10} weitere`)
		}
	}

	console.log(`\n💡 Diese Bilder existieren, haben aber keine entsprechenden JSON-Einträge`)
})

// Einfacher Basis-Test für wichtige Funktionalität
Deno.test('Grundlegende Funktionalität', () => {
	// pk-stats.ts ist importierbar
	assertExists(pkStats)
	assertEquals(typeof pkStats, 'object')

	const statsKeys = Object.keys(pkStats)
	console.log(`📊 Verfügbare Stats: ${statsKeys.length}`)

	// Bulbasaur als Basis-Test
	assertExists(pkStats['0001-bulbasaur'], 'Bulbasaur sollte verfügbar sein')

	const bulbasaurStats = pkStats['0001-bulbasaur']
	assertExists(bulbasaurStats.stats)
	assertExists(bulbasaurStats.types)
	assertExists(bulbasaurStats.abilities)
	assertEquals(bulbasaurStats.stats.length, 6)

	console.log('✅ Grundlegende Pokemon-Stats funktionieren korrekt')
})
