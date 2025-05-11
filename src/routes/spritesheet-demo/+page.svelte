<script lang="ts">
	import { Pokemon } from '$lib/models/pokemon-models'
	import { setCssPosition } from '$lib/spriteheet-helper'
</script>

<section>
	{#each Object.entries(Pokemon) as [name, data]}
		<div class="debug-border">
			<img
				src={`/spritesheets/pokemon/${data.sheet}.webp`}
				style={setCssPosition(data.pos)}
				alt={name}
				loading="lazy"
			/>
		</div>
	{/each}
</section>

<style>
	section {
		/* Setup demo layout */
		margin: 0 auto;
		padding-block: 5rem;
		max-width: 800px;

		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(96px, 1fr));
		place-items: center;
		gap: 1rem;
	}

	:root {
		--target-width: 64;
		--target-height: 64;
		--original-width: 96;
		--original-height: 96;
		--scale-factor-x: calc(var(--target-width) / var(--original-width));
		--scale-factor-y: calc(var(--target-height) / var(--original-height));
	}

	div {
		max-width: calc(var(--target-width) * 1px);
		max-height: calc(var(--target-height) * 1px);
		img {
			width: calc(var(--original-width) * 1px);
			height: calc(var(--original-height) * 1px);

			object-fit: none; /* enable positioning of image section in spritesheet */
			/* object-position: x y; set object-position programaticly using calculated coordinates */

			/* calculate scale factor by using original-size / target-size */
			transform: scaleX(var(--scale-factor-x)) scaleY(var(--scale-factor-y)); /* visually scale the image */
			transform-origin: top left; /* scale down frop top left origin in order to size the box container properly */
		}
	}

	.debug-border {
		outline: 1px solid red;
	}
</style>
