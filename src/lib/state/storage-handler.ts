import { initPokedex, initialAppDefaults } from '../init-dex-helper.ts'
import { defaultAppSettings } from '../null-state-helper.ts'
import { type RibbonsType } from '../models/ribbons-models.ts'
import { type MarksType } from '../models/marks-models.ts'
import { nationalDex } from '../data/pokedex.ts'
import {
	type PokemonEditState,
	type BoxState,
	type DexConfig,
	type DexSave
} from '../models/data-models.ts'
import { getAllPossibleTags } from '../data/pokedex-config-utils.ts'

export type BadgeDisplayMode = false | 'ball' | 'comment' | 'ribbon' | 'mark'

type SidebarSection = 'catch' | 'ribbon' | 'mark' | 'stats'

export interface DexIndexEntry {
	id: string
	name: string
	displayName: string
	tags: string[]
	coverImage: string
	updatedAt: number
	createdAt: number
	totalPokemon: number
	totalCaughtPokemon: number
	totalShinyPokemon: number
}

export interface AppSettings {
	language: 'en' | 'de'
	boxSprites: 'default' | 'scaled'
	font: 'pixel' | 'system'
	badgeCycleOption: 'default' | 'filter'
	badgeDisplay: BadgeDisplayMode
	conditionalBadgeDisplay: {
		ribbon: RibbonsType
		mark: MarksType
	}
	sidebarExpanded: SidebarSection[]
}

export interface DexStorageHandler {
	// Basis
	initPokedex(dexConfig: DexConfig): string
	savePokedex(dexSave: DexSave): void
	loadPokedex(dexId: string): DexSave | undefined
	removePokedex(dexId: string): boolean

	// Index-Verwaltung
	loadPokedexIndex(): DexIndexEntry[]
	// updateDexIndex(dexSave: DexSave): void
	// removeFromDexIndex(dexId: string): void

	// Auswahl / User-Session
	saveSelectedPokedexId(dexId: string): void
	loadSelectedPokedexId(): string | undefined
	loadActivePokedex(): DexSave | undefined

	// Import / Export
	exportPokedex(dexId: string): string
	importPokedex(raw: string): DexSave

	// Utility / Checks
	hasModifiedPokedex(dexId: string): boolean
	// listAllDexIds(): string[]
	// findDexByConfigId(configId: string, tags?: string[]): DexSave | undefined

	// Optional (Quality-of-Life)
	// cloneDex(dexId: string): DexSave
	// resetDex(dexId: string): void
	// migrateDexSaves(oldVersion: string, newVersion: string): void
}

// Compute default tags part once to avoid trailing '-' when there are no tags
const DEFAULT_TAGS_PART = (() => {
	const tags = getAllPossibleTags()
	return tags && tags.length > 0 ? `-${tags.join('-')}` : ''
})()

export const DEFAULT_SELECTED_DEX = `${nationalDex.type}-${nationalDex.id}${DEFAULT_TAGS_PART}`

class StorageHandler implements DexStorageHandler {
	private readonly DEX_PREFIX = 'dex:'
	private readonly SELECTED_DEX_KEY = 'selectedDex'
	private readonly DEFAULT_SELECTED_DEX = DEFAULT_SELECTED_DEX

	// ================
	// Pokedex
	// ================

	// >>> Basis Funktionen

	/**
	 * Initializes the editing status and config (DexSave) for a given Pokedex.
	 * Returns the ID of the newly created Pokedex, so the dex can be retreived
	 * from localstorage so that localstorage acts as a single source of truth
	 * @param dexConfig The configuration for the Pokedex.
	 */
	public initPokedex(dexConfig: DexConfig): string {
		const initialDex: DexSave = initPokedex(dexConfig)
		this.savePokedex(initialDex)
		const dexSaveId = initialDex.id
		return dexSaveId
	}

