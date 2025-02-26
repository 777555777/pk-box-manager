<script lang="ts">
	import PkViewer from '$lib/components/sidebar/pk-viewer.svelte'
	import PkBallSelectorSprite from '$lib/components/sidebar/pk-ball-selector.svelte'
	import PkForm from '$lib/components/sidebar/pk-form.svelte'
	import PkTitle from '$lib/components/sidebar/pk-title.svelte'
	import { type BallsType } from '$lib/models/balls-models'
	import { type PokemonUserInfo } from '$lib/models/data-models'

	const dummyUserEditedData: PokemonUserInfo = {
		captured: false, // for viwer component
		ball: '35-lastrange-ball', // for ball selector component
		shiny: false, // for viewer component
		caughtIn: 'Red', // for form component
		ability: 'chlorophyll', // for form component
		comment: 'only as starter or by breeding. catchable in any ball available in lets go' // for form component
	}
	let { selectedPokemon } = $props()

	$inspect(selectedPokemon)
	let userEditedData = $state(dummyUserEditedData)

	$effect(() => {
		// call save to disc here
	})
</script>

<aside class="pk-sidebar">
	<section>
		<PkViewer pokemonEntry={selectedPokemon} bind:userEditedData />
	</section>
	<section class="pk-title">
		<PkBallSelectorSprite bind:selectedBall={userEditedData.ball as BallsType} />
		<PkTitle pokemonEntry={selectedPokemon} />
	</section>
	<hr />
	<section>
		<PkForm bind:userEditedData />
	</section>
	<div class="pk-save-indicator">saving...</div>
	<pre>{JSON.stringify(userEditedData, null, 2)}</pre>
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
