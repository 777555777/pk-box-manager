import { type PokemonData, storageHandler } from './storage-handler.ts'

export class AppState {
	private initialAppDefaults = {
		ball: '01-poke-ball',
		shiny: false,
		caughtIn: '',
		comment: ''
	}
	private isAppLoading = $state(true)
	private viewerMode = $state(false)
	private badgeDisplay: string | boolean = $state(false)
	private selectedDexName = $state(storageHandler.getSelectedDexName())
	private defaultBall = $state('01-poke-ball')
	private appDefaults: Partial<PokemonData> = $state(this.initialAppDefaults)

	public toggleViewerMode() {
		this.viewerMode = !this.viewerMode
	}

	public getViewerMode() {
		return this.viewerMode
	}

	public getBadgeDisplay() {
		return this.badgeDisplay
	}

	public getAppLoadingState() {
		return this.isAppLoading
	}

	public setAppLoadingState(isLoading: boolean) {
		this.isAppLoading = isLoading
	}

	public cycleBadgeDisplay(currentBadeDisplay: string | boolean) {
		switch (currentBadeDisplay) {
			case false:
				this.badgeDisplay = 'ball'
				break
			case 'ball':
				this.badgeDisplay = 'shiny'
				break
			case 'shiny':
				this.badgeDisplay = false // false is off
				break
			default:
				this.badgeDisplay = false
				break
		}
	}

	public getSelectedDexName() {
		return this.selectedDexName
	}

	public setSelectedDexName(name: string) {
		this.selectedDexName = name
		storageHandler.switchDex(name)
	}

	public getDefaultBall() {
		return this.defaultBall
	}

	public setDefaultBall(newDefault: string) {
		this.defaultBall = newDefault
	}

	public getAppDefaults() {
		return this.appDefaults
	}

	public setAppDefaults(updatedDefaults: Partial<PokemonData>) {
		// Lokalen Status aktualisieren
		const currentDefaults = this.appDefaults
		const newDefaults = { ...currentDefaults, ...updatedDefaults }
		this.appDefaults = newDefaults
		// persist to localStorage
		storageHandler.saveAppDefaults(this.appDefaults)
	}

	public loadAppDefaults() {
		this.appDefaults = storageHandler.loadAppDefaults()
	}

	public resetAppDefaults() {
		this.setAppDefaults({
			ball: '01-poke-ball',
			shiny: false,
			caughtIn: '',
			comment: ''
		})
	}

	public checkForModifiedDefaults() {
		return JSON.stringify(this.appDefaults) === JSON.stringify(this.initialAppDefaults)
	}
}

export const appState = new AppState()
