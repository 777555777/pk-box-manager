<script lang="ts">
	import { pkState } from '$lib/state/pk-state.svelte'

	let { identifier, disabled } = $props()

	function resetPokemon() {
		pkState.resetPokemon(identifier)
		pkState.deselectPokemon()
	}

	function handleKeydown(event: KeyboardEvent) {
		if (disabled || event.code !== 'KeyQ') {
			return
		}

		const activeElement = document.activeElement
		const isInToolbox = !!activeElement?.closest('.pk-toolbox')
		const isInputOrTextarea =
			activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA'

		// Wenn das aktive Element kein Input/Textarea ist oder sich in der Toolbox befindet
		if (!isInputOrTextarea || isInToolbox) {
			resetPokemon()
		}
	}

	// Update it whenever the state manager's selection changes
	$effect(() => {
		document.addEventListener('keydown', handleKeydown)
		return () => {
			document.removeEventListener('keydown', handleKeydown)
		}
	})
</script>

<button onclick={resetPokemon} {disabled}>Reset (Q)</button>
