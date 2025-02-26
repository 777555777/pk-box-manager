<script lang="ts">
	import { type PokemonEntry } from '$lib/models/data-models'
	import { getIdentifier, getPokemon, setCssPosition } from '$lib/spriteheet-helper'
	import { selectedPokemon } from '$lib/state/data.svelte'

	let { pokemonEntry }: { pokemonEntry: PokemonEntry } = $props()
	const identifier = getIdentifier(pokemonEntry)
	const currentPokemon = getPokemon(identifier)

	function onclick() {
		selectedPokemon.entry = pokemonEntry
		// selectedPokemon.caught = !selectedPokemon.caught
	}
</script>

<button class="pk-slot" {onclick}>
	<img
		src={currentPokemon.sheet + '.webp'}
		alt={identifier}
		style={setCssPosition(currentPokemon.position)}
	/>
</button>

<style>
	:root {
		--image-slot-size: 64px;
	}
	img {
		/* image-rendering: pixelated; */
		object-fit: none;
		width: 96px;
		height: 96px;
		transform: scale(0.666667); /* 74px */
		transform-origin: top left;
	}

	.pk-slot {
		width: var(--image-slot-size);
		height: var(--image-slot-size);
		cursor: pointer;
		padding: 0;

		/* concept placeholder */
		background-color: hsl(60, 100%, 90%);
		/* border: 2px solid hsl(50, 70%, 50%); */
		border-radius: 5px;
	}
</style>
