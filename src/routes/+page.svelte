<script lang="ts">
	import PkBoxContainer from '$lib/components/box/pk-box-container.svelte'
	import PkSidebar from '$lib/components/sidebar/pk-sidebar.svelte'
	import PkToolBox from '$lib/components/toolbox/pk-toolbox.svelte'
	import { appState } from '$lib/state/app-state.svelte'
	import { pkState } from '$lib/state/pk-state.svelte'
	import { onMount } from 'svelte'

	// State für ausgewählten DexName
	let selectedDexName = $derived(appState.getCurrentPokedexName())
	let dexOrder = $derived(pkState.loadBoxOrder(selectedDexName))

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

{#await dexOrder}
	<p>waiting...</p>
{:then dexOrder}
	<main>
		<PkToolBox />
		<section class="pk-content">
			<PkBoxContainer {dexOrder} />
			<PkSidebar />
		</section>
	</main>
{/await}

<style>
	main {
		min-height: 100dvh;
	}

	.pk-content {
		margin: 0 2rem;
		display: flex;
		align-items: flex-start;
		gap: 2rem;
	}
</style>
