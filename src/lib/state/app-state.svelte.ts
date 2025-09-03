import { initialAppDefaults } from '../init-dex-helper.ts'
import { type PokemonEditState } from '../models/data-models.ts'
import { defaultAppSettings } from '../null-state-helper.ts'
import { type AppSettings, type BadgeDisplayMode, storageHandler } from './storage-handler.ts'

export class AppState {
	// UI state
	private viewerMode = $state(false)
	private mobileSidebarOpen = $state(false)
	private hideCapturedPokemon = $state(false)

	// Application settings
	private selectedDexId = $state(storageHandler.loadSelectedPokedexId())
	private appDefaults: Partial<PokemonEditState> = $state(initialAppDefaults)
	private appSettings = $state(storageHandler.loadAppSettings())

	private activeDropdownId: string | null = $state(null)

	// ================
	// UI State Methods
	// ================

	public isViewerModeEnabled(): boolean {
		return this.viewerMode
	}

	public toggleViewerMode(): void {
		// Wenn ViewerMode ausgeschaltet werden soll und hideCapturedPokemon aktiv ist,
		// dann auch hideCapturedPokemon deaktivieren
		if (this.viewerMode && this.hideCapturedPokemon) {
			this.hideCapturedPokemon = false // Filter auch deaktivieren
		}
		this.viewerMode = !this.viewerMode
	}

	public isMobileSidebarOpen(): boolean {
		return this.mobileSidebarOpen
	}

	public toggleMobileSidebar(): void {
		this.mobileSidebarOpen = !this.mobileSidebarOpen
	}

	public closeMobileSidebar(): void {
		this.mobileSidebarOpen = false
	}

	public getSelectedPokedexId(): string {
		return this.selectedDexId
	}

	public setSelectedPokedexId(name: string): void {
		this.selectedDexId = name
		storageHandler.saveSelectedPokedexId(name)
	}

	public openDropdown(dropdownId: string) {
		this.activeDropdownId = dropdownId
	}

	public closeDropdown() {
		this.activeDropdownId = null
	}

	public isDropdownOpen(dropdownId: string): boolean {
		return this.activeDropdownId === dropdownId
	}

	public isHideCapturedPokemonEnabled(): boolean {
		return this.hideCapturedPokemon
	}

	public toggleHideCapturedPokemon(): void {
		const wasHidden = this.hideCapturedPokemon
		this.hideCapturedPokemon = !this.hideCapturedPokemon

		// Auto-ViewerMode Logic:
		if (this.hideCapturedPokemon) {
			// Filter aktiviert → ViewerMode automatisch einschalten
			this.viewerMode = true
		} else if (wasHidden) {
			// Filter deaktiviert → ViewerMode auf vorherigen State zurücksetzen
			// (könnte man auch auf false setzen, aber so bleibt User-Präferenz erhalten)
			// this.viewerMode = false // Optional: ViewerMode auch ausschalten
		}
	}

	// ================
	// App Defaults Methods
	// ================

	public getAppDefaults(): Partial<PokemonEditState> {
		return this.appDefaults
	}

	public updateAppDefaults(updatedDefaults: Partial<PokemonEditState>): void {
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

	// ================
	// App Settings Methods
	// ================

	public getAppSettings(): AppSettings {
		return this.appSettings
	}

	public updateAppSettings(updatedSettings: Partial<AppSettings>): void {
		// Update local state
		const newSettings = { ...this.appSettings, ...updatedSettings }
		this.appSettings = newSettings

		// Persist to localStorage
		storageHandler.saveAppSettings(this.appSettings)
	}

	public loadAppSettings(): AppSettings {
		return this.appSettings
	}

	public resetAppSettings(): void {
		this.updateAppSettings(defaultAppSettings)
	}

	public cycleBadgeDisplayMode(): void {
		const nextModeMap = new Map<BadgeDisplayMode, BadgeDisplayMode>([
			[false, 'ball'],
			['ball', 'comment'],
			['comment', 'ribbon'],
			['ribbon', 'mark'],
			['mark', false]
		])

		this.appSettings.badgeDisplay = nextModeMap.get(this.appSettings.badgeDisplay) ?? false
		storageHandler.saveAppSettings(this.appSettings)
	}
}

export const appState = new AppState()
