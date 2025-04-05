<script lang="ts">
	import { pkState } from '$lib/state/pk-state.svelte'
	import { appState } from '$lib/state/app-state.svelte'
	import { supportedPokedexList } from '$lib/init-dex-helper'

	// State für ausgewählten DexName
	let selectedDexName = $derived(appState.getCurrentPokedexName())

	// Handle dex changes
	function handleDexChange(event: Event) {
		const selectElement = event.target as HTMLSelectElement

		// Update the app state
		appState.setCurrentPokedexName(selectElement.value)

		// Load the new dex state
		pkState.switchPokedex(selectElement.value)
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
	{#each Object.entries(supportedPokedexList) as [name, dex]}
		<option value={name}>{dex.displayName}</option>
	{/each}
</select>

<style>
	.pk-order {
		cursor: pointer;
		padding: 0.35rem 0.25rem;
	}
</style>
