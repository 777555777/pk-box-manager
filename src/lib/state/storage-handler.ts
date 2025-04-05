import { initPokedex, initialAppDefaults } from '../init-dex-helper.ts'

export interface BoxOrder {
	title: string
	pokemon: PokemonEntry[]
}

export interface PokemonEntry {
	pokemonid: string
	formid: string | null
	id_national: number
}

export interface PokemonData {
	captured: boolean
	ball: string
	shiny: boolean
	caughtIn: string
	ability: string
	comment: string
	isCustomized: boolean
}

export interface PokemonState extends PokemonData {
	idEntry: PokemonEntry
}

export interface DexStorage {
	version: string
	name: string
	displayName: string
	pokemon: Record<string, PokemonState>
}

class StorageHandler {
	private readonly SELECTED_DEX_KEY = 'selectedDex'
	private readonly DEFAULT_SELECTED_DEX = 'order-national-forms.json'

	// ================
	// Pokedex
	// ================

	/**
	 * Initializes the editing status of a given Pokedex in localStorage.
	 * @param selectedDex The name of the Pokedex.
	 * @param pokedexOrder The box order of the Pokedex.
	 */
	public initPokedex(pokedexOrder: BoxOrder[], selectedDex: string): void {
		const initialDex = initPokedex(pokedexOrder, selectedDex)
		this.savePokedex(selectedDex, initialDex)
	}

	/**
	 * Saves the given Pokedex to localStorage.
	 * @param selectedDex The name of the Pokedex.
	 * @param pokemonData The editing status to be saved.
	 */
	public savePokedex(selectedDex: string, pokemonData: DexStorage): void {
		localStorage.setItem(`dex:${selectedDex}`, JSON.stringify(pokemonData))
	}

	/**
	 * Retrieves the current state of the Pokedex from localStorage.
	 * @param selectedDex The name of the Pokedex.
	 * @returns The Pokedex for the given name.
	 */
	public loadPokedex(selectedDex: string): DexStorage | undefined {
		const selectedPokedex = localStorage.getItem(`dex:${selectedDex}`)
		if (selectedPokedex) {
			try {
				const parsedPokedex = JSON.parse(selectedPokedex)
				return parsedPokedex
			} catch (error) {
				console.error('Fehler beim Parsen des Pokedex:', error)
			}
		}
		return undefined
	}

	/**
	 * Saves the currently selected Pokedex name to localStorage.
	 * @param selectedDexName The name of the newly selected Pokedex.
	 */
	public saveSelectedPokedexName(selectedDexName: string): void {
		localStorage.setItem(this.SELECTED_DEX_KEY, selectedDexName)
	}

	/**
	 * Retrieves the user-selected Pokedex name from localStorage or returns the default if none is stored.
	 * @returns The name of the stored or default Pokedex.
	 */
	public loadSelectedPokedexName(): string {
		const selectedPokedex = localStorage.getItem(this.SELECTED_DEX_KEY) || this.DEFAULT_SELECTED_DEX
		// If nothing was selected, return the default and persist it as selected in storage
		if (selectedPokedex === this.DEFAULT_SELECTED_DEX) {
			this.saveSelectedPokedexName(this.DEFAULT_SELECTED_DEX)
		}
		return selectedPokedex
	}

	// ================
	// Pokemon State
	// ================

	/**
	 * Updates a Pokemon's state properties while preserving existing properties not included in the edit.
	 * @param identifier The unique identifier of the Pokemon to edit.
	 * @param editedPokemon The new state properties to apply to the Pokemon.
	 * @returns The updated Pokemon state or undefined if the Pokemon couldn't be found.
	 */
	// prettier-ignore
	public editPokemonStateEntry(identifier: string, editedPokemon: PokemonState): PokemonState | undefined {
		const selectedDexName = this.loadSelectedPokedexName()
		const parsedDex = this.loadPokedex(selectedDexName)

		if (!parsedDex || !parsedDex.pokemon) {
			return undefined
		}

		const targetPokemon = parsedDex.pokemon[identifier];
		if (!targetPokemon) {
			console.error("Could not update given Pokemon", identifier)
			return undefined;
		}

		// Update only keys that are present in targetPokemon
		const editedPokemonValidKeys = Object.entries(editedPokemon).filter(([key]) => key in targetPokemon)
		const updatedPokemon: PokemonState = {
		...targetPokemon,
		...Object.fromEntries(editedPokemonValidKeys) as Pick<PokemonState, keyof typeof targetPokemon>
		};

		// Update pokemon in memory
		parsedDex.pokemon[identifier] = updatedPokemon

		// Persist edited Pokedex to localstorage
		localStorage.setItem(`dex:${selectedDexName}`, JSON.stringify(parsedDex))

		// Return updated Pokemon so it can be used in the application as state
		return updatedPokemon
	}

	// ================
	// App Defaults
	// ================

	/**
	 * Initializes the application's default settings in localStorage.
	 */
	public initAppDefaults() {
		localStorage.setItem(`appDefaults`, JSON.stringify(initialAppDefaults))
	}

	/**
	 * Saves custom application default settings to localStorage.
	 * @param appDefaults The default Pokemon data settings to save.
	 */
	public saveAppDefaults(appDefaults: Partial<PokemonData>) {
		localStorage.setItem(`appDefaults`, JSON.stringify(appDefaults))
	}

	/**
	 * Loads application default settings from localStorage or initializes them if they don't exist.
	 * @returns The application's default settings.
	 */
	public loadAppDefaults() {
		const appDefaults = localStorage.getItem(`appDefaults`)
		if (!appDefaults) {
			this.initAppDefaults()
			return initialAppDefaults
		}
		return JSON.parse(appDefaults)
	}
}

// Export StorageHandler as Singleton
export const storageHandler = new StorageHandler()
