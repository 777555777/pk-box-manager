import { pokedexNullState, pokemonNullProperties, pokemonNullState } from '../null-state-helper.ts'
import { getIdentifier } from '../spriteheet-helper.ts'
import { appState } from './app-state.svelte.ts'
import { storageHandler } from './storage-handler.ts'
import { getAllPossibleTags, getDexConfig } from '../data/pokedex-config-utils.ts'
import {
	type BoxState,
	type DexState,
	type PokemonEditState,
	type DexConfig,
	type BoxOrderConfig,
	type DexSave,
	type PokemonEntry
} from '../models/data-models.ts'

// Zentrale Schnittstelle für alles, was mit DexSave im Storage passiert

export interface PkStateHandler {
	// Basis
	loadDex(dexSave: DexSave): void
	getDex(): DexSave
	getConfig(): DexConfig
	getState(): DexState

	// Pokemon-bezogene Aktionen
	getPokemon(entry: PokemonEntry): PokemonEditState | undefined
	updatePokemon(entry: PokemonEntry, changes: Partial<PokemonEditState>): void
	toggleMark(entry: PokemonEntry): void
	toggleRibbon(entry: PokemonEntry, shiny: boolean): void
	resetPokemon(entry: PokemonEntry): void

	// Ausgewähltes Pokemon
	getSelectedPokemon(): PokemonEditState | undefined
	updateSelectedPokemon(entry: PokemonEntry): void
	deselectPokemon(): void

	// Box-bezogene Aktionen
	updateBoxSettings(boxId: string, changes: Partial<BoxState>): void

	// Metadaten / State Management
	getProgress(): { captured: number; total: number; shiny: number }
	hasChanges(): boolean
	resetDex(): void
}

export class PkState {
	private pokedex: DexSave = $state(this.initPokedex())
	private pokedexState: DexState = $derived(this.pokedex.state)
	public pokedexIndexList = $state(storageHandler.loadPokedexIndex())
	private selectedPokemon: PokemonEditState = $state(pokemonNullState)

	private boxOrderCache: Record<string, BoxOrderConfig[]> = $state({}) // TODO: Remove
	private pokedexList = $state<DexSave[]>(storageHandler.loadEveryPokedex()) // TODO: Remove when pokedexIndexList is in use

	initPokedex(dexConfig: DexConfig | null = null) {
		if (dexConfig) {
			const dexSaveId = storageHandler.initPokedex(dexConfig)
			const dexSave = storageHandler.loadPokedex(dexSaveId)

			// Ensure PokedexIndexList is up to date
			this.pokedexIndexList = storageHandler.loadPokedexIndex()
			if (!dexSave) {
				throw new Error(`Failed to initialize Pokedex for "${dexConfig.name}".`)
			}
			return dexSave
		}

		// try to load the selected dex
		const initialSelected = storageHandler.loadSelectedPokedexId()
		const selectedDex = storageHandler.loadPokedex(initialSelected)

		let dexSave = selectedDex
		// Initialize if it doesn't exist
		if (!selectedDex) {
			// Create default dex (national dex) with all Tags
			const presetConfig = getDexConfig(initialSelected, getAllPossibleTags())
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
			this.pokedexList.push(this.pokedex)
		} catch (error) {
			console.error('Error switching Pokedex:', error)
			throw error
		}
	}

	/**
	 * Reset the current Pokedex to its initial state
	 */
	async resetPokedex(dexName: string, isSelected: boolean): Promise<void> {
		try {
			// SERVER !!!!!!!!!!!!!!!!
			// Get the box order from cache or server
			// const boxOrder = await this.loadBoxOrder(dexName)
			// if (!boxOrder) {
			// throw new Error('Box order not found')
			// }

			// Remove the current Pokedex data from localStorage
			storageHandler.removePokedex(dexName)

			// Re-initialize the Pokedex with fresh data
			// storageHandler.initPokedex(boxOrder, dexName)

			if (isSelected) {
				// Update the state
				const stateData = storageHandler.loadPokedex(dexName)
				this.pokedexState = stateData!

				// Reset selected Pokemon
				this.selectedPokemon = pokemonNullState

				// Make sure app state is aware of the reset
				appState.setCurrentPokedexName(dexName)
			}
			console.log(`Pokedex ${dexName} has been reset`)
		} catch (error) {
			console.error('Error resetting Pokedex:', error)
			throw new Error(`Error resetting Pokedex "${dexName}": ${error}`)
		}
	}

	// =========================================

	getPokedexIndexList() {
		return this.pokedexIndexList
	}

