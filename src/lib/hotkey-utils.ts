export function isInInputField(element: HTMLElement | null): boolean {
	if (!element) return false
	const tagName = element.tagName.toLowerCase()
	return tagName === 'input' || tagName === 'textarea' || element.contentEditable === 'true'
}

export function createHotkeyHandler(key: string, callback: () => void, disabled: () => boolean) {
	return function (event: KeyboardEvent) {
		handleKeydownNew(event, key, callback, disabled())
	}
}

function handleKeydownNew(
	event: KeyboardEvent,
	key: string,
	callback: () => void,
	disabled: boolean
): void {
	if (disabled || event.code !== key) {
		return
	}

	const activeElement = document.activeElement as HTMLElement

	if (!isInInputField(activeElement)) {
		callback()
	}
}
