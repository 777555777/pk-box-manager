export class AppState {
	private sidebarEditMode = $state(false)
	private badgeDisplay: string | boolean = $state(false)

	public toggleSidebarEditMode() {
		this.sidebarEditMode = !this.sidebarEditMode
	}

	public getSidebarEditMode() {
		return this.sidebarEditMode
	}

	public getBadgeDisplay() {
		return this.badgeDisplay
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
}

export const appState = new AppState()
