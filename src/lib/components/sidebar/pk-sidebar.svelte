<script lang="ts">
	import PkViewer from '$lib/components/sidebar/pk-viewer.svelte'
	import PkForm from '$lib/components/sidebar/pk-form.svelte'
	import PkTitle from '$lib/components/sidebar/pk-title.svelte'
	import PkBallSelector from '$lib/components/ui/pk-ball-selector.svelte'
	import PkStats from '$lib/components/sidebar/pk-stats.svelte'
	import PkToggle from '$lib/components/ui/pk-toggle.svelte'
	import PkResetBtn from '$lib/components/ui/pk-reset-btn.svelte'
	import PkLinks from '$lib/components/sidebar/pk-links.svelte'
	import { pkState } from '$lib/state/pk-state.svelte'
	import { appState } from '$lib/state/app-state.svelte'
	import { getIdentifier } from '$lib/spriteheet-helper'
	import type { BallsType } from '$lib/models/balls-models'

	let selectedPokemon = $derived(pkState.getSelectedPokemon())
	let identifier = $derived(getIdentifier(selectedPokemon.idEntry))

	let isSelectionValid = $derived(identifier === '0000-null')
	let viewerMode = $derived(appState.isViewerModeEnabled())
	let disabled = $derived(isSelectionValid || viewerMode)

	// === Ball Selector ===
	function updatePokeball(newValue: BallsType) {
		pkState.updatePokemon(identifier, { ball: newValue })
	}

	// === Shiny Toggle ===
	function toggleShiny() {
		pkState.updatePokemon(identifier, { shiny: !selectedPokemon.shiny })
	}

	$inspect('Update from Sidebar:', selectedPokemon)
</script>

<aside class="pk-sidebar pk-ui-section">
	<h2 class="sr-only">Pokemon details sidebar</h2>
	<section>
		<h3 class="sr-only">Pokémon Viewer</h3>
		<PkViewer {identifier} shiny={selectedPokemon.shiny} />
		<div class="pk-viewer-controls">
			<PkResetBtn {identifier} {disabled} />
			<PkToggle
				icon="pen.svg"
				label="Shiny"
				hideLabel={true}
				onUpdate={toggleShiny}
				checked={selectedPokemon.shiny}
				{disabled}
			/>
		</div>
	</section>
	<section>
		<h3 class="sr-only">Name & Ball</h3>
		<div class="pk-title-section">
			<PkBallSelector onUpdate={updatePokeball} selectedBall={selectedPokemon.ball} {disabled} />
			<PkTitle idEntry={selectedPokemon.idEntry} {isSelectionValid} />
		</div>
	</section>
	<div class="separator"></div>
	<section>
		<h3 class="sr-only">Catch data</h3>
		<PkForm {selectedPokemon} {identifier} {disabled} {isSelectionValid} />
	</section>
	<div class="separator"></div>
	<section>
		<h3 class="sr-only">Status values</h3>
		<PkStats {identifier} />
	</section>
	<div class="separator"></div>
	<section class="pk-links-section">
		<h3 class="visible-h3">Catch location</h3>
		<PkLinks idEntry={selectedPokemon.idEntry} />
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
		padding: 0.5rem;
	}

	.pk-title-section {
		display: flex;
		justify-content: space-between;
		align-items: center;
		text-align: center;
	}

	.separator {
		height: 2px;
		background-color: rgba(0, 0, 0, 0.3);
		margin: 1rem 0;
	}
	.pk-sidebar {
		padding: 10px;
		min-width: 408px;
		position: sticky;
		top: calc(7.5rem + 15px); /* toolbox uses translation -15px */
		color: #fff;
	}

	.visible-h3 {
		font-size: 1rem;
		text-align: center;
	}

	.pk-links-section {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
</style>
