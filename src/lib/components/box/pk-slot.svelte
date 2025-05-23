<script lang="ts">
	import { Balls, type BallsType } from '$lib/models/balls-models'
	import { type PokemonEntry } from '$lib/models/data-models'
	import { getIdentifier, getPokemonSpriteData, setCssPosition } from '$lib/spriteheet-helper'
	import { appState } from '$lib/state/app-state.svelte'
	import { pkState } from '$lib/state/pk-state.svelte'

	let { pokemonEntry }: { pokemonEntry: PokemonEntry } = $props()
	const identifier = getIdentifier(pokemonEntry)
	const selectedPokemonSpriteData = getPokemonSpriteData(identifier)

	let viewerMode = $derived(appState.isViewerModeEnabled())

	let pokemonState = $derived(pkState.getPokemon(identifier))

	let isSelected = $derived(identifier === getIdentifier(pkState.getSelectedPokemon().idEntry))

	let badgeDisplay = $derived(appState.getBadgeDisplayMode())

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
	.pk-badge {
		--target-size: 24;
		--original-size: 30;
		--scale-factor: calc(var(--target-size) / var(--original-size));

		width: calc(var(--original-size) * 1px);
		height: calc(var(--original-size) * 1px);
		object-fit: none;
		transform: scale(var(--scale-factor));
		transform-origin: top left;

		filter: brightness(var(--grayscale));

		position: absolute;
		inset: 0;
		top: 38px;
		left: 38px;
	}

	.pk-slot {
		--target-size: 64;
		--original-size: 96;
		--scale-factor: calc(var(--target-size) / var(--original-size));

		width: calc(var(--target-size) * 1px);
		height: calc(var(--target-size) * 1px);
		cursor: pointer;

		position: relative;
		overflow: hidden;

		border: none;
		background-color: transparent;
		outline: 2px solid hsl(0, 0%, 40%, 0.2);
		outline-offset: -2px;
		border-radius: 5px;

		&:hover {
			/* transform: scale(1.05); */
			box-shadow: 0 4px 4px rgba(0, 0, 0, 0.2);
			filter: saturate(1.2) brightness(1.2);
			background-color: hsla(0, 0%, 80%, 0.25);
		}

		&:active {
			transform: scale(0.95);
			filter: brightness(0.9);
			box-shadow: inset 0 0 4px rgba(0, 0, 0, 0.3);
		}

		&:focus-visible {
			outline: 2px solid hsl(220, 100%, 65%);
			box-shadow: 2px 2px 6px hsl(220, 100%, 70%);
			background-color: hsla(220, 100%, 85%, 0.25);
		}

		.pk-slot-image {
			width: calc(var(--original-size) * 1px);
			height: calc(var(--original-size) * 1px);
			object-fit: none;
			transform: scale(var(--scale-factor));
			transform-origin: top left;

			image-rendering: auto;
			filter: brightness(var(--grayscale));
		}
	}

	.pk-slot.selected {
		outline: 2px solid hsl(120, 100%, 50%); /* Idea: use different color vor view mode */
		box-shadow: 2px 2px 6px hsl(120, 100%, 40%);
		background-color: rgb(255, 255, 255, 0.25);
		position: relative;
		overflow: visible; /* make hand pointer visible outside of slot */

		/* Cursour ponting hand */
		&::before {
			content: '';
			position: absolute;
			width: 38px;
			height: 38px;

			/* Position: oberhalb und leicht links */
			top: -20px;
			left: 50%;
			transform: translateX(-50%);

			background-image: url('/boxes/hand-cursor.webp');
			background-repeat: no-repeat;
			background-size: contain;
			background-position: center;

			z-index: 3;
			pointer-events: none;

			/* animation: wiggle 0.5s infinite ease-in-out; */
		}
	}

	@keyframes wiggle {
		0%,
		100% {
			transform: translate3d(-50%, 0, 0) rotate(-5deg);
		}
		50% {
			transform: translate3d(-50%, 0, 0) rotate(5deg);
		}
	}

	.pk-shiny-slot {
		background-color: oklch(60 0.18 90 / 0.35);
		img {
			filter: drop-shadow(0 0 5px hsl(55, 100%, 85%));
		}
	}

	@media (max-width: 1500px) {
		.pk-slot {
			--target-size: 58;
		}
		.pk-badge {
			--target-size: 20;
			top: 36px;
			left: 36px;
		}
	}
</style>
