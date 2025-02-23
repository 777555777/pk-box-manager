<script lang="ts">
	import { type PokemonEntry } from '$lib/models/data-models'
	import { type PokemonType, Pokemon } from '$lib/models/pokemon-models'
	import { type FormsType, Forms } from '$lib/models/forms-models'

	interface SpriteData {
		sheet: string
		position: {
			x: number
			y: number
		}
	}

	type Coordinates = { x: number; y: number }

	const combinedPokemon: Record<string, SpriteData> = { ...Pokemon, ...Forms }

	// 0003-venusaur-female
	let { pokemonEntry }: { pokemonEntry: PokemonEntry } = $props()
	const identifier = getIdentifier(pokemonEntry)
	const currentPokemon = getPokemon(identifier)

	function getIdentifier(entry: PokemonEntry) {
		const paddedId = entry.id_national.toString().padStart(4, '0')
		return `${paddedId}-${entry.pokemonid}${entry.formid ? '-' + entry.formid : ''}`
	}

	function getPokemon(identifier: string): SpriteData {
		if (identifier in combinedPokemon) {
			return combinedPokemon[identifier]
		}
		// return null object Pokemon
		// displays as questionmark icon
		return combinedPokemon['0000-null']
	}

	function setCssPosition(position: Coordinates) {
		return `object-position: ${position.x}px ${position.y}px;`
	}
</script>

<div class="pk-slot">
	<img
		src={currentPokemon.sheet + '.webp'}
		alt={identifier}
		style={setCssPosition(currentPokemon.position)}
	/>
</div>

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
	}

	.pk-slot {
		width: var(--image-slot-size);
		height: var(--image-slot-size);
		cursor: pointer;

		padding: 0;
		/* display: flex;
		justify-content: center;
		align-items: center; */

		/* concept placeholder */
		background-color: hsl(60, 100%, 90%);
		/* border: 2px solid hsl(50, 70%, 50%); */
		border-radius: 5px;
	}
</style>
