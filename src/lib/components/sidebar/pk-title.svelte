<script lang="ts">
	import type { PokemonState } from '$lib/state/storage-handler'

	let { selectedPokemon }: { selectedPokemon: PokemonState } = $props()

	function getDisplayname(entry: any) {
		return `${entry.id_national} | ${entry.pokemonid} ${entry.formid ? entry.formid : ''}`
	}
</script>

<h3>{getDisplayname(selectedPokemon.idEntry)}</h3>
<span class="pk-gender">♂️</span>

<style>
	.pk-gender {
		display: inline-block;
		font-size: 1.5rem;
	}
</style>
