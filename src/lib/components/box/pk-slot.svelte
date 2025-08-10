<script lang="ts">
	import { getIdentifier, getPokemonSpriteData, setCssPosition } from '$lib/spriteheet-helper'
	import { appState } from '$lib/state/app-state.svelte'
	import { pkState } from '$lib/state/pk-state.svelte'
	import PkBadge from './pk-badge.svelte'

	let { pokemonIdentifier }: { pokemonIdentifier: string } = $props()

	let selectedPokemonSpriteData = $derived(getPokemonSpriteData(pokemonIdentifier))

	let viewerMode = $derived(appState.isViewerModeEnabled())

	let pokemonState = $derived(pkState.getPokemon(pokemonIdentifier))
	let badgeDisplay = $derived(appState.getAppSettings().badgeDisplay)

	let isSelected = $derived(
		pokemonIdentifier === getIdentifier(pkState.getSelectedPokemon().idEntry)
	)

	function onclick() {
		if (viewerMode) {
			pkState.updateSelectedPokemon(pokemonIdentifier)
		} else {
			pkState.updatePokemon(pokemonIdentifier, { captured: true })
			pkState.updateSelectedPokemon(pokemonIdentifier)
		}
	}

	function capitalizeFirstLetter(val: string) {
		return (String(val).charAt(0).toUpperCase() + String(val).slice(1)).trim()
	}

	function formatPokemonDisplayName(pokemonIdentifier: any) {
		// remove the national id part and replace dashes with spaces
		// e.g. "Dudunsparce three segment"
		const parts = pokemonIdentifier.split('-')
		const name = parts.slice(1).join(' ')
		return capitalizeFirstLetter(name)
	}
</script>

<button
	class="pk-slot {pokemonState.shiny ? 'pk-shiny-slot' : ''} {isSelected
		? 'selected'
		: ''} pk-tooltip"
	{onclick}
	style="--grayscale: {pokemonState.captured ? '100%' : '0%'}"
	data-tooltip={formatPokemonDisplayName(pokemonIdentifier)}
>
	{#if isSelected}
		<div class="pk-slot-cursor"></div>
	{/if}
	<img
		class="pk-slot-image"
		src={`/spritesheets/${pokemonState.shiny ? 'shiny-pokemon' : 'pokemon'}/${selectedPokemonSpriteData.sheet}.webp`}
		alt={pokemonIdentifier}
		style={setCssPosition(selectedPokemonSpriteData.pos)}
		loading="lazy"
	/>
	{#if pokemonState.captured && badgeDisplay !== false}
		<PkBadge {pokemonState} {badgeDisplay} />
	{/if}
</button>

<style>
	.pk-slot {
		--target-size: 64;
		--original-size: 96;
		--scale-factor: calc(var(--target-size) / var(--original-size));

		width: calc(var(--target-size) * 1px);
		height: calc(var(--target-size) * 1px);
		cursor: pointer;

		display: flex;
		align-items: center;
		justify-content: center;

		position: relative;
		overflow: visible;

		border: none;
		background-color: transparent;
		outline: 2px solid hsl(0, 0%, 40%, 0.2);
		outline-offset: -2px;
		border-radius: 5px;
		user-select: none;

		&:hover {
			z-index: 2;
			box-shadow: 0 4px 4px rgba(0, 0, 0, 0.2);
			background-color: hsla(0, 0%, 80%, 0.25);

			.pk-slot-image {
				filter: brightness(var(--grayscale)) saturate(1.2) brightness(1.2);
			}
		}

		&:active {
			filter: brightness(0.9);
			box-shadow: inset 0 0 8px rgba(0, 0, 0, 0.5);
		}

		&:focus-visible {
			outline: 2px solid hsl(220, 100%, 65%);
			box-shadow: 2px 2px 6px hsl(220, 100%, 70%);
			background-color: hsla(220, 100%, 85%, 0.25);
		}

		img.pk-slot-image {
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%) scale(var(--scale-factor));
			width: calc(var(--original-size) * 1px);
			height: calc(var(--original-size) * 1px);
			object-fit: none;

			image-rendering: auto;
			filter: brightness(var(--grayscale));
		}
	}

	/* CSS für den Slot */
	.pk-slot.selected {
		outline: 2px solid hsl(120, 100%, 50%);
		box-shadow: 2px 2px 6px hsl(120, 100%, 40%);
		background-color: rgb(255, 255, 255, 0.25);
		position: relative;
		overflow: visible;
	}

	/* CSS für die Hand (als separates Element) */
	.pk-slot-cursor {
		position: absolute;
		width: 38px;
		height: 38px;
		top: -24px;
		left: 19px; /* Zentriert auf 64px breitem Button: (64-38)/2 + 30% */
		background-image: url('/ui/hand-cursor.webp');
		background-size: 38px 38px;
		background-repeat: no-repeat;
		background-position: center;
		z-index: 5;
		pointer-events: none;
		isolation: isolate;
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
		.pk-slot-cursor {
			left: 16px; /* Zentriert auf 58px breitem Button: (58-38)/2 + 30% */
		}
	}

	@media (max-width: 680px) {
		.pk-slot {
			--target-size: 64;
		}
		.pk-slot-cursor {
			left: 16px; /* Zentriert auf 64px breitem Button: (64-38)/2 + 30% */
		}
	}

	@media (max-width: 440px) {
		.pk-slot {
			--target-size: 58;
		}
		.pk-slot-cursor {
			left: 16px; /* Zentriert auf 58px breitem Button: (58-38)/2 + 30% */
		}
	}

	@media (max-width: 400px) {
		.pk-slot {
			--target-size: 54;
		}
		.pk-slot-cursor {
			left: 14px; /* Zentriert auf 54px breitem Button: (54-38)/2 + 30% */
		}
	}
</style>
