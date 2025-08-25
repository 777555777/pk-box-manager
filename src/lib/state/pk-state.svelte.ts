import {
	defaultWallpaper,
	pokedexNullState,
	pokemonNullProperties,
	pokemonNullState
} from '../null-state-helper.ts'
import { getIdentifier } from '../spriteheet-helper.ts'
import { appState } from './app-state.svelte.ts'
import { DEFAULT_SELECTED_DEX, type DexIndexEntry, storageHandler } from './storage-handler.ts'
import { getDexConfig } from '../data/pokedex-config-utils.ts'
import {
	type BoxState,
	type DexState,
	type PokemonEditState,
	type DexConfig,
	type DexSave,
	type BoxTags
} from '../models/data-models.ts'

// Zentrale Schnittstelle für alles, was mit DexSave im Storage passiert

export interface PkStateHandler {
	// Basis
	initPokedex(dexConfig: DexConfig | null): void
	loadPokedex(dexId: string): DexSave
	getPokedex(): DexSave
	// getConfig(): DexConfig
	// getState(): DexState
	switchPokedex(dexConfig: DexConfig): void
	resetPokedex(dexId: string): void

	// Pokedex Index
	getCurrentPokedexState(): DexState
	getPokedexIndexList(): DexIndexEntry[]

	// Pokemon-bezogene Aktionen
	getPokemon(identifier: string): PokemonEditState
	updatePokemon(identifier: string, updatedState: Partial<PokemonEditState>): void
	toggleMark(identifier: string, markId: string): void
	toggleRibbon(identifier: string, ribbonId: string): void
	// resetPokemon(identifier: string): void

	// Ausgewähltes Pokemon
	getSelectedPokemon(): PokemonEditState | undefined
	updateSelectedPokemon(identifier: string): void
	deselectPokemon(): void

	// Box-bezogene Aktionen
	updateBoxSettings(boxId: string, settings: Partial<BoxState['settings']>): void

	// Metadaten / State Management
	// getProgress(): { captured: number; total: number; shiny: number }
	// hasChanges(): boolean
}

export class PkState implements PkStateHandler {
	private pokedex: DexSave = $state(this.initPokedex())
	private pokedexState: DexState = $derived(this.pokedex.state)
	public pokedexIndexList: DexIndexEntry[] = $state(storageHandler.loadPokedexIndex())
	private selectedPokemon: PokemonEditState = $state(pokemonNullState)

	// ================
	// Pokedex
	// ================

	/**
	 * Parses a pokedex ID string and creates a DexConfig from it.
	 * Format: "type-id-tag1-tag2-..." (e.g., "preset-nationalDex-normal-shiny")
	 * @param dexId The dex ID string to parse
	 * @returns A DexConfig object
	 */
	private parseAndCreateDexConfig(dexId: string): DexConfig {
		const parts = dexId.split('-')

		if (parts.length < 2) {
			throw new Error(
				`Invalid dex ID format: "${dexId}". Expected format: "type-id" or "type-id-tag1-tag2..."`
			)
		}

		// Extract base preset ID (first two parts: "preset-nationalDex")
		const presetId = `${parts[0]}-${parts[1]}`

		// Extract tag parts (everything after the preset ID)
		const tagParts = parts.slice(2)

		// Build tags array - always include 'normal', then add any additional tags
		const tags: BoxTags[] = ['normal']

		if (tagParts.length > 0) {
			// Filter out 'normal' to avoid duplicates, then add the remaining tags
			const additionalTags = tagParts.filter((tag) => tag !== 'normal') as BoxTags[]
			tags.push(...additionalTags)
		}

		// Create and return the dex configuration
		return getDexConfig(presetId, tags)
	}

	initPokedex(dexConfig: DexConfig | null = null) {
		if (dexConfig) {
			const dexSaveId = storageHandler.initPokedex(dexConfig)
			const dexSave = storageHandler.loadPokedex(dexSaveId)

			// Ensure PokedexIndexList is up to date
			this.pokedexIndexList = storageHandler.loadPokedexIndex()
			if (!dexSave) {
				throw new Error(`Failed to initialize Pokedex for "${dexConfig.displayName}".`)
			}
			return dexSave
		}

		// try to load the selected dex
		const initialSelected = storageHandler.loadSelectedPokedexId()
		const selectedDex = storageHandler.loadPokedex(initialSelected)

		let dexSave = selectedDex
		// Initialize if it doesn't exist
		if (!selectedDex) {
			// Parse the selected dex ID and create a configuration for it
			const presetConfig = this.parseAndCreateDexConfig(initialSelected)
			const dexSaveId = storageHandler.initPokedex(presetConfig)
			dexSave = storageHandler.loadPokedex(dexSaveId)
		}

		if (!dexSave) {
			throw new Error(
				`Failed to load Pokedex for "${initialSelected}". Please check your configuration.`
			)
		}

		return dexSave
	}

