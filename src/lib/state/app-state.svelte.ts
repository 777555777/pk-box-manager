import { storageHandler } from './storage-handler.ts'

export class AppState {
	private isAppLoading = $state(true)
	private sidebarEditMode = $state(false)
	private badgeDisplay: string | boolean = $state(false)
	private selectedDexName = $state(storageHandler.getSelectedDexName())

	public toggleSidebarEditMode() {
		this.sidebarEditMode = !this.sidebarEditMode
	}

	public getSidebarEditMode() {
		return this.sidebarEditMode
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
}

export const appState = new AppState()
