<script lang="ts">
	import type { PokemonEntry } from '$lib/models/data-models'

	let { idEntry }: { idEntry: PokemonEntry } = $props()
</script>

<h4>Catch location</h4>
<div class="pk-external-urls">
	<a
		href="https://bulbapedia.bulbagarden.net/wiki/{idEntry.pokemonid}_(Pok%C3%A9mon)#Game_locations"
		target="_blank">Bulbapedia (EN)</a
	>
	<a href="https://www.pokewiki.de/{idEntry.pokemonid}#Fundorte" target="_blank">Pokewiki (DE)</a>
	<a
		href="https://www.bisafans.de/pokedex/{idEntry.id_national
			.toString()
			.padStart(4, '0')}.php#fundorte"
		target="_blank">Bisafans (DE)</a
	>
</div>

<style>
	h4 {
		text-align: center;
	}
	.pk-external-urls {
		display: flex;
		justify-content: center;
		gap: 1rem;
	}
</style>
