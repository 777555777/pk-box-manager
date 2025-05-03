<script lang="ts">
	import { pkState } from '$lib/state/pk-state.svelte'

	let { identifier, disabled } = $props()

	const icon = '/ui/trash-alt-solid.svg'

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
		const isInSidebar = !!activeElement?.closest('.pk-sidebar')
		const isInputOrTextarea =
			activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA'

		// Wenn das aktive Element kein Input/Textarea ist oder sich in der Toolbox befindet
		if (!isInputOrTextarea || isInToolbox || isInSidebar) {
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

<button class="pk-button" onclick={resetPokemon} {disabled} title="Reset Pokemon (Q)"
	><img src={icon} alt="" />
</button>

<style>
	button {
		width: 44px;
		height: 44px;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.pk-button img {
		margin-bottom: 3px;
	}
</style>
