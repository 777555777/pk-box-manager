import { initialAppDefaults } from '../init-dex-helper.ts'
import { defaultAppSettings } from '../null-state-helper.ts'
import {
	type AppSettings,
	type BadgeDisplayMode,
	type PokemonData,
	storageHandler
} from './storage-handler.ts'

export class AppState {
	// UI state
	private viewerMode = $state(false)
	private mobileSidebarOpen = $state(false)

	// Application settings
	private selectedDexName = $state(storageHandler.loadSelectedPokedexName())
	private appDefaults: Partial<PokemonData> = $state(initialAppDefaults)
	private appSettings = $state(storageHandler.loadAppSettings())

	private activeDropdownId: string | null = $state(null)

	// ================
	// UI State Methods
	// ================

	public isViewerModeEnabled(): boolean {
		return this.viewerMode
	}

	public toggleViewerMode(): void {
		this.viewerMode = !this.viewerMode
	}

	public isMobileSidebarOpen(): boolean {
		return this.mobileSidebarOpen
	}

	public toggleMobileSidebar(): void {
		this.mobileSidebarOpen = !this.mobileSidebarOpen
	}

	public getCurrentPokedexName(): string {
		return this.selectedDexName
	}

	public setCurrentPokedexName(name: string): void {
		this.selectedDexName = name
		storageHandler.saveSelectedPokedexName(name)
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
