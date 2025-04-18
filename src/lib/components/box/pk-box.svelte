<script lang="ts">
	import { type BoxOrder } from '$lib/models/data-models'
	import PkSlot from '$lib/components/box/pk-slot.svelte'
	import { getIdentifier } from '$lib/spriteheet-helper'

	let { box }: { box: BoxOrder } = $props()
</script>

<article class="pk-box">
	<header class="box-header">
		<h2>{box.title}</h2>
	</header>
	<div class="pk-box-background">
		<div class="box-grid">
			{#each box.pokemon as pokemon (getIdentifier(pokemon))}
				<PkSlot pokemonEntry={pokemon} />
			{/each}
		</div>
	</div>
</article>

<style>
	:root {
		--source-box-bg-url: url('boxes/forest.png');
		/* --source-box-bg-url: url('checks.png'); */
	}

	.pk-box {
		width: fit-content;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 0.75rem;
	}

	.pk-box-background {
		box-sizing: border-box;
		width: 408px; /* source is 1134px */
		height: 344px; /* source is 854px */
		border-width: 11px;
		border-style: solid;
		border-image-source: var(--source-box-bg-url);
		border-image-slice: 32; /* passt du ggf. an */
		border-image-repeat: stretch;
		border-image-outset: 0;
		border-image-width: 11px;

		image-rendering: pixelated;
		position: relative;
		z-index: 0; /* Stacking context für ::before */

		&::before {
			content: '';
			position: absolute;
			inset: 0;
			background-image: var(--source-box-bg-url);
			background-size: cover;
			background-position: center;
			background-repeat: no-repeat;

			background-size: 145%; /* scale image beyond container cize to avoid backed in border */
			background-position: 50% 50%; /* center image in container */

			z-index: -1;
		}
	}

	.box-header {
		box-sizing: border-box;

		width: 258px; /*  source is 812px */
		height: 52px; /* source is 161px */
		border-width: 8px;
		border-style: solid;
		border-image-source: url('boxes/box-title-border.png');
		border-image-slice: 8; /* Quadrat von Bildecke aus bis zum inneren Rand Ende */
		border-image-repeat: stretch;
		border-image-width: 8px;

		image-rendering: pixelated;

		background-image: url('boxes/forest-title-clean.png');
		background-size: 102% 112%;
		background-position: center;
		background-repeat: no-repeat;

		/* center headline */
		display: flex;
		align-items: center;
		justify-content: center;

		h2 {
			font-size: 1.4rem;
			color: #fff;
			text-shadow: 0 0 5px #000;
		}
	}

	.box-grid {
		box-sizing: content-box;
		display: grid;
		grid-template-columns: repeat(6, 1fr);
		grid-template-rows: repeat(5, 1fr);
		place-items: center;
		height: 100%;
	}
</style>
