<script lang="ts">
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
</script>

<button
	class="pk-slot {isSelected ? 'selected' : ''}"
	{onclick}
	style="--grayscale: {pokemonState.captured ? '100%' : '0%'}"
>
	<img
		src={currentPokemon.sheet + '.webp'}
		alt={identifier}
		style={setCssPosition(currentPokemon.pos)}
		loading="lazy"
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

		filter: brightness(var(--grayscale));
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

	.pk-slot.selected {
		background-color: hsl(120, 100%, 85%);
		transition: all 0.2s ease-in-out;
	}
</style>
