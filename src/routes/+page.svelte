<script lang="ts">
	import PkBoxContainer from '$lib/components/box/pk-box-container.svelte'
	import PkSidebar from '$lib/components/sidebar/pk-sidebar.svelte'
	import PkToolBox from '$lib/components/toolbox/pk-toolbox.svelte'
	import { appState } from '$lib/state/app-state.svelte'
	import { pkState } from '$lib/state/pk-state.svelte'
	import { storageHandler } from '$lib/state/storage-handler'
	import { onMount } from 'svelte'

	// State für ausgewählten DexName
	let selectedDexName = $derived(appState.getSelectedDexName())

	// Ausgewählte DexOrder
	let dexOrder = $derived(storageHandler.getDexOrder(selectedDexName))

	// State für ausgewählte DexOrder
	let dexState = $derived(pkState.getDexState())

	let isLoading = $derived(appState.getAppLoadingState())

	// Initialize data on first load
	$effect(() => {
		// Ensure dex data is loaded
		pkState.loadDexState(selectedDexName)

		// Check if data is available
		if (dexState && dexOrder) {
			appState.setAppLoadingState(false)
		}
	})

	// Handle click outside to deselect Pokémon
	onMount(() => {
		// TODO: find a better place to load the app defaults
		appState.loadAppDefaults()

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
				pkState.deselectPokemon()
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
	<main>
		<PkBoxContainer {dexOrder} />

		<section class="pk-tools">
			<PkToolBox />
			<PkSidebar />
		</section>
	</main>
{/if}

<style>
	main {
		display: grid;
		grid-template-columns: 1fr 400px; /* Content area and tools area */
		gap: 2rem;
		margin: 0 4rem;
		align-items: start; /* Important for proper alignment */

		min-height: 100dvh;
	}

	.pk-tools {
		display: flex;
		flex-direction: column;
		gap: 2rem;
		position: sticky; /* Make the entire tools section sticky */
		top: 4rem;
		height: auto;
		max-height: calc(100vh - 4rem); /* Ensure it doesn't exceed viewport */
		overflow-y: auto; /* Allow scrolling if tools get too tall */
	}
</style>
