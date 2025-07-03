import { hotkeyManager } from './state/hotkey-state.svelte.ts'

export function isInInputField(element: HTMLElement | null): boolean {
	if (!element) return false
	const tagName = element.tagName.toLowerCase()
	return tagName === 'input' || tagName === 'textarea' || element.contentEditable === 'true'
}

export function createHotkeyHandler(
	key: string,
	callback: () => void,
	localDisabled: () => boolean = () => false
) {
	return function (event: KeyboardEvent) {
		const globallyDisabled = hotkeyManager.isDisabled(key)
		const isDisabled = globallyDisabled || localDisabled()

		handleKeydown(event, key, callback, isDisabled)
	}
}

function handleKeydown(
	event: KeyboardEvent,
	key: string,
	callback: () => void,
	disabled?: boolean
): void {
	if (disabled || event.code !== key) {
		return
	}

	const activeElement = document.activeElement as HTMLElement

	if (!isInInputField(activeElement)) {
		callback()
	}
}
