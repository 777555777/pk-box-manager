<script lang="ts">
	import PkViewer from '$lib/components/sidebar/pk-viewer.svelte'
	import PkTitle from '$lib/components/sidebar/pk-title.svelte'
	import { pokemonStateManager } from '$lib/state/state-manager.svelte'

	// Create a reactive state variable
	let selectedPokemon = $state(pokemonStateManager.getSelectedPokemon())

	// Update it whenever the state manager's selection changes
	$effect(() => {
		selectedPokemon = pokemonStateManager.getSelectedPokemon()
	})

	$inspect('test: ', selectedPokemon)
</script>

<aside class="pk-sidebar">
	<section>
		<PkViewer {selectedPokemon} />
	</section>
	<section class="pk-title">
		<!-- <PkBallSelectorSprite bind:selectedBall={userEditedData.ball as BallsType} /> -->
		<PkTitle {selectedPokemon} />
	</section>
	<hr />
	<section>
		<!-- <PkForm bind:userEditedData /> -->
	</section>
	<pre>{JSON.stringify(selectedPokemon, null, 2)}</pre>
</aside>

<style>
	section {
		padding: 10px;
	}
	.pk-sidebar {
		width: 520px;
		/* height: 900px; */

		position: sticky;
		top: 4rem; /* Abstand von oben */
		align-self: flex-start; /* Damit es oben beginnt */
		height: fit-content; /* Passt sich dem Inhalt an */

		/* concept placeholder */
		background-color: #cdffd7;
		border: 2px solid #7cff80;
		border-radius: 10px;
		padding: 10px;
	}
	.pk-title {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
</style>
