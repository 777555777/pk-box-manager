import boxOrderNational from '../order/order-national.json' with { type: 'json' }
import boxOrderNationalForms from '../order/order-national-forms.json' with { type: 'json' }
import boxOrderNationalTest from '../order/order-national-test.json' with { type: 'json' }
import orderTestSmall1 from '../order/order-test-small-1.json' with { type: 'json' }
import orderTestSmall2 from '../order/order-test-small-2.json' with { type: 'json' }

export const staticDexList = {
	'order-national.json': {
		displayName: 'National Dex'
	},
	'order-national-forms.json': {
		displayName: 'National Dex mit Formen'
	},
	'order-national-test.json': {
		displayName: 'National Dex Test'
	},
	'order-test-small-1.json': {
		displayName: 'Kleiner Test Dex 1'
	},
	'order-test-small-2.json': {
		displayName: 'Kleiner Test Dex 2'
	}
} as const

export type DexType = keyof typeof staticDexList

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

	/**
	 * Ruft den aktuellen Zustand des Pokédex aus dem LocalStorage ab oder initialisiert ihn, falls er nicht existiert.
	 * @param selectedDex Der Name des aktuellen Pokédex.
	 * @returns Ein Array mit dem Bearbeitungsstatus jedes Pokemons im ausgewählten Pokedex.
	 */
	public getDexState(selectedDex: string): DexStorage {
		const selectedOrder = localStorage.getItem(`dex:${selectedDex}`)
		if (!selectedOrder) {
			this.initPokemonData(selectedDex, getBoxOrder(selectedDex))
			return JSON.parse(localStorage.getItem(`dex:${selectedDex}`)!)
		}
		return JSON.parse(selectedOrder)
	}

	/**
	 * Gibt die vordefinierte Box-Order für den ausgewählten Pokédex zurück.
	 * @param selectedDex Der Name des Pokédex.
	 * @returns Die entsprechende BoxOrder.
	 */
	public getDexOrder(selectedDex: string): BoxOrder[] {
		return getBoxOrder(selectedDex)
	}

	/**
	 * Ruft den vom Nutzer ausgewählten Pokédex-Namen aus dem LocalStorage ab.
	 * Falls noch keiner gespeichert ist, wird der Standard-Pokédex zurückgegeben.
	 * @returns Der Name des gespeicherten oder Standard-Pokédex.
	 */
	public getSelectedDexName(): string {
		return localStorage.getItem(this.SELECTED_DEX_KEY) || this.DEFAULT_SELECTED_DEX
	}

	/**
	 * Wechselt den aktuellen Pokédex und initialisiert ihn falls nötig.
	 * @param selectedDexName Der Name des neu gewählten Pokédex.
	 */
	public switchDex(selectedDexName: string): void {
		localStorage.setItem(this.SELECTED_DEX_KEY, selectedDexName)

		// Prüfen, ob der neue Dex bereits initialisiert wurde
		if (!localStorage.getItem(`dex:${selectedDexName}`)) {
			const pokedexOrder = getBoxOrder(selectedDexName)
			const initialData = this.setupInitialPokedex(pokedexOrder)
			const initialDex = this.addDexMetaData(initialData, selectedDexName)
			this.savePokemonData(selectedDexName, initialDex)
		}
	}

	/**
	 * Speichert die Daten des Pokedex Bearbeitungsstatus im LocalStorage.
	 * @param selectedDex Der Name des aktuellen Pokédex.
	 * @param pokemonData Der zu speichernde Bearbeitungsstatus.
	 */
	public savePokemonData(selectedDex: string, pokemonData: DexStorage): void {
		localStorage.setItem(`dex:${selectedDex}`, JSON.stringify(pokemonData))
	}

	public loadPokemonData(selectedDex: string): DexStorage | undefined {
		const localDexData = localStorage.getItem(`dex:${selectedDex}`)
		if (localDexData) {
			return JSON.parse(localDexData)
		}
	}

	/**
	 * Initialisiert den Bearbeitungsstatus eines gegebenen Pokedex, falls dieser noch nicht im LocalStorage vorhanden ist.
	 * @param selectedDex Der Name des Pokédex.
	 * @param pokedexOrder Die Box-Order des Pokédex.
	 */
	public initPokemonData(selectedDex: string, pokedexOrder: BoxOrder[]): void {
		const initialData = this.setupInitialPokedex(pokedexOrder)
		const initialDex = this.addDexMetaData(initialData, selectedDex)
		this.savePokemonData(selectedDex, initialDex)
	}

	// prettier-ignore
	private addDexMetaData(initialData: Record<string, PokemonState>,selectedDex: string): DexStorage {
		return {
			version: '1.0.0',
			name: selectedDex,
			displayName: staticDexList[selectedDex as DexType].displayName,
			pokemon: { ...initialData }
		}
	}

	/**
	 * Erstellt den initialen Bearbeitungsstatus basierend auf der Pokedex Box-Order.
	 * @param pokedexOrder Die Pokedex Box-Order.
	 * @returns Ein Objekt welches den initialen Bearbeitungsstatus enthält.
	 */
	private setupInitialPokedex(pokedexOrder: BoxOrder[]): Record<string, PokemonState> {
		const initialPokedex: Record<string, PokemonState> = {}

		for (const box of pokedexOrder) {
			for (const pokemon of box.pokemon) {
				const pokemonIdentifier = this.formatIdentifier(pokemon)
				initialPokedex[pokemonIdentifier] = {
					idEntry: pokemon,
					captured: false,
					ball: '01-poke-ball',
					shiny: false,
					caughtIn: '',
					ability: '',
					comment: '',
					isCustomized: false // Initial nicht angepasst
				}
			}
		}

		return initialPokedex
	}

	/**
	 * Erstellt eine eindeutige ID für ein Pokémon basierend auf National-ID, Pokémon-ID (Name) und Form (Form-Name).
	 * @param entry Das Pokémon-Objekt.
	 * @returns Eine formatierte ID für das Pokémon.
	 */
	private formatIdentifier(entry: PokemonEntry): string {
		const paddedId = entry.id_national.toString().padStart(4, '0')
		return `${paddedId}-${entry.pokemonid}${entry.formid ? '-' + entry.formid : ''}`
	}

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

	public saveAppDefaults(appDefaults: Partial<PokemonData>) {
		localStorage.setItem(`appDefaults`, JSON.stringify(appDefaults))
	}

	public loadAppDefaults() {
		const appDefaults = localStorage.getItem(`appDefaults`)
		if (appDefaults) {
			return JSON.parse(appDefaults)
		}
	}
}

// Export StorageHandler as Singleton
export const storageHandler = new StorageHandler()
