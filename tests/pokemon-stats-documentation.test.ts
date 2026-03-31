import { test, expect } from 'vitest'
import { getAllPokemonImages, getExpectedPokemonIds, typedPkStats } from './pokemon-test-utils.ts'

// Nicht-fehlschlagender Informationstest
test('Pokemon Stats Coverage Report', async () => {
	console.log('🔍 Pokemon Stats Coverage Analysis')
	console.log('='.repeat(60))

	const expectedPokemonIds = getExpectedPokemonIds()
	console.log(`📊 Gesamt referenzierte Pokemon in pokedex-boxes.json: ${expectedPokemonIds.length}`)

	const missingStats: string[] = []
	const foundStats: string[] = []

	for (const pokemonId of expectedPokemonIds) {
		if (pokemonId in typedPkStats) {
			foundStats.push(pokemonId)
		} else {
			missingStats.push(pokemonId)
		}
	}

	const coveragePercent = ((foundStats.length / expectedPokemonIds.length) * 100).toFixed(1)

	console.log(`✅ Eindeutige Pokemon analysiert: ${expectedPokemonIds.length}`)
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
test('Überschüssige Stats Analysis', async () => {
	console.log('\n🔍 Überschüssige Stats Analysis')
	console.log('='.repeat(60))

	const expectedStatsKeys = new Set(getExpectedPokemonIds())

	// Alle verfügbaren Stats-Keys
	const availableStatsKeys = new Set(Object.keys(typedPkStats))

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
test('Pokemon Images Coverage Report', async () => {
	console.log('\n🔍 Pokemon Images Coverage Analysis')
	console.log('='.repeat(60))

	const expectedPokemonIds = getExpectedPokemonIds()
	const images = await getAllPokemonImages()

	const expectedImageKeys = new Set(expectedPokemonIds)

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
test('Überschüssige Pokemon Bilder Analysis', async () => {
	console.log('\n🔍 Überschüssige Pokemon Bilder Analysis')
	console.log('='.repeat(60))

	const images = await getAllPokemonImages()
	const expectedImageKeys = new Set(getExpectedPokemonIds())

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

	console.log(
		`\n💡 Diese Bilder existieren, haben aber keine entsprechenden Einträge in pokedex-boxes.json`
	)
})

test('Dokumentationssuite kann pk-stats importieren', () => {
	expect(typedPkStats['0001-bulbasaur']).toBeDefined()
})
