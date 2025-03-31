<script lang="ts">
	import { Balls, type BallsType } from '$lib/models/balls-models'
	import { type PokemonEntry } from '$lib/models/data-models'
	import { getIdentifier, getPokemonSpriteData, setCssPosition } from '$lib/spriteheet-helper'
	import { appState } from '$lib/state/app-state.svelte'
	import { pkState } from '$lib/state/pk-state.svelte'

	let { pokemonEntry }: { pokemonEntry: PokemonEntry } = $props()
	const identifier = getIdentifier(pokemonEntry)
	const selectedPokemonSpriteData = getPokemonSpriteData(identifier)

	let viewerMode = $derived(appState.getViewerMode())

	let pokemonState = $derived(pkState.getPokemon(identifier))

	let isSelected = $derived(identifier === getIdentifier(pkState.getSelectedPokemon().idEntry))

	let badgeDisplay = $derived(appState.getBadgeDisplay())

	function onclick() {
		if (viewerMode) {
			pkState.updateSelectedPokemon(identifier)
		} else {
			pkState.updatePokemon(identifier, { captured: true })
			pkState.updateSelectedPokemon(identifier)
		}
	}

	function getBallPosition(selectedBall: BallsType) {
		return Balls[selectedBall].pos || { x: 0, y: 0 }
	}
</script>

<button
	class="pk-slot {pokemonState.shiny ? 'pk-shiny-slot' : ''} {isSelected ? 'selected' : ''}"
	{onclick}
	style="--grayscale: {pokemonState.captured ? '100%' : '0%'}"
>
	<img
		class="pk-slot-image"
		src={`/spritesheets/${pokemonState.shiny ? 'shiny-pokemon' : 'pokemon'}/${selectedPokemonSpriteData.sheet}.webp`}
		alt={identifier}
		style={setCssPosition(selectedPokemonSpriteData.pos)}
		loading="lazy"
	/>
	{@render badge()}
</button>

{#snippet badge()}
	{#if pokemonState.captured && badgeDisplay === 'ball' && pokemonState.ball}
		<img
			class="pk-badge"
			src={`/spritesheets/util/sb1.webp`}
			style={setCssPosition(getBallPosition(pokemonState.ball as BallsType))}
			alt={pokemonState.ball}
		/>
	{/if}
{/snippet}

<style>
	:root {
		--image-slot-size: 64px;
		--image-badge-size: 30px;
	}

	.pk-badge {
		/* image-rendering: pixelated; */
		object-fit: none;
		width: var(--image-badge-size);
		height: var(--image-badge-size);
		transform: scale(0.66666667);
		transform-origin: top left;

		filter: brightness(var(--grayscale));

		position: absolute;
		inset: 0;
		top: 38px;
		left: 38px;
	}

	.pk-slot-image {
		/* image-rendering: pixelated; */
		object-fit: none;
		width: 96px;
		height: 96px;
		transform: scale(0.666667); /* 74px */
		transform-origin: top left;

		filter: brightness(var(--grayscale));
	}

	.pk-slot {
		width: var(--image-slot-size);
		height: var(--image-slot-size);
		cursor: pointer;
		padding: 0;

		position: relative;
		overflow: hidden; /* Verhindert Überstand des Bildes */

		/* concept placeholder */
		background-color: hsl(60, 100%, 90%);
		/* border: 2px solid hsl(50, 70%, 50%); */
		border-radius: 5px;
	}

	.pk-shiny-slot {
		background-color: hsl(60, 100%, 75%);
	}

	.pk-slot.selected {
		background-color: hsl(120, 100%, 85%);
		transition: all 0.2s ease-in-out;
	}
</style>
