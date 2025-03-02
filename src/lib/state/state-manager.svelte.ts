import { storageHandler } from './storage-handler.ts'

export interface PokemonData {
	captured: boolean
	ball: string
	shiny: boolean
	caughtIn: string
	ability: string
	comment: string
}

export class PokemonStateManager {
	private dexState = $state({})
	private selectedPokemon: string = $state('0000-null')
	// { pokemonid: 'null', formid: null, id_national: 0 }
	// 0000-null
	private nullState = {
		captured: false,
		ball: '01-Pokeball',
		shiny: false,
		caughtIn: '',
		ability: '',
		comment: ''
	}

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
		this.selectedPokemon = '0000-null'
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

		// Persist to storage
		storageHandler.editPokemonStateEntry(identifier, this.dexState[identifier])
	}

	toggleCaptured(identifier: string) {
		const pokemon = this.dexState[identifier]
		if (pokemon) {
			this.updatePokemonState(identifier, {
				captured: !pokemon.captured
			})
		}
	}

	setSelectedPokemon(identifier: string) {
		this.selectedPokemon = identifier
	}

	getSelectedPokemon() {
		return this.selectedPokemon ? this.dexState[this.selectedPokemon] : null
	}
}

export const pokemonStateManager = new PokemonStateManager()
