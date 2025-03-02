<script lang="ts">
	import { type PokemonEntry } from '$lib/models/data-models'
	import { getIdentifier, getPokemon, setCssPosition } from '$lib/spriteheet-helper'
	import { storageHandler } from '$lib/state/storage-handler'

	let { pokemonEntry, pokemonState }: { pokemonEntry: PokemonEntry; pokemonState: any } = $props()
	const identifier = getIdentifier(pokemonEntry)
	const currentPokemon = getPokemon(identifier)

	function onclick() {
		// pokemonState.captured = !pokemonState.captured
		// storageHandler.editPokemonStateEntry(identifier, pokemonState)

		pokemonState = { ...pokemonState, captured: !pokemonState.captured }
		storageHandler.editPokemonStateEntry(identifier, pokemonState)
	}
</script>

<button class="pk-slot" {onclick} style="--grayscale: {pokemonState.captured ? '0%' : '100%'}">
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

		filter: grayscale(var(--grayscale));
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
