import { getIdentifier } from '../spriteheet-helper.ts'
import {
	storageHandler,
	type DexStorage,
	type PokemonData,
	type PokemonState
} from './storage-handler.ts'

export class PkState {
	private nullState = {
		idEntry: { pokemonid: 'null', formid: null, id_national: 0 },
		captured: false,
		ball: '01-poke-ball',
		shiny: false,
		caughtIn: '',
		ability: '',
		comment: '',
		isCustomized: false
	}
	private nullStatePokemon = { '0000-null': this.nullState }
	private nullStateMetaData = {
		version: '0.0.0',
		name: 'null',
		displayName: 'Null Dex',
		pokemon: this.nullStatePokemon
	}

	private dexState: DexStorage = $state(this.nullStateMetaData)
	private selectedPokemon: PokemonState = $state(this.nullState)

	constructor() {
		const selectedDex = storageHandler.getSelectedDexName()
		this.loadDexState(selectedDex)
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
		if (this.dexState.pokemon[identifier]) {
			return this.dexState.pokemon[identifier]
		}
		return this.nullState
	}

	updatePokemonState(identifier: string, updatedState: Partial<PokemonData>) {
		if (!this.dexState.pokemon[identifier]) return

		// Lokalen Status aktualisieren
		const currentState = this.dexState.pokemon[identifier]

		if (!currentState.isCustomized) {
			updatedState.isCustomized = true
		}

		const newState = { ...currentState, ...updatedState }
		this.dexState.pokemon[identifier] = newState

		// Falls dies das aktuell ausgewählte Pokemon ist, direkt auch selectedPokemon aktualisieren
		if (getIdentifier(this.selectedPokemon.idEntry) === identifier) {
			this.selectedPokemon = { ...this.dexState.pokemon[identifier] }
		}

		// In Storage persistieren
		storageHandler.editPokemonStateEntry(identifier, this.dexState.pokemon[identifier])
	}

	resetPokemonState(identifier: string) {
		if (!this.dexState.pokemon[identifier]) return

		const resetState = {
			captured: false,
			ball: '01-poke-ball',
			shiny: false,
			caughtIn: '',
			ability: '',
			comment: '',
			isCustomized: false
		}

		const currentState = this.dexState.pokemon[identifier]
		const newState = { ...currentState, ...resetState }
		this.dexState.pokemon[identifier] = newState

		// Falls dies das aktuell ausgewählte Pokemon ist, direkt auch selectedPokemon aktualisieren
		if (getIdentifier(this.selectedPokemon.idEntry) === identifier) {
			this.selectedPokemon = { ...this.dexState.pokemon[identifier] }
		}

		// In Storage persistieren
		storageHandler.editPokemonStateEntry(identifier, this.dexState.pokemon[identifier])
	}

	toggleCaptured(identifier: string) {
		try {
			const pokemon = this.dexState.pokemon[identifier]
			if (pokemon) {
				this.updatePokemonState(identifier, {
					captured: !pokemon.captured
				})
			}
		} catch (error) {
			console.error('Failed to toggle captured status', error)
		}
	}

	toggleShiny(identifier: string) {
		try {
			const pokemon = this.dexState.pokemon[identifier]
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
		this.selectedPokemon = this.dexState.pokemon[identifier]
	}

	getSelectedPokemon() {
		return this.selectedPokemon ? this.selectedPokemon : this.nullState
	}

	deselectPokemon() {
		this.selectedPokemon = this.nullState
	}
}

export const pkState = new PkState()
