import { pokedexNullState, pokemonNullProperties, pokemonNullState } from '../null-state-helper.ts'
import { getIdentifier } from '../spriteheet-helper.ts'
import { appState } from './app-state.svelte.ts'
import {
	getBoxOrder,
	storageHandler,
	type DexStorage,
	type PokemonData,
	type PokemonState
} from './storage-handler.ts'

export class PkState {
	private pokedexState: DexStorage = $state(pokedexNullState)
	private selectedPokemon: PokemonState = $state(pokemonNullState)

	constructor() {
		const selectedPokedex = storageHandler.loadSelectedPokedexName()
		this.switchPokedex(selectedPokedex)
	}

	// ================
	// Pokedex
	// ================

	switchPokedex(dexName: string): void {
		// Persist selected Pokedex in localstorage
		storageHandler.saveSelectedPokedexName(dexName)

		// Read Pokedex data from localstorage
		let stateData = storageHandler.loadPokedex(dexName)

		// Init the Pokedex if it does not exist yet and read its data
		if (!stateData) {
			storageHandler.initPokedex(getBoxOrder(dexName), dexName)
			stateData = storageHandler.loadPokedex(dexName)
		}

		// Set the Pokedex from localstorage as reactive state
		this.pokedexState = stateData!

		// Reset selected Pokemon when changing Pokedex
		this.selectedPokemon = pokemonNullState
	}

	getCurrentPokedex(): DexStorage {
		return this.pokedexState
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

		if (!currentState.isCustomized) {
			// The first update is always to the captured property
			// The defaults also dont provide a captured property so this
			// will not interfer here by overriding something
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
