<script lang="ts">
	import PkViewer from '$lib/components/sidebar/pk-viewer.svelte'
	import PkForm from '$lib/components/sidebar/pk-form.svelte'
	import PkTitle from '$lib/components/sidebar/pk-title.svelte'
	import PkBallSelector from '$lib/components/ui/pk-ball-selector.svelte'
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
		pkState.updatePokemonState(identifier, { ball: newValue })
	}

	function resetPokemon() {
		pkState.resetPokemonState(getIdentifier(selectedPokemon.idEntry))
		pkState.deselectPokemon()
	}

	function handleKeydown(event: KeyboardEvent) {
		if (viewerMode || event.code !== 'KeyQ') {
			return
		}

		const activeElement = document.activeElement
		const isInToolbox = !!activeElement?.closest('.pk-toolbox')
		const isInputOrTextarea =
			activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA'

		// Wenn das aktive Element kein Input/Textarea ist oder sich in der Toolbox befindet
		if (!isInputOrTextarea || isInToolbox) {
			resetPokemon()
		}
	}

	// Update it whenever the state manager's selection changes
	$effect(() => {
		selectedPokemon = pkState.getSelectedPokemon()
		$inspect('Sidebar:', selectedPokemon)

		document.addEventListener('keydown', handleKeydown)

		return () => {
			document.removeEventListener('keydown', handleKeydown)
		}
	})
</script>

<aside class="pk-sidebar">
	<section>
		<PkViewer {identifier} {disabled} isShiny={selectedPokemon.shiny} />
	</section>
	<section class="pk-title">
		<PkBallSelector selectedBall={selectedPokemon.ball} {disabled} onChange={handleBallChange} />
		<PkTitle idEntry={selectedPokemon.idEntry} {identifier} />
	</section>
	<hr />
	<section>
		<PkForm {selectedPokemon} {identifier} {disabled} />
	</section>
	<pre>{JSON.stringify(selectedPokemon, null, 2)}</pre>
	<button onclick={resetPokemon} {disabled}>Reset Pokemon (Q)</button>
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
