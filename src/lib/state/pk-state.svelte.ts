import { pokedexNullState, pokemonNullProperties, pokemonNullState } from '../null-state-helper.ts'
import { getIdentifier } from '../spriteheet-helper.ts'
import { appState } from './app-state.svelte.ts'
import {
	storageHandler,
	type DexStorage,
	type PokemonData,
	type PokemonState,
	type BoxData
} from './storage-handler.ts'
import { type ServerBoxOrder } from '../../routes/pkorder/+server.ts'

export async function fetchBoxOrder(dexName: string): Promise<ServerBoxOrder[]> {
	console.log('Fetching Box order from the server', dexName)
	const response = await fetch(`/pkorder?dexname=${encodeURIComponent(dexName)}`)
	if (!response.ok) {
		throw new Error('Pokedex nicht gefunden')
	}
	return await response.json()
}

export class PkState {
	private boxOrderCache: Record<string, ServerBoxOrder[]> = $state({})
	private pokedexState: DexStorage = $state(pokedexNullState)
	private selectedPokemon: PokemonState = $state(pokemonNullState)

	async loadBoxOrder(dexName: string): Promise<ServerBoxOrder[]> {
		// Check if the BoxOrder is cached
		if (this.boxOrderCache[dexName]) {
			return this.boxOrderCache[dexName]
		}

		// It is not in the cache, request it from the server
		try {
			const order = await fetchBoxOrder(dexName)
			// Add it to the cache
			this.boxOrderCache[dexName] = order
			return order
		} catch (error) {
			throw new Error('Fehler beim Laden der BoxOrder:', error as ErrorOptions)
		}
	}

	initBoxOrderState(boxOrder: ServerBoxOrder[], dexName: string): void {
		// Read Pokedex data from localStorage
		let stateData = storageHandler.loadPokedex(dexName)

		// Initialize if it doesn't exist
		if (!stateData) {
			storageHandler.initPokedex(boxOrder, dexName)
			stateData = storageHandler.loadPokedex(dexName)
		}

		// Set as reactive state
		this.pokedexState = stateData!

		// Reset selected Pokemon
		this.selectedPokemon = pokemonNullState
	}

	addToBoxOrderCache(dexName: string, boxOrder: ServerBoxOrder[]) {
		this.boxOrderCache[dexName] = boxOrder
	}

	getCachedOrder(dexName: string): ServerBoxOrder[] {
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
				// No complete data or forced refresh - fetch from server
				const boxOrder = await this.loadBoxOrder(dexName)
				this.initBoxOrderState(boxOrder, dexName)
			}
		} catch (error) {
			console.error('Error switching Pokedex:', error)
			throw error
		}
	}

	/**
	 * Reset the current Pokedex to its initial state
	 */
	async resetCurrentPokedex(): Promise<void> {
		const dexName = storageHandler.loadSelectedPokedexName()
		try {
			// Get the box order from cache or server
			const boxOrder = await this.loadBoxOrder(dexName)
			if (!boxOrder) {
				throw new Error('Box order not found')
			}

			// Remove the current Pokedex data from localStorage
			storageHandler.removePokedex(dexName)

			// Re-initialize the Pokedex with fresh data
			storageHandler.initPokedex(boxOrder, dexName)

			// Update the state
			const stateData = storageHandler.loadPokedex(dexName)
			this.pokedexState = stateData!

			// Reset selected Pokemon
			this.selectedPokemon = pokemonNullState

			// Make sure app state is aware of the reset
			appState.setCurrentPokedexName(dexName)

			console.log(`Pokedex ${dexName} has been reset`)
		} catch (error) {
			console.error('Error resetting Pokedex:', error)
			throw new Error(`Error resetting Pokedex "${dexName}": ${error}`)
		}
	}

	getCurrentPokedexState(): DexStorage {
		return this.pokedexState || pokedexNullState
	}

	// ================
	// Box Settings
	// ================

	/**
	 * Get box data by box ID
	 */
	getBox(boxId: string): BoxData | undefined {
		return this.pokedexState.boxes.find((box) => box.id === boxId)
	}

	/**
	 * Update box settings (e.g., wallpaper)
	 */
	updateBoxSettings(boxId: string, settings: Partial<BoxData['settings']>): void {
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

	getPokemon(identifier: string): PokemonState {
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

	updatePokemon(identifier: string, updatedState: Partial<PokemonData>): void {
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

	getSelectedPokemon(): PokemonState {
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
	private extractBoxOrderFromDexData(dexData: DexStorage): ServerBoxOrder[] {
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
