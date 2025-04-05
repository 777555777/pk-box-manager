import { initialAppDefaults } from '../init-dex-helper.ts'
import { type PokemonData, storageHandler } from './storage-handler.ts'

type BadgeDisplayMode = false | 'ball'

export class AppState {
	// UI state
	private viewerMode = $state(false)
	private badgeDisplay: BadgeDisplayMode = $state(false)

	// Application settings
	private selectedDexName = $state(storageHandler.loadSelectedPokedexName())
	private appDefaults: Partial<PokemonData> = $state(initialAppDefaults)

	// ================
	// UI State Methods
	// ================

	public isViewerModeEnabled(): boolean {
		return this.viewerMode
	}

	public toggleViewerMode(): void {
		this.viewerMode = !this.viewerMode
	}

	public getBadgeDisplayMode(): BadgeDisplayMode {
		return this.badgeDisplay
	}

	public cycleBadgeDisplayMode(): void {
		const nextModeMap = new Map<BadgeDisplayMode, BadgeDisplayMode>([
			[false, 'ball'],
			['ball', false]
		])

		this.badgeDisplay = nextModeMap.get(this.badgeDisplay) ?? false
	}

	public getCurrentPokedexName(): string {
		return this.selectedDexName
	}

	public setCurrentPokedexName(name: string): void {
		this.selectedDexName = name
		storageHandler.saveSelectedPokedexName(name)
	}

	// ================
	// App Defaults Methods
	// ================

	public getAppDefaults(): Partial<PokemonData> {
		return this.appDefaults
	}

	public updateAppDefaults(updatedDefaults: Partial<PokemonData>): void {
		// Update local state
		const newDefaults = { ...this.appDefaults, ...updatedDefaults }
		this.appDefaults = newDefaults

		// Persist to localStorage
		storageHandler.saveAppDefaults(this.appDefaults)
	}

	public loadAppDefaults(): void {
		this.appDefaults = storageHandler.loadAppDefaults()
	}

	public resetAppDefaults(): void {
		this.updateAppDefaults(initialAppDefaults)
	}

	public hasModifiedDefaults(): boolean {
		return JSON.stringify(this.appDefaults) !== JSON.stringify(initialAppDefaults)
	}
}

export const appState = new AppState()
