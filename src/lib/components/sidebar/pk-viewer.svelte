<script lang="ts">
	import { getPokemonSpriteData, setCssPosition } from '$lib/spriteheet-helper'

	let { identifier, shiny = false }: { identifier: string; shiny: boolean } = $props()
	let selectedPokemonSpriteData = $derived(getPokemonSpriteData(identifier))
</script>

<div class="pk-viewer pk-checkerboard">
	{#if identifier !== '0000-null'}
		<img
			src={`/spritesheets/${shiny ? 'shiny-pokemon' : 'pokemon'}/${selectedPokemonSpriteData.sheet}.webp`}
			alt={identifier}
			style={setCssPosition(selectedPokemonSpriteData.pos)}
		/>
	{/if}
</div>

<style>
	.pk-viewer {
		--checkerboard-color-1: #59aedf;
		--checkerboard-color-2: #49a6d7;
		--checkerboard-checker-size: 40px;

		--target-size: 256;
		--original-size: 96;
		--scale-factor: calc(var(--target-size) / var(--original-size));

		width: 100%;
		height: calc(var(--target-size) * 1px);

		display: flex;
		justify-content: center;
		align-items: center;

		border-style: solid;
		border-color: transparent;
		border-width: 6px;

		border-image-source: url('/ui/inner-border-viewer.webp');
		border-image-slice: 6;
		border-image-repeat: stretch;
		border-image-outset: 3px;
	}

	@media (max-height: 1200px) {
		.pk-viewer {
			--target-size: 224;
		}
	}

	.pk-checkerboard {
		background: conic-gradient(
			var(--checkerboard-color-1) 90deg,
			var(--checkerboard-color-2) 90deg 180deg,
			var(--checkerboard-color-1) 180deg 270deg,
			var(--checkerboard-color-2) 270deg
		);
		background-size: var(--checkerboard-checker-size) var(--checkerboard-checker-size);
		/* animation: pan 3s linear infinite; */
	}

	@keyframes pan {
		from {
			background-position-x: 0;
			background-position-y: 0;
		}
		to {
			background-position-x: var(--checkerboard-checker-size);
			background-position-y: var(--checkerboard-checker-size);
		}
	}

	img {
		width: calc(var(--original-size) * 1px);
		height: calc(var(--original-size) * 1px);
		object-fit: none;
		transform: scale(var(--scale-factor));
		/* transform-origin: top left; */

		image-rendering: pixelated;
	}
</style>
