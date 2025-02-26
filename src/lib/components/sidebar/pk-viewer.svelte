<script lang="ts">
	import { type PokemonEntry } from '$lib/models/data-models'
	import { getIdentifier, getPokemon, setCssPosition } from '$lib/spriteheet-helper'

	let {
		pokemonEntry,
		userEditedData = $bindable()
	}: { pokemonEntry: PokemonEntry; userEditedData: any } = $props()
	const identifier = getIdentifier(pokemonEntry)
	let currentPokemon = $derived(getPokemon(getIdentifier(pokemonEntry)))
	// getPokemon(identifier)
	// const currentPokemon = getPokemon(identifier)
</script>

<section class="pk-viewer">
	<img
		src={currentPokemon.sheet + '.webp'}
		alt={identifier}
		style={setCssPosition(currentPokemon.position)}
	/>
	<div class="pk-viewer-controls">
		<button onclick={() => (userEditedData.shiny = !userEditedData.shiny)}>✨</button>
		<button onclick={() => (userEditedData.captured = !userEditedData.captured)}>🖥️</button>
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
		image-rendering: crisp-edges;
		width: 256px; 
		height: 256px;
	} */

	:root {
		--image-slot-size: 64px;
	}
	img {
		box-sizing: content-box;
		image-rendering: crisp-edges;
		/* image-rendering: pixelated; */
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
