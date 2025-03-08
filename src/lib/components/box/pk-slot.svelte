<script lang="ts">
	import { Balls, type BallsType } from '$lib/models/balls-models'
	import { type PokemonEntry } from '$lib/models/data-models'
	import { getIdentifier, getPokemon, setCssPosition } from '$lib/spriteheet-helper'
	import { appState } from '$lib/state/app-state.svelte'
	import { pokemonStateManager } from '$lib/state/state-manager.svelte'

	let { pokemonEntry }: { pokemonEntry: PokemonEntry } = $props()
	const identifier = getIdentifier(pokemonEntry)
	const currentPokemon = getPokemon(identifier)

	let sidebarEditMode = $derived(appState.getSidebarEditMode())

	let pokemonState = $derived(pokemonStateManager.getPokemonState(identifier))

	let isSelected = $derived(
		identifier === getIdentifier(pokemonStateManager.getSelectedPokemon().idEntry)
	)

	let badgeDisplay = $derived(appState.getBadgeDisplay())

	// let pokeball = $derived(pokemonStateManager.getSelectedPokemon().ball)
	// let isShiny = $derived(pokemonStateManager.getSelectedPokemon().shiny)

	// get the selected pokemon
	// get its shiny status and its pokeball

	// display the selected pokeball based on appstate
	// use if in the template to render if appstate is correct

	function onclick() {
		if (sidebarEditMode) {
			// Im Detail-Edit-Modus: Nur Auswahl, keine Statusänderung
			pokemonStateManager.setSelectedPokemon(identifier)
		} else {
			// Im Quick-Edit-Modus: Toggled den Fang-Status direkt und selektiert das Pokémon
			pokemonStateManager.toggleCaptured(identifier)
			pokemonStateManager.setSelectedPokemon(identifier)
		}
	}

	function getBallPosition(selectedBall: BallsType) {
		return Balls[selectedBall].pos || { x: 0, y: 0 }
	}
</script>

<button
	class="pk-slot {isSelected ? 'selected' : ''}"
	{onclick}
	style="--grayscale: {pokemonState.captured ? '100%' : '0%'}"
>
	<img
		class="pk-slot-image"
		src={currentPokemon.sheet + '.webp'}
		alt={identifier}
		style={setCssPosition(currentPokemon.pos)}
		loading="lazy"
	/>
	{#if pokemonState.captured && badgeDisplay === 'ball' && pokemonState.ball}
		<img
			class="pk-badge"
			src="/spritesheets/spritesheet-balls-1.webp"
			style={setCssPosition(getBallPosition(pokemonState.ball as BallsType))}
			alt={pokemonState.ball}
		/>
	{/if}
	{#if pokemonState.captured && badgeDisplay === 'shiny' && pokemonState.shiny}
		<div class="pk-badge">✨</div>
	{/if}
</button>

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

		/* concept placeholder */
		background-color: hsl(60, 100%, 90%);
		/* border: 2px solid hsl(50, 70%, 50%); */
		border-radius: 5px;
	}

	.pk-slot.selected {
		background-color: hsl(120, 100%, 85%);
		transition: all 0.2s ease-in-out;
	}
</style>
