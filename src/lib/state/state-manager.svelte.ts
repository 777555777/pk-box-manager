import { getIdentifier } from '../spriteheet-helper.ts'
import { storageHandler, type PokemonData, type PokemonState } from './storage-handler.ts'

export class PokemonStateManager {
	private nullState = {
		idEntry: { pokemonid: 'null', formid: null, id_national: 0 },
		captured: false,
		ball: '01-Pokeball',
		shiny: false,
		caughtIn: '',
		ability: '',
		comment: ''
	}

	private nullDexState = { '0000': this.nullState }
	private dexState: Record<string, PokemonState> = $state(this.nullDexState)
	private selectedPokemon: PokemonState = $state(this.nullState)

	constructor() {
		this.loadDexState(storageHandler.getSelectedDexName())
	}

	loadDexState(dexName: string) {
		// Ensure the dex data is initialized in storage
		storageHandler.switchDex(dexName)

		// Get fresh state data from storage
		const stateData = storageHandler.getDexState(dexName)

		// Create a deep copy to avoid reactivity issues and ensure a complete refresh
		this.dexState = JSON.parse(JSON.stringify(stateData))

		// Reset selected Pokemon when changing dex
		this.selectedPokemon = this.nullState
	}

	getDexState() {
		return this.dexState
	}

	getPokemonState(identifier: string) {
		if (this.dexState[identifier]) {
			return this.dexState[identifier]
		}
		return this.nullState
	}

	updatePokemonState(identifier: string, updatedState: Partial<PokemonData>) {
		if (!this.dexState[identifier]) return

		// Update local state
		this.dexState[identifier] = {
			...this.dexState[identifier],
			...updatedState
		}

		// If this is the currently selected Pokemon, update selectedPokemon directly too
		if (getIdentifier(this.selectedPokemon.idEntry) === identifier) {
			this.selectedPokemon = { ...this.dexState[identifier] }
		}

		// Persist to storage
		storageHandler.editPokemonStateEntry(identifier, this.dexState[identifier])
	}

	toggleCaptured(identifier: string) {
		try {
			const pokemon = this.dexState[identifier]
			if (pokemon) {
				this.updatePokemonState(identifier, {
					captured: !pokemon.captured
				})
			}
		} catch (error) {
			console.error('Failed to toggle captured status', error)
		}
	}

	// In state-manager.svelte.ts
	toggleShiny(identifier: string) {
		try {
			const pokemon = this.dexState[identifier]
			if (pokemon) {
				this.updatePokemonState(identifier, {
					shiny: !pokemon.shiny
				})
			}
		} catch (error) {
			console.error('Failed to toggle shiny status', error)
		}
	}

	setSelectedPokemon(identifier: string) {
		this.selectedPokemon = this.dexState[identifier]
	}

	getSelectedPokemon() {
		return this.selectedPokemon ? this.selectedPokemon : this.nullState
	}
}

export const pokemonStateManager = new PokemonStateManager()
