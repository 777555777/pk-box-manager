import { pokedexNullState, pokemonNullProperties, pokemonNullState } from '../null-state-helper.ts'
import { getIdentifier } from '../spriteheet-helper.ts'
import { appState } from './app-state.svelte.ts'
import {
	storageHandler,
	type BoxOrder,
	type DexStorage,
	type PokemonData,
	type PokemonState
} from './storage-handler.ts'

export async function fetchBoxOrder(dexName: string): Promise<BoxOrder[]> {
	console.log('Fetching Box order from the server', dexName)
	const response = await fetch(`/pkorder?dexname=${encodeURIComponent(dexName)}`)
	if (!response.ok) {
		throw new Error('Pokedex nicht gefunden')
	}
	return await response.json()
}

export class PkState {
	private boxOrderCache: Record<string, BoxOrder[]> = $state({})
	private pokedexState: DexStorage = $state(pokedexNullState)
	private selectedPokemon: PokemonState = $state(pokemonNullState)

	async loadBoxOrder(dexName: string): Promise<BoxOrder[]> {
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

	initBoxOrderState(boxOrder: BoxOrder[], dexName: string): void {
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

	addToBoxOrderCache(dexName: string, boxOrder: BoxOrder[]) {
		this.boxOrderCache[dexName] = boxOrder
	}

	getCachedOrder(dexName: string): BoxOrder[] {
		return this.boxOrderCache[dexName]
	}

	// ================
	// Pokedex
	// ================

	async switchPokedex(dexName: string): Promise<void> {
		try {
			// Save selected Pokedex name
			storageHandler.saveSelectedPokedexName(dexName)
			const boxOrder = await this.loadBoxOrder(dexName)
			// Init the edit state for the target boxOrder
			this.initBoxOrderState(boxOrder, dexName)
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

	// ================
	// Pokemon
	// ================

	getPokemon(identifier: string): PokemonState {
		if (this.pokedexState.pokemon[identifier]) {
			return this.pokedexState.pokemon[identifier]
		}
		return pokemonNullState
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
}

export const pkState = new PkState()