	/**
	 * Persists the given Pokedex to localStorage and updates/adds its metadata.
	 * Timestamps are set for createdAt and updatedAt.
	 * @param DexSave The Pokedex to save.
	 */
	public savePokedex(dexSave: DexSave): void {
		// Timestamps ins Meta
		const now = Date.now()

		if (dexSave.meta.createdAt === 0) {
			dexSave.meta.createdAt = now
		}

		dexSave.meta.updatedAt = now

		// Counter berechnen (effizienter: nur ein Loop)
		let total = 0
		let caught = 0
		let shiny = 0

		for (const pokemon of Object.values(dexSave.state.pokemon)) {
			total++
			if (pokemon.captured) {
				caught++
				if (pokemon.shiny) shiny++
			}
		}

		dexSave.meta.totalPokemon = total
		dexSave.meta.totalCaught = caught
		dexSave.meta.totalShiny = shiny

		// Final speichern
		localStorage.setItem(`${this.DEX_PREFIX}${dexSave.id}`, JSON.stringify(dexSave))
		console.log(`Saved ${dexSave.id} to localStorage`)
	}

	/**
	 * Retrieves the Pokedex Object of the given Pokedex from localStorage.
	 * @param targetDexId The ID of the Pokedex to retrieve.
	 * @returns The Pokedex Object or undefined if not found.
	 */
	public loadPokedex(targetDexId: string): DexSave | undefined {
		const targetPokedex = localStorage.getItem(`${this.DEX_PREFIX}${targetDexId}`)
		if (targetPokedex) {
			try {
				const parsedPokedex = JSON.parse(targetPokedex)
				return parsedPokedex
			} catch (error) {
				console.error('Error parsing the Pokedex:', error)
			}
		}
		return undefined
	}

	/**
	 * Removes a Pokedex Object entry for a given Pokedex ID from localStorage.
	 * @param targetDexId The ID of the Pokedex to remove.
	 * @returns true if the Pokedex was removed, false if it didn't exist.
	 */
	public removePokedex(targetDexId: string): boolean {
		const key = `${this.DEX_PREFIX}${targetDexId}`
		if (localStorage.getItem(key) !== null) {
			localStorage.removeItem(key)
			console.log(`Pokedex ${targetDexId} removed from storage`)
			return true
		}
		console.log(`No Pokedex found with ID ${key} to remove`)
		return false
	}

	// >>> Index-Verwaltung

	public loadPokedexIndex(): DexIndexEntry[] {
		const items = { ...localStorage }
		const entries = Object.entries(items)
		const dexIndexList: DexIndexEntry[] = []

		for (const entry of entries) {
			const [key, value] = entry
			if (key.startsWith(`${this.DEX_PREFIX}`)) {
				try {
					const parsedValue: DexSave = JSON.parse(value)
					const validEntry: DexIndexEntry = {
						id: parsedValue.id,
						name: parsedValue.config.name,
						displayName: parsedValue.config.displayName,
						tags: parsedValue.config.tags,
						coverImage: parsedValue.config.coverImage,
						updatedAt: parsedValue.config.updatedAt,
						createdAt: parsedValue.config.createdAt,
						totalPokemon: parsedValue.meta.totalPokemon,
						totalCaughtPokemon: parsedValue.meta.totalCaught,
						totalShinyPokemon: parsedValue.meta.totalShiny
					}
					dexIndexList.push(validEntry)
				} catch (error) {
					console.error('Failed to parse dex entry for key', key, error)
				}
			}
		}
		return dexIndexList
	}

	// TODO: Diese beiden Methoden müssen implementiert werden wenn loadDexIndex eine zu schlechte Performance zeigt!
	// Braucht man eventuell nicht ?!
	// updateDexIndex(dexSave: DexSave): void

	// Braucht man eventuell nicht ?!
	// removeFromDexIndex(dexId: string): void

	// >>> Auswahl / User-Session

	/**
	 * Saves the currently selected Pokedex ID to localStorage.
	 * @param selectedDexId The ID of the newly selected Pokedex.
	 */
	public saveSelectedPokedexId(selectedDexId: string): void {
		localStorage.setItem(this.SELECTED_DEX_KEY, selectedDexId)
	}

