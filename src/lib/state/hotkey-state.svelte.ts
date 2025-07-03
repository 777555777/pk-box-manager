class HotkeyManager {
	private isGloballyDisabled = $state(false)
	private disabledKeys = $state(new Set<string>())

	disableAll() {
		this.isGloballyDisabled = true
	}

	enableAll() {
		this.isGloballyDisabled = false
	}

	disableKeys(keys: string[]) {
		keys.forEach((key) => this.disabledKeys.add(key))
	}

	enableKeys(keys: string[]) {
		keys.forEach((key) => this.disabledKeys.delete(key))
	}

	isDisabled(key?: string): boolean {
		if (this.isGloballyDisabled) return true
		if (key && this.disabledKeys.has(key)) return true
		return false
	}
}

export const hotkeyManager = new HotkeyManager()
