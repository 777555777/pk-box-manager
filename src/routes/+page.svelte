<script lang="ts">
	import PkBoxContainer from '$lib/components/box/pk-box-container.svelte'
	import PkSidebar from '$lib/components/sidebar/pk-sidebar.svelte'
	import { selectedPokemon } from '$lib/state/data.svelte'
</script>

<main>
	<PkBoxContainer />
	<PkSidebar selectedPokemon={selectedPokemon.entry} />
</main>

<style>
	main {
		display: flex;
		justify-content: center;
		gap: 2rem;

		margin: 0 4rem;
		position: relative;
	}
</style>
