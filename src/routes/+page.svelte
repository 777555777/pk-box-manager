<script lang="ts">
	import PkBoxContainer from '$lib/components/box/pk-box-container.svelte'
	import PkSidebar from '$lib/components/sidebar/pk-sidebar.svelte'
	import PkToolBox from '$lib/components/toolbox/pk-toolbox.svelte'
	import { pokemonStateManager } from '$lib/state/state-manager.svelte'
	import { storageHandler } from '$lib/state/storage-handler'
	import { onMount } from 'svelte'

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

	// Handle click outside to deselect Pokémon
	onMount(() => {
		function handleClickOutside(event: MouseEvent) {
			const target = event.target as HTMLElement

			// Don't deselect if clicking on a pk-slot, sidebar, or one of their children
			const isClickInsidePkSlot = !!target.closest('.pk-slot')
			const isClickInsideSidebar = !!target.closest('.pk-sidebar')
			const isClickInsideTray = !!target.closest('.selector-tray')
			const isClickInsideToolbox = !!target.closest('.pk-toolbox')

			// If the click is outside both the pk-slot and sidebar, deselect the Pokémon
			if (
				!isClickInsidePkSlot &&
				!isClickInsideSidebar &&
				!isClickInsideToolbox &&
				!isClickInsideTray
			) {
				pokemonStateManager.deselectPokemon()
			}
		}

		// Add event listener
		document.addEventListener('click', handleClickOutside)

		// Clean up the event listener when the component is destroyed
		return () => {
			document.removeEventListener('click', handleClickOutside)
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

	<PkToolBox />
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
