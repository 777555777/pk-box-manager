<script lang="ts">
	import PkViewer from '$lib/components/sidebar/pk-viewer.svelte'
	import PkForm from '$lib/components/sidebar/pk-form.svelte'
	import PkTitle from '$lib/components/sidebar/pk-title.svelte'
	import PkBallSelector from '$lib/components/ui/pk-ball-selector.svelte'
	import PkStats from '$lib/components/sidebar/pk-stats.svelte'
	import PkToggle from '$lib/components/ui/pk-toggle.svelte'
	import PkResetBtn from '$lib/components/ui/pk-reset-btn.svelte'
	import { pkState } from '$lib/state/pk-state.svelte'
	import { appState } from '$lib/state/app-state.svelte'
	import { getIdentifier } from '$lib/spriteheet-helper'
	import type { BallsType } from '$lib/models/balls-models'

	// Create a reactive state variable
	let selectedPokemon = $state(pkState.getSelectedPokemon())
	let identifier = $derived(getIdentifier(selectedPokemon.idEntry))

	let isSelectionValid = $derived(identifier === '0000-null')
	let viewerMode = $derived(appState.getViewerMode())
	let disabled = $derived(isSelectionValid || viewerMode)

	// === Ball Selector ===
	function handleBallChange(newValue: BallsType) {
		pkState.updatePokemon(identifier, { ball: newValue })
	}

	// Update it whenever the state manager's selection changes
	$effect(() => {
		selectedPokemon = pkState.getSelectedPokemon()
		$inspect('Sidebar:', selectedPokemon)
	})
</script>

<aside class="pk-sidebar">
	<section>
		<PkViewer {identifier} isShiny={selectedPokemon.shiny} />
		<div class="pk-viewer-controls">
			<PkResetBtn {identifier} {disabled} />
			<PkToggle
				icon="✨"
				label="Shiny"
				checked={pkState.getPokemon(identifier).shiny}
				{disabled}
				onChange={() => pkState.updatePokemon(identifier, { shiny: !selectedPokemon.shiny })}
			/>
		</div>
	</section>
	<section class="pk-title">
		<PkBallSelector selectedBall={selectedPokemon.ball} {disabled} onChange={handleBallChange} />
		<PkTitle idEntry={selectedPokemon.idEntry} {identifier} />
	</section>
	<hr />
	<section>
		<PkForm {selectedPokemon} {identifier} {disabled} />
	</section>
	<hr />
	<section>
		<PkStats {identifier} />
	</section>

	<!-- <pre>{JSON.stringify(selectedPokemon, null, 2)}</pre> -->
</aside>

<style>
	.pk-viewer-controls {
		display: flex;
		justify-content: space-between;
		width: 348px;
		position: absolute;
		top: 1.5rem;
		left: 1.5rem;
	}

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
