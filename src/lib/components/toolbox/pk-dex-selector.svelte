<script lang="ts">
	import { storageHandler } from '$lib/state/storage-handler'
	import { pokemonStateManager } from '$lib/state/state-manager.svelte'
	import { appState } from '$lib/state/app-state.svelte'

	// State für ausgewählten DexName
	let selectedDexName = $state(storageHandler.getSelectedDexName())

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
	<option value="order-national.json">order-national.json</option>
	<option value="order-national-forms.json">order-national-forms.json</option>
	<option value="order-national-test.json">order-national-test.json</option>
	<option value="order-test-small-1.json">order-test-small-1.json</option>
	<option value="order-test-small-2.json">order-test-small-2.json</option>
</select>

<style>
	.pk-order {
		padding: 0.35rem 0.25rem;
		margin: 0 auto;
	}
</style>