	loadPokedex(dexId: string): DexSave {
		const dexSave = storageHandler.loadPokedex(dexId)
		if (!dexSave) {
			throw new Error(`Pokedex with ID "${dexId}" not found in storage.`)
		}
		return dexSave
	}

	getPokedex(): DexSave {
		return this.pokedex
	}

	switchPokedex(dexConfig: DexConfig): void {
		try {
			const dexId = `${dexConfig.type}-${dexConfig.id}-${dexConfig.tags.join('-')}`

			// Save selected Pokedex name
			storageHandler.saveSelectedPokedexId(dexId)

			// Check if we already have complete data in localStorage (e.g., from import)
			let existingPokedexData = storageHandler.loadPokedex(dexId)

			if (!existingPokedexData) {
				// If we don't have existing data, we need to init it
				this.initPokedex(dexConfig)
				existingPokedexData = storageHandler.loadPokedex(dexId)
			}

			// We have complete data, just load it directly
			this.pokedex = existingPokedexData!
			this.selectedPokemon = pokemonNullState
		} catch (error) {
			console.error('Error switching Pokedex:', error)
			throw error
		}
	}

	// ================
	// Reset Hilfsfunktionen
	// ================

	/**
	 * Setzt alle Pokemon in einem DexState auf ihre Standard-Werte zurück.
	 * Behält die Pokemon-Einträge bei, aber entfernt alle Anpassungen.
	 */
	private resetPokemonInDexState(dexState: DexState): void {
		for (const [identifier, pokemon] of Object.entries(dexState.pokemon)) {
			// Behalte die idEntry bei, setze aber alle anderen Werte zurück
			dexState.pokemon[identifier] = {
				idEntry: pokemon.idEntry,
				...pokemonNullProperties
			}
		}
	}

	/**
	 * Setzt den State-Teil eines DexSave auf Standard-Werte zurück.
	 * Behält die ursprüngliche Struktur bei, aber entfernt alle Benutzer-Anpassungen.
	 */
	private resetDexState(dexSave: DexSave): void {
		// Reset aller Pokemon auf Standard-Werte
		this.resetPokemonInDexState(dexSave.state)

		// Box-Wallpapers auf Standard zurücksetzen (optional)
		for (const element of dexSave.state.boxes) {
			element.settings.wallpaper = defaultWallpaper // Standard-Wallpaper
		}
	}

	resetPokedex(dexId: string): void {
		try {
			// Lade den aktuellen Pokedex aus dem Storage
			const dexSave = storageHandler.loadPokedex(dexId)
			if (!dexSave) {
				throw new Error(`Pokedex with ID "${dexId}" not found in storage.`)
			}

			// Verwende die Hilfsfunktionen, um den State zurückzusetzen
			this.resetDexState(dexSave)

			// Speichere den zurückgesetzten Pokedex zurück in den Storage
			storageHandler.savePokedex(dexSave)

			// Wenn dieser Pokedex gerade ausgewählt ist, aktualisiere den aktuellen State
			const isCurrentlySelected = this.pokedex.id === dexId
			if (isCurrentlySelected) {
				this.pokedex = dexSave
				// Reset selected Pokemon da sich der State geändert hat
				this.selectedPokemon = pokemonNullState
			}

			// Aktualisiere die Pokedex-Index-Liste (für Counter-Updates)
			this.pokedexIndexList = storageHandler.loadPokedexIndex()

			console.log(`Pokedex ${dexId} has been reset to initial state`)
		} catch (error) {
			console.error('Error resetting Pokedex:', error)
			throw new Error(`Error resetting Pokedex "${dexId}": ${error}`)
		}
	}

	deletePokedex(dexId: string): void {
		try {
			// Check if we're deleting the currently selected pokedex
			const isCurrentlySelected = this.pokedex.id === dexId

			// Remove from storage
			storageHandler.removePokedex(dexId)

			if (isCurrentlySelected) {
				// Select default dex so something is always selected
				storageHandler.saveSelectedPokedexId(DEFAULT_SELECTED_DEX)

				// Load the default pokedex and update current state
				const defaultDexSave = storageHandler.loadPokedex(DEFAULT_SELECTED_DEX)
				if (defaultDexSave) {
					this.pokedex = defaultDexSave
				} else {
					// If default doesn't exist, initialize it by parsing the default dex ID
					this.pokedex = this.initPokedex(this.parseAndCreateDexConfig(DEFAULT_SELECTED_DEX))
				}

				// Reset selected pokemon since we switched pokedex
				this.selectedPokemon = pokemonNullState

				// Update app state to reflect the change
				appState.setSelectedPokedexId(DEFAULT_SELECTED_DEX)
			}

			// Ensure PokedexIndexList is up to date
			this.pokedexIndexList = storageHandler.loadPokedexIndex()
		} catch (error) {
			console.error('Error deleting Pokedex:', error)
			throw new Error(`Error deleting Pokedex "${dexId}": ${error}`)
		}
	}

