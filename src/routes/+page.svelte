<script lang="ts">
	import PkBoxContainer from '$lib/components/box/pk-box-container.svelte'
	import PkSidebar from '$lib/components/sidebar/pk-sidebar.svelte'
	import { pokemonStateManager } from '$lib/state/state-manager.svelte'
	import { storageHandler } from '$lib/state/storage-handler'

	// State für ausgewählten DexName
	let selectedDexName = $state(storageHandler.getSelectedDexName())

	// Ausgewählte DexOrder
	let dexOrder = $derived(storageHandler.getDexOrder(selectedDexName))

	// State für ausgewählte DexOrder
	let dexState = $derived(pokemonStateManager.getDexState())

	let isLoading = $state(true)

	// Handle dex changes
	function handleDexChange(event: Event) {
		const select = event.target as HTMLSelectElement
		const newDexName = select.value

		// Set loading state
		isLoading = true

		// Update selected dex name
		selectedDexName = newDexName

		// Load the new dex state
		pokemonStateManager.loadDexState(newDexName)

		// Wait for the next tick to ensure state is updated
		queueMicrotask(() => {
			isLoading = false
		})
	}

	// Initialize data on first load
	$effect(() => {
		// Ensure dex data is loaded
		pokemonStateManager.loadDexState(selectedDexName)

		// Check if data is available
		if (dexState && dexOrder) {
			isLoading = false
		}
	})
</script>

{#if isLoading}
	<div class="loading">Lade Pokédex...</div>
{:else}
	<select
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

	<main>
		<PkBoxContainer {dexOrder} />
		<PkSidebar />
	</main>
{/if}

<style>
	main {
		display: flex;
		justify-content: center;
		gap: 2rem;

		margin: 0 4rem;
		position: relative;
	}
</style>
