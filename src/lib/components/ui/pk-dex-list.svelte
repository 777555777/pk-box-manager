<script lang="ts">
	import { pkState } from '$lib/state/pk-state.svelte'
	import type { DexIndexEntry } from '$lib/state/storage-handler'

	let pokedexIndexList = $derived(pkState.getPokedexIndexList())
	$inspect('>>>>>>>>', pokedexIndexList)
	function loadSelectedDex(selectedDex: DexIndexEntry) {
		const targetDexSave = pkState.loadPokedex(selectedDex.id)
		pkState.switchPokedex(targetDexSave.config)
	}
</script>

<div class="container">
	<ul>
		{#each pokedexIndexList as dex}
			<li>
				<div>
					<p>{dex.displayName}</p>
					<p>ID: {dex.id}</p>
					<p>Pokemon: {dex.totalPokemon}</p>
					<p>Caught: {dex.totalCaughtPokemon}</p>
					<p>Shiny: {dex.totalShinyPokemon}</p>
					<button onclick={() => loadSelectedDex(dex)}>load</button>
				</div>
			</li>
		{/each}
	</ul>
</div>

<style>
	.container {
		background-color: cadetblue;
		padding: 1rem;
		border-radius: 0.5rem;
	}
</style>
