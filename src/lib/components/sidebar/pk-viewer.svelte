<script lang="ts">
	import { getIdentifier, getPokemon, setCssPosition } from '$lib/spriteheet-helper'
	import { pokemonStateManager } from '$lib/state/state-manager.svelte'
	import type { PokemonState } from '$lib/state/storage-handler'

	// Receive the prop from parent
	let {
		selectedPokemon,
		sidebarEditMode
	}: { selectedPokemon: PokemonState; sidebarEditMode: boolean } = $props()
	let identifier = $derived(getIdentifier(selectedPokemon.idEntry))
	let currentPokemon = $derived(getPokemon(identifier))
	let isSelectionValid = $derived(identifier === '0000-null')

	function toggleShiny() {
		pokemonStateManager.toggleShiny(identifier)
	}

	function toggleCaptured() {
		pokemonStateManager.toggleCaptured(identifier)
	}
</script>

<section class="pk-viewer">
	<img
		src={currentPokemon.sheet + '.webp'}
		alt={identifier}
		style={setCssPosition(currentPokemon.pos)}
	/>
	<div class="pk-viewer-controls">
		<button onclick={toggleShiny} disabled={isSelectionValid || !sidebarEditMode}>✨</button>
		<button onclick={toggleCaptured} disabled={isSelectionValid || !sidebarEditMode}>🖥️</button>
	</div>
</section>

<style>
	.pk-viewer {
		width: 100%;
		height: 256px;

		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: row-reverse;

		/* concept placeholder */
		background-color: hsl(160, 100%, 90%);
		border: 2px solid hsl(170, 100%, 75%);
		border-radius: 10px;
		padding: 10px;
	}

	/* .pk-viewer img {
		box-sizing: content-box;
		image-rendering: pixelated;
		width: 256px; 
		height: 256px;
	} */

	:root {
		--image-slot-size: 64px;
	}
	img {
		box-sizing: content-box;
		image-rendering: pixelated;
		object-fit: none;
		width: 96px;
		height: 96px;
		transform: scale(2.666667); /* 74px */
	}

	.pk-viewer-controls {
		background-color: red;
		position: absolute;
		top: 16px;
		right: 16px;
	}

	.pk-viewer-controls button {
		width: 32px;
		height: 32px;
	}
</style>
