import { test, expect } from 'vitest'
import { getBasePokemonIds, getExpectedPokemonIds, typedPkStats } from './pokemon-test-utils.ts'

test('Alle Pokemon aus pokedex-boxes haben entsprechende Stats in pk-stats.json', () => {
	console.log('🔍 Prüfe referenzierte Pokemon aus pokedex-boxes.json...')

	const expectedPokemonIds = getExpectedPokemonIds()

	console.log(`📊 Gefunden: ${expectedPokemonIds.length} referenzierte Pokemon-IDs`)

	const missingStats: string[] = []

	for (const pokemonId of expectedPokemonIds) {
		if (!(pokemonId in typedPkStats)) {
			missingStats.push(pokemonId)
		}
	}

	console.log(`✅ Eindeutige Pokemon geprüft: ${expectedPokemonIds.length}`)

	if (missingStats.length > 0) {
		console.error(`❌ Fehlende Stats für ${missingStats.length} Pokemon:`)
		missingStats.forEach((key) => console.error(`  - ${key}`))

		// Zeige auch ein paar Beispiele von verfügbaren Keys zum Vergleich
		const availableKeys = Object.keys(typedPkStats).slice(0, 5)
		console.log(`\n📝 Beispiele verfügbarer Stats-Keys: ${availableKeys.join(', ')}`)

		// Zeige related Keys für besseres Debugging
		console.log(`\n🔍 Suche nach ähnlichen Keys für die ersten fehlenden Pokemon:`)
		missingStats.slice(0, 3).forEach((missingKey) => {
			const relatedKeys = Object.keys(typedPkStats)
				.filter(
					(key) => key.includes(missingKey.split('-')[1]) // Suche nach Pokemon-Namen
				)
				.slice(0, 3)
			console.log(`  ${missingKey} -> ähnliche Keys: ${relatedKeys.join(', ')}`)
		})
	} else {
		console.log('🎉 Alle Pokemon haben entsprechende Stats!')
	}

	expect(missingStats.length).toBe(0)
})

test('Alle Basis-Pokemon in pokedex-boxes haben Stats', () => {
	const basePokemonIds = getBasePokemonIds()
	const missingBaseStats = basePokemonIds.filter((pokemonId) => !(pokemonId in typedPkStats))

	if (missingBaseStats.length > 0) {
		console.error(`❌ Kritische fehlende Basis-Pokemon Stats: ${missingBaseStats.join(', ')}`)
	}

	expect(missingBaseStats.length).toBe(0)
})

test('pk-stats.json ist korrekt importierbar', () => {
	expect(typedPkStats).toBeDefined()

	// Prüfe, dass pkStats ein Objekt ist und mindestens einen Eintrag hat
	expect(typeof typedPkStats).toBe('object')

	const statsKeys = Object.keys(typedPkStats)
	console.log(`📊 Anzahl verfügbarer Stats: ${statsKeys.length}`)

	// Mindestens Bulbasaur sollte da sein
	expect(typedPkStats['0001-bulbasaur']).toBeDefined()
})

test('Beispiel-Validierung der Stats-Struktur', () => {
	const bulbasaurStats = typedPkStats['0001-bulbasaur']

	expect(bulbasaurStats).toBeDefined()
	expect(bulbasaurStats.stats).toBeDefined()
	expect(bulbasaurStats.types).toBeDefined()
	expect(bulbasaurStats.abilities).toBeDefined()
	expect(bulbasaurStats.genderRatio).toBeDefined()

	// Stats sollten ein Array mit 6 Zahlen sein (HP, Atk, Def, SpA, SpD, Spe)
	expect(bulbasaurStats.stats.length).toBe(6)

	console.log('✅ Stats-Struktur Validierung erfolgreich')
})
