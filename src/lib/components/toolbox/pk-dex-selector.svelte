<script lang="ts">
	import { pkState } from '$lib/state/pk-state.svelte'
	import { appState } from '$lib/state/app-state.svelte'
	import { supportedPokedexList } from '$lib/init-dex-helper'

	// State für ausgewählten DexName
	let selectedDexName = $derived(appState.getCurrentPokedexName())

	// Handle dex changes
	async function handleDexChange(event: Event) {
		const selectElement = event.target as HTMLSelectElement

		// Update the app state
		const targetPokedexName = selectElement.value

		// Load the new dex state
		await pkState.switchPokedex(selectElement.value)

		// Set the new pokedex name after the switch so that +page.svelte renders again
		// when the boxorder is in the cache, preventing duplicate requests.
		appState.setCurrentPokedexName(targetPokedexName)
	}
</script>

<div class="pk-select-wrapper">
	<select
		class="pk-select"
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
	<span class="pk-select-arrow"></span>
</div>
