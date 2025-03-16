<script lang="ts">
	import PkViewer from '$lib/components/sidebar/pk-viewer.svelte'
	import PkForm from '$lib/components/sidebar/pk-form.svelte'
	import PkTitle from '$lib/components/sidebar/pk-title.svelte'
	import PkBallSelector from '$lib/components/sidebar/pk-ball-selector.svelte'
	import { pokemonStateManager } from '$lib/state/state-manager.svelte'
	import { appState } from '$lib/state/app-state.svelte'
	import { getIdentifier } from '$lib/spriteheet-helper'

	// Create a reactive state variable
	let selectedPokemon = $state(pokemonStateManager.getSelectedPokemon())
	let identifier = $derived(getIdentifier(selectedPokemon.idEntry))

	let isSelectionValid = $derived(identifier === '0000-null')
	let viewerMode = $derived(appState.getViewerMode())

	function resetPokemon() {
		pokemonStateManager.resetPokemonState(getIdentifier(selectedPokemon.idEntry))
		pokemonStateManager.deselectPokemon()
	}

	function handleKeydown(event: KeyboardEvent) {
		if (!viewerMode && event.code === 'KeyQ') {
			// Vermeide Auslösung, wenn ein Eingabefeld fokussiert ist
			if (
				document.activeElement?.tagName !== 'INPUT' &&
				document.activeElement?.tagName !== 'TEXTAREA'
			) {
				resetPokemon()
			}
		}
	}

	// Update it whenever the state manager's selection changes
	$effect(() => {
		selectedPokemon = pokemonStateManager.getSelectedPokemon()
		$inspect('Sidebar:', selectedPokemon)

		// Event Listener hinzufügen
		document.addEventListener('keydown', handleKeydown)

		// Teardown-Funktion zurückgeben, die aufgerufen wird:
		// a) unmittelbar bevor der Effekt erneut ausgeführt wird
		// b) wenn die Komponente zerstört wird
		return () => {
			document.removeEventListener('keydown', handleKeydown)
		}
	})
</script>

<aside class="pk-sidebar">
	<section>
		<PkViewer {selectedPokemon} {viewerMode} />
	</section>
	<section class="pk-title">
		<PkBallSelector {selectedPokemon} {viewerMode} />
		<PkTitle {selectedPokemon} />
	</section>
	<hr />
	<section>
		<PkForm {selectedPokemon} {viewerMode} />
	</section>
	<pre>{JSON.stringify(selectedPokemon, null, 2)}</pre>
	<button onclick={resetPokemon} disabled={isSelectionValid || viewerMode}>Reset Pokemon (Q)</button
	>
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
