<script lang="ts">
	import type { PokemonEntry } from '$lib/models/data-models'

	let { pokemonEntry }: { pokemonEntry: PokemonEntry } = $props()

	function getDisplayname(entry: any) {
		console.log(entry)
		return `${entry.id_national} | ${entry.pokemonid} ${entry.formid ? entry.formid : ''}`
	}
</script>

<h3>{getDisplayname(pokemonEntry)}</h3>
<span class="pk-gender">♂️</span>

<style>
	.pk-gender {
		display: inline-block;
		font-size: 1.5rem;
	}
</style>
