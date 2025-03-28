<script lang="ts">
	import { getPokemonSpriteData, setCssPosition } from '$lib/spriteheet-helper'

	let { identifier, isShiny = false }: { identifier: string; isShiny: boolean } = $props()
	let selectedPokemonSpriteData = $derived(getPokemonSpriteData(identifier))
</script>

<section class="pk-viewer">
	<img
		src={`/spritesheets/${isShiny ? 'shiny-pokemon' : 'pokemon'}/${selectedPokemonSpriteData.sheet}.webp`}
		alt={identifier}
		style={setCssPosition(selectedPokemonSpriteData.pos)}
	/>
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
</style>
