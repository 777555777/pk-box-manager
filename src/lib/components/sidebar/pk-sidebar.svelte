<script lang="ts">
	import PkViewer from '$lib/components/sidebar/pk-viewer.svelte'
	import PkForm from '$lib/components/sidebar/pk-form.svelte'
	import PkTitle from '$lib/components/sidebar/pk-title.svelte'
	import PkBallSelector from '$lib/components/sidebar/pk-ball-selector.svelte'
	import { pokemonStateManager } from '$lib/state/state-manager.svelte'
	import { appState } from '$lib/state/app-state.svelte'

	// Create a reactive state variable
	let selectedPokemon = $state(pokemonStateManager.getSelectedPokemon())
	let sidebarEditMode = $derived(appState.getSidebarEditMode())

	// Update it whenever the state manager's selection changes
	$effect(() => {
		selectedPokemon = pokemonStateManager.getSelectedPokemon()
		$inspect('test: ', selectedPokemon)
	})
</script>

<aside class="pk-sidebar">
	<section>
		<PkViewer {selectedPokemon} {sidebarEditMode} />
	</section>
	<section class="pk-title">
		<PkBallSelector {selectedPokemon} {sidebarEditMode} />
		<PkTitle {selectedPokemon} />
	</section>
	<hr />
	<section>
		<PkForm {selectedPokemon} {sidebarEditMode} />
	</section>
	<pre>{JSON.stringify(selectedPokemon, null, 2)}</pre>
</aside>

<style>
	section {
		padding: 10px;
	}
	.pk-sidebar {
		/* width: 520px; */
		/* height: 900px; */

		/* concept placeholder */
		background-color: #cdffd7;
		border: 2px solid #7cff80;
		border-radius: 10px;
		padding: 10px;

		position: relative;
	}
	.pk-title {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
</style>
