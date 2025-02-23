<script lang="ts">
	import PkViewer from '$lib/components/sidebar/pk-viewer.svelte'
	import PkBallSelectorSprite from '$lib/components/sidebar/pk-ball-selector.svelte'
	import PkForm from '$lib/components/sidebar/pk-form.svelte'

	import { type BallsType } from '$lib/models/balls-models'

	const dummyData = { pokemonid: 'skarmory', formid: null, id_national: 227 }
	let selectedBall = $state<BallsType>('35-lastrange-ball')

	function getDisplayname(entry: any) {
		return `${entry.id_national} | ${entry.pokemonid} ${entry.formid ? entry.formid : ''}`
	}
</script>

<aside class="pk-sidebar">
	<section>
		<PkViewer />
	</section>
	<section class="pk-title">
		<PkBallSelectorSprite bind:selectedBall />
		<h3>{getDisplayname(dummyData)}</h3>
		<span class="pk-gender">♂️</span>
	</section>
	<hr />
	<section>
		<!-- pk-form-component -->
		<PkForm />
	</section>
</aside>

<style>
	section {
		padding: 10px;
	}
	.pk-sidebar {
		background-color: cadetblue;
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
	.pk-gender {
		display: inline-block;
		font-size: 1.5rem;
	}
</style>
