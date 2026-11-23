import {
	type AppDefaults,
	type AppSettings,
	type BadgeDisplayMode,
	type WikiLink,
	defaultAppSettings,
	initialAppDefaults,
	loadAppDefaults,
	loadAppSettings,
	saveAppDefaults,
	saveAppSettings
} from './settings-storage.ts'

export class AppState {
	// UI state
	private viewerMode = $state(false)
	private mobileSidebarOpen = $state(false)
	private hideCapturedPokemon = $state(false)

	// Application settings
	private appDefaults: AppDefaults = $state(loadAppDefaults())
	private appSettings: AppSettings = $state(loadAppSettings())

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

	public getAppDefaults(): AppDefaults {
		return this.appDefaults
	}

	public updateAppDefaults(updatedDefaults: Partial<AppDefaults>): void {
		// Update local state
		const newDefaults = { ...this.appDefaults, ...updatedDefaults }
		this.appDefaults = newDefaults

		// Persist to localStorage
		saveAppDefaults(this.appDefaults)
	}

	public loadAppDefaults(): void {
		this.appDefaults = loadAppDefaults()
	}

	public resetAppDefaults(): void {
		this.updateAppDefaults(initialAppDefaults())
	}

	public hasModifiedDefaults(): boolean {
		return JSON.stringify(this.appDefaults) !== JSON.stringify(initialAppDefaults())
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
		saveAppSettings(this.appSettings)
	}

	public loadAppSettings(): AppSettings {
		return this.appSettings
	}

	public resetAppSettings(): void {
		this.updateAppSettings(defaultAppSettings())
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
		saveAppSettings(this.appSettings)
	}

	public updateWikiLinkConfig(wikiLinks: WikiLink[]): void {
		this.appSettings.wikiLinkConfig = wikiLinks
		saveAppSettings(this.appSettings)
	}
}

export const appState = new AppState()
