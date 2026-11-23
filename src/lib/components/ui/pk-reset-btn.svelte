<script lang="ts">
	import { dexStore } from '#lib/state/app.ts'
	import { createHotkeyHandler } from '#lib/hotkey-utils.ts'
	import PkIcon from '#lib/components/ui/pk-icon.svelte'
	import { appState } from '#lib/state/app-state.svelte.ts'

	let { identifier, disabled } = $props()

	function resetPokemon() {
		dexStore.resetPokemon(identifier)
		dexStore.deselect()
		appState.closeMobileSidebar()
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
	<PkIcon color="#fff" name={'trash-alt-solid'} size={24} />
</button>

<style>
	button {
		width: 44px;
		height: 44px;
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>