	/**
	 * Retrieves the currently selected Pokedex ID from localStorage or returns the default if none is stored.
	 * @returns The ID of the stored or default Pokedex.
	 */
	public loadSelectedPokedexId(): string {
		const selectedPokedexId =
			localStorage.getItem(this.SELECTED_DEX_KEY) || this.DEFAULT_SELECTED_DEX

		// If nothing was selected, return the default and persist it as selected in storage
		if (selectedPokedexId === this.DEFAULT_SELECTED_DEX) {
			this.saveSelectedPokedexId(this.DEFAULT_SELECTED_DEX)
		}
		return selectedPokedexId
	}

	/**
	 * Loads all Pokedexes stored in localStorage.
	 * @returns An array of all stored DexStorage objects.
	 */
	public loadEveryPokedex(): DexSave[] {
		const allDexes: DexSave[] = []
		for (const key in localStorage) {
			if (key.startsWith(`${this.DEX_PREFIX}`)) {
				const dexName = key.replace(`${this.DEX_PREFIX}`, '')
				const dexData = this.loadPokedex(dexName)
				if (dexData) {
					allDexes.push(dexData)
				}
			}
		}
		return allDexes
	}

	/**
	 * Loads the currently selected Pokedex based on the selected Pokedex ID that is stored in localStorage.
	 * @returns The currently selected DexSave object or undefined if not found.
	 */
	public loadActivePokedex(): DexSave | undefined {
		const selectedDexId = this.loadSelectedPokedexId()
		return this.loadPokedex(selectedDexId)
	}

	/**
	 * Checks if a Pokedex has been modified from its initial state.
	 * @param dexName The name of the Pokedex to check.
	 * @returns true if the Pokedex has been modified, false if it's in the initial state.
	 */
	public hasModifiedPokedex(dexName: string): boolean {
		const currentDex = this.loadPokedex(dexName)
		if (!currentDex) {
			return false
		}

		// Check if any Pokemon has been customized
		const hasCustomizedPokemon = Object.values(currentDex.state.pokemon).some(
			(pokemon) => pokemon.isCustomized || pokemon.captured
		)

		return hasCustomizedPokemon
	}

	// >>> Import / Export

	/**
	 * Returns the Pokedex Object (DexSave) for the given ID as a JSON string.
	 * @param dexId The ID of the Pokedex to export.
	 * @returns The JSON string representation of the Pokedex data.
	 */
	public exportPokedex(dexId: string): string {
		const dexData = this.loadPokedex(dexId)
		if (!dexData) {
			console.error('No Pokedex found for ID:', dexId)
			return ''
		}
		return JSON.stringify(dexData)
	}

	/**
	 * Persists a user imported Pokedex to localStorage.
	 * @param raw The JSON string representation of the Pokedex data.
	 * @returns The imported DexSave object.
	 */
	public importPokedex(raw: string): DexSave {
		try {
			// TODO: Wip, validate the imported Dex before accepting it
			// maybe do this in the component and then pass a validated
			// DexSave Object here instead of a string
			const dexData: DexSave = JSON.parse(raw)
			this.savePokedex(dexData)
			return dexData
		} catch (error) {
			console.error('Failed to import Dex:', error)
			return {} as DexSave
		}
	}

	// >>> Utility / Checks

	// ================
	// Pokemon State
	// ================

