<script lang="ts">
	import { type PokemonEntry } from '$lib/models/data-models'

	let { pokemon }: { pokemon: PokemonEntry } = $props()
	const identifier = `${pokemon.id_national} ${pokemon.pokemonid}${pokemon.formid ? '-' + pokemon.formid : ''}`
</script>

<div class="pk-slot">
	<img src="" alt={identifier} />
</div>

<style>
	.pk-slot {
		width: 48px;
		height: 48px;
		cursor: pointer;

		/* concept placeholder */
		background-color: hsl(60, 100%, 90%);
		border: 2px solid hsl(50, 70%, 50%);
		border-radius: 5px;
	}
</style>
