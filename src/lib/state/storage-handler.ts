import boxOrderNational from '../order/order-national.json' with { type: 'json' }
import boxOrderNationalForms from '../order/order-national-forms.json' with { type: 'json' }
import boxOrderNationalTest from '../order/order-national-test.json' with { type: 'json' }
import orderTestSmall1 from '../order/order-test-small-1.json' with { type: 'json' }
import orderTestSmall2 from '../order/order-test-small-2.json' with { type: 'json' }
import { initPokedex, initialAppDefaults } from '../init-dex-helper.ts'

/**
 * Liefert die entsprechende Box-Reihenfolge für den gewählten Pokédex.
 * @param dexName Der Name des gewünschten Pokédex-Orders.
 * @returns Das Array mit der Box-Order für den gegebenen Pokédex.
 */
export function getBoxOrder(dexName: string): BoxOrder[] {
	console.log('getBoxOrder() dexName', dexName)

	switch (dexName) {
		case 'order-national.json':
			return boxOrderNational
		case 'order-national-forms.json':
			return boxOrderNationalForms
		case 'order-national-test.json':
			return boxOrderNationalTest
		case 'order-test-small-1.json':
			return orderTestSmall1
		case 'order-test-small-2.json':
			return orderTestSmall2
		default:
			return boxOrderNational
	}
}

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
	private readonly DEFAULT_SELECTED_DEX = 'order-test-small-1.json'

	// =======
	// Pokedex
	// =======

	/**
	 * Initialisiert den Bearbeitungsstatus eines gegebenen Pokedex, falls dieser noch nicht im LocalStorage vorhanden ist.
	 * @param selectedDex Der Name des Pokédex.
	 * @param pokedexOrder Die Box-Order des Pokédex.
	 */
	public initPokedex(pokedexOrder: BoxOrder[], selectedDex: string): void {
		const initialDex = initPokedex(pokedexOrder, selectedDex)
		this.savePokedex(selectedDex, initialDex)
	}

	/**
	 * Speichert die Daten des Pokedex Bearbeitungsstatus im LocalStorage.
	 * @param selectedDex Der Name des aktuellen Pokédex.
	 * @param pokemonData Der zu speichernde Bearbeitungsstatus.
	 */
	public savePokedex(selectedDex: string, pokemonData: DexStorage): void {
		localStorage.setItem(`dex:${selectedDex}`, JSON.stringify(pokemonData))
	}

	/**
	 * Ruft den aktuellen Zustand des Pokédex aus dem LocalStorage ab oder initialisiert ihn, falls er nicht existiert.
	 * @param selectedDex Der Name des aktuellen Pokédex.
	 * @returns Ein Array mit dem Bearbeitungsstatus jedes Pokemons im ausgewählten Pokedex.
	 */
	public loadPokedex(selectedDex: string): DexStorage | undefined {
		const selectedOrder = localStorage.getItem(`dex:${selectedDex}`)
		if (selectedOrder) {
			try {
				const parsedOrder = JSON.parse(selectedOrder)
				return parsedOrder
			} catch (error) {
				console.error('Fehler beim Parsen des Pokedex:', error)
			}
		}
		return undefined
	}

	/**
	 * Wechselt den aktuellen Pokédex und initialisiert ihn falls nötig.
	 * @param selectedDexName Der Name des neu gewählten Pokédex.
	 */
	public saveSelectedPokedexName(selectedDexName: string): void {
		localStorage.setItem(this.SELECTED_DEX_KEY, selectedDexName)
	}

	/**
	 * Ruft den vom Nutzer ausgewählten Pokédex-Namen aus dem LocalStorage ab.
	 * Falls noch keiner gespeichert ist, wird der Standard-Pokédex zurückgegeben.
	 * @returns Der Name des gespeicherten oder Standard-Pokédex.
	 */
	public loadSelectedPokedexName(): string {
		return localStorage.getItem(this.SELECTED_DEX_KEY) || this.DEFAULT_SELECTED_DEX
	}

	// =========
	// Box Order
	// =========

	/**
	 * Gibt die vordefinierte Box-Order für den ausgewählten Pokédex zurück.
	 * @param selectedDex Der Name des Pokédex.
	 * @returns Die entsprechende BoxOrder.
	 */
	public loadPokedexOrder(selectedDex: string): BoxOrder[] {
		return getBoxOrder(selectedDex)
	}

	// =============
	// Pokemon State
	// =============

	public editPokemonStateEntry(identifier: string, pokemonState: PokemonState) {
		const selectedDex = localStorage.getItem(this.SELECTED_DEX_KEY)
		const selectedDexState = localStorage.getItem(`dex:${selectedDex}`)!
		if (selectedDexState) {
			const parsedDexState = JSON.parse(selectedDexState)
			const targetPokemon = parsedDexState.pokemon[identifier]

			const updatedPokemon = { ...targetPokemon }
			for (const key in pokemonState) {
				if (key in targetPokemon) {
					updatedPokemon[key] = pokemonState[key as keyof PokemonState]
				}
			}

			// Aktualisiere das Pokemon im temporären Objekt
			parsedDexState.pokemon[identifier] = updatedPokemon

			// Speichere den aktualisierten Zustand zurück in den localStorage
			localStorage.setItem(`dex:${selectedDex}`, JSON.stringify(parsedDexState))

			// Damit die daten wirklich im Sync sind müsste man eigentlich im Slot sie wieder aus dem localStorage abrufen ODER man returned sie hier
			return updatedPokemon
		}
	}

	// ============
	// App Defaults
	// ============

	public initAppDefaults() {
		localStorage.setItem(`appDefaults`, JSON.stringify(initialAppDefaults))
	}

	public saveAppDefaults(appDefaults: Partial<PokemonData>) {
		localStorage.setItem(`appDefaults`, JSON.stringify(appDefaults))
	}

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
