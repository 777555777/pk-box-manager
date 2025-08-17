import { pokedexNullState, pokemonNullProperties, pokemonNullState } from '../null-state-helper.ts'
import { getIdentifier } from '../spriteheet-helper.ts'
import { appState } from './app-state.svelte.ts'
import { storageHandler } from './storage-handler.ts'
import { dexPresets } from '../data/pokedex.ts'
import { getDexConfig } from '../data/pokedex-config-utils.ts'
import {
	type BoxState,
	type DexState,
	type PokemonEditState,
	type DexConfig,
	type BoxOrderConfig
} from '../models/data-models.ts'

export class PkState {
	private boxOrderCache: Record<string, BoxOrderConfig[]> = $state({})
	private pokedexState: DexState = $state(this.onPageLoadInitDex())
	private selectedPokemon: PokemonEditState = $state(pokemonNullState)
	private pokedexList = $state<DexState[]>([])

	onPageLoadInitDex() {
		const initialSelected = storageHandler.loadSelectedPokedexName()
		const initialDexConfig = getDexConfig(initialSelected)

		let stateData = storageHandler.loadPokedex(initialDexConfig.name)

		// Initialize if it doesn't exist
		if (!stateData) {
			storageHandler.initPokedex(initialDexConfig)
			stateData = storageHandler.loadPokedex(initialDexConfig.name)
		}

		return stateData!
	}

	getDexStorageFromConfig() {
		return this.pokedexState
	}

	initBoxOrderState(dexConfig: DexConfig): void {
		// Read Pokedex data from localStorage
		let stateData = storageHandler.loadPokedex(dexConfig.name)

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

	async switchPokedex(dexName: string, forceServerFetch = false): Promise<void> {
		try {
			// Save selected Pokedex name
			storageHandler.saveSelectedPokedexName(dexName)

			// Check if we already have complete data in localStorage (e.g., from import)
			const existingData = storageHandler.loadPokedex(dexName)

			if (existingData && !forceServerFetch) {
				// We have complete data, just load it directly
				this.pokedexState = existingData
				this.selectedPokemon = pokemonNullState

				// Still cache the box order for potential future use
				if (!this.boxOrderCache[dexName]) {
					// Extract box order from existing data for cache
					const boxOrder = this.extractBoxOrderFromDexData(existingData)
					this.boxOrderCache[dexName] = boxOrder
				}
			} else {
				// SERVER !!!!!!!!!!!!!!!!
				// No complete data or forced refresh - fetch from server
				// const boxOrder = await this.loadBoxOrder(dexName)
				// this.initBoxOrderState(boxOrder, dexName)
			}
		} catch (error) {
			console.error('Error switching Pokedex:', error)
			throw error
		}
	}

	switchPokedexNew(dexConfig: DexConfig): void {
		try {
			// Save selected Pokedex name
			storageHandler.saveSelectedPokedexName(dexConfig.name)

			// Check if we already have complete data in localStorage (e.g., from import)
			const existingData = storageHandler.loadPokedex(dexConfig.name)
			console.log('????????existingData', existingData)

			if (existingData) {
				console.log('!!!!!!!existingData', existingData)
				// We have complete data, just load it directly
				this.pokedexState = existingData
				this.selectedPokemon = pokemonNullState
			}

			// If we don't have existing data, we need to fetch it
			this.initBoxOrderState(dexConfig)
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

	getCurrentPokedexState(): DexState {
		return this.pokedexState || pokedexNullState
	}

	/**
	 * Load all available Pokedexes from localStorage and server-supported dexes
	 * This includes both local dexes with real editing state and server-supported dexes without real editing state
	 */
	public loadAllPokedexes(): DexState[] {
		// Get all dexes from localStorage
		const localDexes = storageHandler.loadEveryPokedex()

		// Create a Set of existing dex names for quick lookup
		const existingDexNames = new Set(localDexes.map((dex) => dex.name))

		// Add server-supported dexes that aren't in localStorage yet
		const allDexes: DexState[] = [...localDexes]

		for (const [dexName, dexConfig] of Object.entries(dexPresets)) {
			// Only add if not already in localStorage
			if (!existingDexNames.has(dexName)) {
				// Create a placeholder DexStorage for unloaded dexes
				const placeholderDex: DexState = {
					version: '1.0.0', // Default version
					name: dexName,
					displayName: dexConfig.displayName,
					coverImage: dexConfig.coverImage,
					sortOrder: dexConfig.sortOrder,
					boxes: [],
					pokemon: {}
				}
				allDexes.push(placeholderDex)
			}
		}

		// Sort by sortOrder for deterministic display
		allDexes.sort((a, b) => a.sortOrder - b.sortOrder)

		// Pokedex list now includes local dexes that have real editing state and
		// server-supported dexes that are not yet loaded and dont have any real editing state
		this.pokedexList = allDexes
		console.log('allDexes', allDexes)
		return this.pokedexList
	}

	/**
	 * Get all available Pokedexes from the current state
	 */
	public getAllPokedexes(): DexState[] {
		return this.pokedexList
	}

	// ================
	// Box Settings
	// ================

	/**
	 * Get box data by box ID
	 */
	getBox(boxId: string): BoxState | undefined {
		return this.pokedexState.boxes.find((box) => box.id === boxId)
	}

	/**
	 * Update box settings (e.g., wallpaper)
	 */
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

	/**
	 * Update box wallpaper specifically
	 */
	updateBoxWallpaper(boxId: string, wallpaper: string): void {
		this.updateBoxSettings(boxId, { wallpaper })
	}

	// ================
	// Pokemon
	// ================

	getPokemon(identifier: string): PokemonEditState {
		return this.pokedexState.pokemon[identifier] || pokemonNullState
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

	// ================
	// Helper Methods
	// ================

	/**
	 * Extract box order structure from existing DexStorage data
	 * This is useful when we have complete data (e.g., from import) but need the box order format
	 */
	private extractBoxOrderFromDexData(dexData: DexState): BoxOrderConfig[] {
		return dexData.boxes.map((box) => ({
			title: box.title,
			pokemon: box.pokemon.map((pokemonKey) => {
				const pokemon = dexData.pokemon[pokemonKey]
				return pokemon.idEntry
			}),
			wallpaper: box.settings.wallpaper
		}))
	}

	/**
	 * Force refresh from server - useful for future server-side updates
	 * This method can be called when you want to ensure the latest server data is used
	 */
	async refreshFromServer(dexName?: string): Promise<void> {
		const targetDex = dexName || storageHandler.loadSelectedPokedexName()

		// Clear cache to force server fetch
		if (this.boxOrderCache[targetDex]) {
			delete this.boxOrderCache[targetDex]
		}

		// Force server fetch
		await this.switchPokedex(targetDex, true)
	}
}

export const pkState = new PkState()