	getCurrentPokedexState(): DexState {
		return this.pokedexState || pokedexNullState
	}

	getPokedexIndexList(): DexIndexEntry[] {
		return this.pokedexIndexList
	}
	// ================
	// Box Settings
	// ================

	updateBoxSettings(boxId: string, settings: Partial<BoxState['settings']>): void {
		const boxIndex = this.pokedexState.boxes.findIndex((box) => box.id === boxId)

		if (boxIndex === -1) {
			throw new Error(`Cannot update box settings. Box with ID "${boxId}" does not exist.`)
		}

		// Update the box settings
		this.pokedexState.boxes[boxIndex].settings = {
			...this.pokedexState.boxes[boxIndex].settings,
			...settings
		}

		// Persist changes to localStorage
		storageHandler.updateBoxSettings(boxId, this.pokedexState.boxes[boxIndex].settings)
	}

	// ================
	// Pokemon
	// ================

	getPokemon(identifier: string): PokemonEditState {
		return this.pokedexState?.pokemon[identifier] || pokemonNullState
	}

	updatePokemon(identifier: string, updatedState: Partial<PokemonEditState>): void {
		if (!this.pokedexState.pokemon[identifier]) {
			throw new Error(
				`Cannot update Pokemon. The Pokemon with ID "${identifier}" does not exist in the current Pokedex.`
			)
		}
		const currentState = this.pokedexState.pokemon[identifier]

		// Update captured if another property is somehow edited before it
		const hasUpdates = Object.keys(updatedState).length > 0
		const isUpdatingCaptureState = 'captured' in updatedState || 'isCustomized' in updatedState

		if (hasUpdates && !isUpdatingCaptureState) {
			updatedState.captured = true
		}

		if (!currentState.isCustomized) {
			const defaults = appState.getAppDefaults()
			updatedState = { ...defaults, ...updatedState }
			updatedState.isCustomized = true
		}

		const newState = { ...currentState, ...updatedState }
		this.pokedexState.pokemon[identifier] = newState

		// Update the selected Pokemon to reflect the updated state in the UI
		if (getIdentifier(this.selectedPokemon.idEntry) === identifier) {
			this.selectedPokemon = { ...this.pokedexState.pokemon[identifier] }
		}

		// Persist in localstorage
		storageHandler.editPokemonStateEntry(identifier, this.pokedexState.pokemon[identifier])

		// Update the Pokedex index list state - reload from storage to get updated counters
		this.pokedexIndexList = storageHandler.loadPokedexIndex()
	}

	toggleMark(identifier: string, markId: string): void {
		const currentPokemon = this.getPokemon(identifier)
		const markSet = new Set(currentPokemon.marks)

		if (markSet.has(markId)) {
			markSet.delete(markId)
		} else {
			markSet.add(markId)
		}

		this.updatePokemon(identifier, {
			marks: Array.from(markSet)
		})
	}

	toggleRibbon(identifier: string, ribbonId: string): void {
		const currentPokemon = this.getPokemon(identifier)
		const ribbonSet = new Set(currentPokemon.ribbons)

		if (ribbonSet.has(ribbonId)) {
			ribbonSet.delete(ribbonId)
		} else {
			ribbonSet.add(ribbonId)
		}

		this.updatePokemon(identifier, {
			ribbons: Array.from(ribbonSet)
		})
	}

	resetPokemon(identifier: string): void {
		if (!this.pokedexState.pokemon[identifier]) {
			throw new Error(
				`Cannot reset Pokemon. The Pokemon with ID "${identifier}" does not exist in the current Pokedex.`
			)
		}

		// Override the given pokemon with nullState data
		const currentState = this.pokedexState.pokemon[identifier]
		const newState = { ...currentState, ...pokemonNullProperties }
		this.pokedexState.pokemon[identifier] = newState

		// Persist in localstorage
		storageHandler.editPokemonStateEntry(identifier, this.pokedexState.pokemon[identifier])

		// Update the Pokedex index list state - reload from storage to get updated counters
		this.pokedexIndexList = storageHandler.loadPokedexIndex()
	}

	// ================
	// Selected Pokemon
	// ================

	updateSelectedPokemon(identifier: string): void {
		if (!this.pokedexState.pokemon[identifier]) {
			throw new Error(
				`Cannot select Pokemon. The Pokemon with ID "${identifier}" does not exist in the current Pokedex.`
			)
		}
		this.selectedPokemon = this.pokedexState.pokemon[identifier]
	}

	getSelectedPokemon(): PokemonEditState {
		return this.selectedPokemon ? this.selectedPokemon : pokemonNullState
	}

	deselectPokemon(): void {
		this.selectedPokemon = pokemonNullState
	}
}

export const pkState = new PkState()
