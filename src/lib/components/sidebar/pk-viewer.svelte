<script lang="ts">
	import { getPokemonSpriteData, setCssPosition } from '$lib/spriteheet-helper'

	let { identifier, shiny = false }: { identifier: string; shiny: boolean } = $props()
	let selectedPokemonSpriteData = $derived(getPokemonSpriteData(identifier))
</script>

<div class="pk-viewer pk-checkerboard">
	<img
		src={`/spritesheets/${shiny ? 'shiny-pokemon' : 'pokemon'}/${selectedPokemonSpriteData.sheet}.webp`}
		alt={identifier}
		style={setCssPosition(selectedPokemonSpriteData.pos)}
	/>
</div>

<style>
	:root {
		--checkerboard-color-1: #59aedf;
		--checkerboard-color-2: #49a6d7;
		--checkerboard-checker-size: 40px;
	}

	.pk-viewer {
		width: 100%;
		height: 256px;

		display: flex;
		justify-content: center;
		align-items: center;

		border-style: solid;
		border-width: 6px;

		border-image-source: url('/ui/inner-border-viewer.png');
		border-image-slice: 6;
		border-image-repeat: stretch;
		border-image-outset: 3px;
	}

	.pk-checkerboard {
		background: conic-gradient(
			var(--checkerboard-color-1) 90deg,
			var(--checkerboard-color-2) 90deg 180deg,
			var(--checkerboard-color-1) 180deg 270deg,
			var(--checkerboard-color-2) 270deg
		);
		background-size: var(--checkerboard-checker-size) var(--checkerboard-checker-size);
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
