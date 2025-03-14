<script lang="ts">
	import { storageHandler, staticDexList } from '$lib/state/storage-handler'
	import { pokemonStateManager } from '$lib/state/state-manager.svelte'
	import { appState } from '$lib/state/app-state.svelte'

	// State für ausgewählten DexName
	let selectedDexName = $derived(appState.getSelectedDexName())

	// Handle dex changes
	function handleDexChange(event: Event) {
		const select = event.target as HTMLSelectElement

		// Update the app state
		appState.setSelectedDexName(select.value)

		// Set loading state
		appState.setAppLoadingState(true)

		// Load the new dex state
		pokemonStateManager.loadDexState(select.value)

		// Wait for the next tick to ensure state is updated
		queueMicrotask(() => {
			appState.setAppLoadingState(false)
		})
	}
</script>

<select
	class="pk-order"
	name="pk-order"
	id="pk-order"
	title="pokedex-order"
	value={selectedDexName}
	onchange={handleDexChange}
>
	{#each Object.entries(staticDexList) as [name, dex]}
		<option value={name}>{dex.displayName}</option>
	{/each}
</select>

<style>
	.pk-order {
		padding: 0.35rem 0.25rem;
	}
</style>