	getDexStorageFromConfig() {
		return this.pokedexState
	}

	// initPokedex(dexConfig: DexConfig) {
	// 	storageHandler.initPokedex(dexConfig)
	// }

	initBoxOrderState(dexConfig: DexConfig): void {
		// Read Pokedex data from localStorage
		let stateData = storageHandler.loadPokedex(dexConfig.name)
		console.log('-------stateData', stateData)

		// Initialize if it doesn't exist
		if (!stateData) {
			storageHandler.initPokedex(dexConfig)
			stateData = storageHandler.loadPokedex(dexConfig.name)
		}

		// Set as reactive state
		this.pokedexState = stateData!

		// Reset selected Pokemon
		this.selectedPokemon = pokemonNullState
	}

	addToBoxOrderCache(dexName: string, boxOrder: BoxOrderConfig[]) {
		this.boxOrderCache[dexName] = boxOrder
	}

	getCachedOrder(dexName: string): BoxOrderConfig[] {
		return this.boxOrderCache[dexName]
	}

	// ================
	// Pokedex
	// ================

	// switchPokedex(dexConfig: DexConfig): void {
	// 	try {
	// 		const dexId = `${dexConfig.type}-${dexConfig.id}-${dexConfig.tags.join('-')}`

	// 		// Save selected Pokedex name
	// 		storageHandler.saveSelectedPokedexId(dexId)

	// 		// Check if we already have complete data in localStorage (e.g., from import)
	// 		let existingPokedexData = storageHandler.loadPokedex(dexId)

	// 		if (!existingPokedexData) {
	// 			// If we don't have existing data, we need to init it
	// 			this.initPokedex(dexConfig)
	// 			existingPokedexData = storageHandler.loadPokedex(dexId)
	// 			console.log('++++++++++++++++++++++++existingPokedexData', existingPokedexData)
	// 		}

	// 		// We have complete data, just load it directly
	// 		this.pokedex = existingPokedexData!
	// 		this.selectedPokemon = pokemonNullState
	// 		this.pokedexList.push(this.pokedex)
	// 	} catch (error) {
	// 		console.error('Error switching Pokedex:', error)
	// 		throw error
	// 	}
	// }

	// /**
	//  * Reset the current Pokedex to its initial state
	//  */
	// async resetPokedex(dexName: string, isSelected: boolean): Promise<void> {
	// 	try {
	// 		// SERVER !!!!!!!!!!!!!!!!
	// 		// Get the box order from cache or server
	// 		// const boxOrder = await this.loadBoxOrder(dexName)
	// 		// if (!boxOrder) {
	// 		// throw new Error('Box order not found')
	// 		// }

	// 		// Remove the current Pokedex data from localStorage
	// 		storageHandler.removePokedex(dexName)

	// 		// Re-initialize the Pokedex with fresh data
	// 		// storageHandler.initPokedex(boxOrder, dexName)

	// 		if (isSelected) {
	// 			// Update the state
	// 			const stateData = storageHandler.loadPokedex(dexName)
	// 			this.pokedexState = stateData!

	// 			// Reset selected Pokemon
	// 			this.selectedPokemon = pokemonNullState

	// 			// Make sure app state is aware of the reset
	// 			appState.setCurrentPokedexName(dexName)
	// 		}
	// 		console.log(`Pokedex ${dexName} has been reset`)
	// 	} catch (error) {
	// 		console.error('Error resetting Pokedex:', error)
	// 		throw new Error(`Error resetting Pokedex "${dexName}": ${error}`)
	// 	}
	// }

	getCurrentPokedexState(): DexState {
		console.log('this.pokedexState', this.pokedexState)

		return this.pokedexState || pokedexNullState
	}

	/**
	 * Load all available Pokedexes from localStorage
	 */
	public loadAllPokedexes(): DexSave[] {
		// Get all dexes from localStorage
		const localDexes = storageHandler.loadEveryPokedex()

		if (localDexes.length > 0) {
			// Create a Set of existing dex names for quick lookup
			return storageHandler.loadEveryPokedex()
		}

		// No local dexes found, return an empty array
		console.warn('No local dexes found')
		return []
	}

	/**
	 * Get all available Pokedexes from the current state
	 */
	public getAllPokedexes(): DexSave[] {
		this.loadAllPokedexes()
		return this.pokedexList
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

		// Update the Pokedex index list state
		this.pokedexIndexList = this.getPokedexIndexList()
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

		// Update the Pokedex index list state
		this.pokedexIndexList = this.getPokedexIndexList()
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