	/**
	 * Updates a Pokemon's state properties while preserving existing properties not included in the edit.
	 * @param identifier The unique identifier of the Pokemon to edit.
	 * @param editedPokemon The new state properties to apply to the Pokemon.
	 * @returns The updated Pokemon state or undefined if the Pokemon couldn't be found.
	 */
	public editPokemonStateEntry(
		identifier: string,
		editedPokemon: PokemonEditState
	): PokemonEditState | undefined {
		const selectedDexName = this.loadSelectedPokedexId()
		const parsedDex = this.loadPokedex(selectedDexName)

		if (!parsedDex || !parsedDex.state.pokemon) {
			return undefined
		}

		const targetPokemon = parsedDex.state.pokemon[identifier]
		if (!targetPokemon) {
			console.error('Could not update given Pokemon', identifier)
			return undefined
		}

		const allowedProperties: (keyof PokemonEditState)[] = [
			'captured',
			'ball',
			'shiny',
			'caughtIn',
			'ability',
			'comment',
			'ribbons',
			'marks',
			'isCustomized'
		]

		// Update only keys that are present in targetPokemon
		const editedPokemonValidKeys = Object.entries(editedPokemon).filter(([key]) =>
			allowedProperties.includes(key as keyof PokemonEditState)
		)
		const updatedPokemon: PokemonEditState = {
			...targetPokemon,
			...Object.fromEntries(editedPokemonValidKeys)
		}

		// Update pokemon in memory
		parsedDex.state.pokemon[identifier] = updatedPokemon

		// Persist edited Pokedex to localstorage
		this.savePokedex(parsedDex)
		// localStorage.setItem(`${this.DEX_PREFIX}${selectedDexName}`, JSON.stringify(parsedDex))

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
	public saveAppDefaults(appDefaults: Partial<PokemonEditState>) {
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

		const parsedDefaults = JSON.parse(appDefaults)

		// Generic migration: Merge with defaults to ensure all properties exist
		const migratedDefaults = { ...initialAppDefaults, ...parsedDefaults }

		// Save back if any properties were missing (migration occurred)
		if (JSON.stringify(parsedDefaults) !== JSON.stringify(migratedDefaults)) {
			this.saveAppDefaults(migratedDefaults)
		}

		return migratedDefaults
	}

	// ================
	// App Settings
	// ================

	/**
	 * Initializes the application's settings in localStorage.
	 */
	public initAppSettings() {
		localStorage.setItem('appSettings', JSON.stringify(defaultAppSettings))
	}

	/**
	 * Saves the application's settings to localStorage.
	 * @param appSettings The application settings to save.
	 */
	public saveAppSettings(appSettings: AppSettings): void {
		localStorage.setItem('appSettings', JSON.stringify(appSettings))
	}

	/**
	 * Reads and returns the application's settings from localStorage.
	 */
	public loadAppSettings(): AppSettings {
		const appSettings = localStorage.getItem('appSettings')
		if (!appSettings) {
			this.initAppSettings()
			return defaultAppSettings
		}

		const parsedSettings = JSON.parse(appSettings)

		// Generic migration: Merge with defaults to ensure all properties exist
		const migratedSettings: AppSettings = {
			...defaultAppSettings,
			...parsedSettings,
			// Deep merge for nested objects
			conditionalBadgeDisplay: {
				...defaultAppSettings.conditionalBadgeDisplay,
				...(parsedSettings.conditionalBadgeDisplay || {})
			}
		}

		// Save back if any properties were missing (migration occurred)
		if (JSON.stringify(parsedSettings) !== JSON.stringify(migratedSettings)) {
			this.saveAppSettings(migratedSettings)
		}

		return migratedSettings
	}

	// ================
	// Box Settings
	// ================

	/**
	 * Updates the settings of a specific box while preserving existing settings.
	 * @param boxId The unique identifier of the box to update.
	 * @param newSettings The new settings to apply to the box.
	 */
	public updateBoxSettings(boxId: string, newSettings: BoxState['settings']): void {
		const selectedDexId = this.loadSelectedPokedexId()
		const parsedDex = this.loadPokedex(selectedDexId)

		if (!parsedDex || !parsedDex.state.boxes) {
			throw new Error('Could not find Pokedex data to update box settings.')
		}

		const boxIndex = parsedDex.state.boxes.findIndex((box) => box.id === boxId)
		if (boxIndex === -1) {
			throw new Error(`Box with ID "${boxId}" not found.`)
		}

		// Update the box settings
		parsedDex.state.boxes[boxIndex].settings = {
			...parsedDex.state.boxes[boxIndex].settings,
			...newSettings
		}

		// Persist the updated Pokedex to localStorage
		this.savePokedex(parsedDex)
	}
}

// Export StorageHandler as Singleton
export const storageHandler = new StorageHandler()
