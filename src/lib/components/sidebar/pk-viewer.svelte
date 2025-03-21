<script lang="ts">
	import { getPokemonSpriteData, setCssPosition } from '$lib/spriteheet-helper'
	import { pkState } from '$lib/state/pk-state.svelte'
	import PkToggle from '$lib/components/ui/pk-toggle.svelte'

	let { identifier, disabled }: { identifier: string; disabled: boolean } = $props()
	let selectedPokemonSpriteData = $derived(getPokemonSpriteData(identifier))
</script>

<section class="pk-viewer">
	<img
		src={selectedPokemonSpriteData.sheet + '.webp'}
		alt={identifier}
		style={setCssPosition(selectedPokemonSpriteData.pos)}
	/>
	<div class="pk-viewer-controls">
		<PkToggle
			icon="✨"
			label="Shiny"
			checked={pkState.getPokemonState(identifier).shiny}
			{disabled}
			onChange={() => pkState.toggleShiny(identifier)}
		/>
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
		background-color: #56565655;
		position: absolute;
		top: 16px;
		right: 16px;
	}
</style>
