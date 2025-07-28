<script lang="ts">
	import { pkState } from '$lib/state/pk-state.svelte'
	import { createHotkeyHandler } from '$lib/hotkey-utils'

	let { identifier, disabled } = $props()

	const icon = '/ui/trash-alt-solid.svg'

	function resetPokemon() {
		pkState.resetPokemon(identifier)
		pkState.deselectPokemon()
	}

	const hotkeyHandler = createHotkeyHandler('KeyQ', resetPokemon, () => disabled)

	// Update it whenever the state manager's selection changes
	$effect(() => {
		document.addEventListener('keydown', hotkeyHandler)
		return () => {
			document.removeEventListener('keydown', hotkeyHandler)
		}
	})
</script>

<button
	class="pk-button pk-tooltip"
	onclick={resetPokemon}
	{disabled}
	data-tooltip="Reset Pokemon (Q)"
>
	<img src={icon} alt="" />
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
