<script lang="ts">
	import PkBoxContainer from '$lib/components/box/pk-box-container.svelte'
	import PkSidebar from '$lib/components/sidebar/pk-sidebar.svelte'
	import PkToolBox from '$lib/components/toolbox/pk-toolbox.svelte'
	import { appState } from '$lib/state/app-state.svelte'
	import { pkState } from '$lib/state/pk-state.svelte'
	import { onMount } from 'svelte'

	// Use DexStorage from pkState to get the current state of the Pokedex
	let dexStorage = $derived(pkState.getCurrentPokedexState())

	// Handle click outside to deselect Pokémon
	onMount(() => {
		// TODO: find a better place to load the app defaults
		appState.loadAppDefaults()
		appState.loadAppSettings()

		// Service Worker registrieren für Asset Caching
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker
				.register('/service-worker.js')
				.then((registration) => {
					console.log('Service Worker registriert:', registration.scope)
				})
				.catch((error) => {
					console.log('Service Worker Registrierung fehlgeschlagen:', error)
				})
		}

		function handleClickOutside(event: MouseEvent) {
			const target = event.target as HTMLElement

			// Don't deselect if clicking on a pk-slot, sidebar, or one of their children
			const isClickInsidePkSlot = !!target.closest('.pk-slot')
			const isClickInsideSidebar = !!target.closest('.pk-sidebar')
			const isClickInsideTray = !!target.closest('.selector-tray')
			const isClickInsideToolbox = !!target.closest('.pk-toolbox')
			const isClickInsidePkBallSelector = !!target.closest('.pk-selector-tray')

			// If the click is outside both the pk-slot and sidebar, deselect the Pokémon
			if (
				!isClickInsidePkSlot &&
				!isClickInsideSidebar &&
				!isClickInsideToolbox &&
				!isClickInsideTray &&
				!isClickInsidePkBallSelector
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

{#await dexStorage}
	<p>waiting...</p>
{:then dexStorage}
	<main>
		<section class="pk-content">
			<PkToolBox />
			<PkBoxContainer {dexStorage} />
		</section>
		<PkSidebar />
	</main>
{/await}

<style>
	main {
		display: flex;
		height: 100dvh;
		max-width: 94%;
		margin: 0 auto;
	}

	.pk-content {
		flex: 1 1 0;
		max-width: none;
		margin: 0;
		display: flex;
		justify-content: center;
		align-items: flex-start;
		height: 100dvh;
		overflow-y: auto;
		overflow-x: visible;
		scrollbar-width: none;
	}
</style>
