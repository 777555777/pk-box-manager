<script lang="ts">
	import { type PokemonEntry } from '$lib/models/data-models'
	import { type PokemonType, Pokemon } from '$lib/models/pokemon-models'
	import { type FormsType, Forms } from '$lib/models/forms-models'
	interface SpriteData {
		sheet: string
		position: {
			x: number
			y: number
		}
	}

	type Coordinates = { x: number; y: number }

	const combinedPokemon: Record<string, SpriteData> = { ...Pokemon, ...Forms }

	// 0003-venusaur-female
	let {
		pokemonEntry,
		shiny,
		caught
	}: { pokemonEntry: PokemonEntry; shiny: boolean; caught: boolean } = $props()
	const identifier = getIdentifier(pokemonEntry)
	const currentPokemon = getPokemon(identifier)

	function getIdentifier(entry: PokemonEntry) {
		const paddedId = entry.id_national.toString().padStart(4, '0')
		return `${paddedId}-${entry.pokemonid}${entry.formid ? '-' + entry.formid : ''}`
	}

	function getPokemon(identifier: string): SpriteData {
		if (identifier in combinedPokemon) {
			return combinedPokemon[identifier]
		}
		// return null object Pokemon
		// displays as questionmark icon
		return combinedPokemon['0000-null']
	}

	function setCssPosition(position: Coordinates) {
		return `object-position: ${position.x}px ${position.y}px;`
	}

	// ==========================================================================================
	$inspect(shiny)
	$inspect(caught)
</script>

<section class="pk-viewer">
	<img
		src={currentPokemon.sheet + '.webp'}
		alt={identifier}
		style={setCssPosition(currentPokemon.position)}
	/>
	<div class="pk-viewer-controls">
		<button onclick={() => (shiny = !shiny)}>✨</button>
		<button onclick={() => (caught = !caught)}>🖥️</button>
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
