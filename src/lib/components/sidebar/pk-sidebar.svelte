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
	import type { GameType } from '$lib/models/data-models'
	import PkRibbonPicker from './pk-ribbon-picker.svelte'
	import PkMarkPicker from './pk-mark-picker.svelte'
	import PkRadioGroup from '../ui/pk-radio-group.svelte'

	let selectedPokemon = $derived(pkState.getSelectedPokemon())
	let identifier = $derived(getIdentifier(selectedPokemon.idEntry))

	let isSelectionValid = $derived(identifier === '0000-null')
	let viewerMode = $derived(appState.isViewerModeEnabled())
	let disabled = $derived(isSelectionValid || viewerMode)

	let currentOption = $state('stats')
	const optionConfig = [
		{ tabId: 'stats', label: 'Stats' },
		{ tabId: 'ribbons', label: 'Ribbons' },
		{ tabId: 'marks', label: 'Marks' }
	]

	// === Ball Selector ===
	function updatePokeball(newValue: BallsType) {
		pkState.updatePokemon(identifier, { ball: newValue })
	}

	// === Shiny Toggle ===
	function toggleShiny() {
		pkState.updatePokemon(identifier, { shiny: !selectedPokemon.shiny })
	}

	// === Game Dropdown ===
	function updateCaughtIn(newValue: GameType) {
		pkState.updatePokemon(identifier, {
			caughtIn: newValue
		})
	}

	// === Comment Textarea ===
	function updateComment(newValue: string) {
		pkState.updatePokemon(identifier, {
			comment: newValue
		})
	}

	// === Ribbon/Mark Picker ===
	function updateRibbons(ribbonId: string) {
		pkState.toggleRibbon(identifier, ribbonId)
	}

	function updateMarks(markId: string) {
		pkState.toggleMark(identifier, markId)
	}

	$inspect('Update from Sidebar:', selectedPokemon)
</script>

<aside class="pk-sidebar pk-ui-section">
	<h2 class="sr-only">Pokemon details sidebar</h2>
	<section class="pk-viewer-section">
		<h3 class="sr-only">Pokémon Viewer</h3>
		<PkViewer {identifier} shiny={selectedPokemon.shiny} />
		<div class="pk-viewer-controls">
			<PkResetBtn {identifier} {disabled} />
			<PkToggle
				icon="/ui/sparkles-solid.svg"
				activeColor="hsla(125, 100%, 30%, 0.55)"
				label="Shiny"
				hideLabel={true}
				onUpdate={toggleShiny}
				checked={selectedPokemon.shiny}
				{disabled}
			/>
		</div>
	</section>
	<div class="pk-viewer-seperator"></div>
	<section class="pk-ui-section-inner pk-sidebar-content">
		<section class="pk-title-section">
			<h3 class="sr-only">Name & Ball</h3>
			<div class="pk-title-row">
				<PkBallSelector
					onUpdate={updatePokeball}
					selectedBall={selectedPokemon.ball as BallsType}
					{disabled}
				/>
				<PkTitle idEntry={selectedPokemon.idEntry} {isSelectionValid} />
			</div>
		</section>
		<div class="separator"></div>
		<section class="pk-form-section">
			<h3 class="sr-only">Catch data</h3>
			<PkForm {selectedPokemon} {disabled} {isSelectionValid} {updateCaughtIn} {updateComment} />
		</section>
		<div class="separator"></div>
		<div class="pk-tab-group">
			<PkRadioGroup bind:currentOption {optionConfig} />
		</div>
		{#if currentOption === 'stats'}
			<section class="pk-stats-section">
				<h3 class="sr-only">Status values</h3>
				<PkStats {identifier} />
			</section>
		{:else if currentOption === 'ribbons'}
			<section class="pk-stats-section">
				<h3 class="sr-only">Ribbons</h3>
				<PkRibbonPicker
					{disabled}
					onUpdate={updateRibbons}
					selectedRibbons={selectedPokemon.ribbons}
				/>
			</section>
		{:else if currentOption === 'marks'}
			<section class="pk-stats-section">
				<h3 class="sr-only">Marks</h3>
				<PkMarkPicker {disabled} onUpdate={updateMarks} selectedMarks={selectedPokemon.marks} />
			</section>
		{/if}
		<div class="separator"></div>
		<section class="pk-links-section">
			<h3 class="visible-h3 text-base">Catch location</h3>
			<PkLinks idEntry={selectedPokemon.idEntry} />
		</section>
		<!-- <pre>{JSON.stringify(selectedPokemon, null, 2)}</pre> -->
	</section>
</aside>

<style>
	.pk-sidebar {
		min-width: var(--box-width);
		max-width: 415px;
		max-height: fit-content;
		position: sticky;
		z-index: 2;
		margin: auto 0;
		color: var(--ui-text-color);

		.pk-sidebar-content {
			display: flex;
			flex-direction: column;
			height: 100%;
			overflow-y: auto;

			.pk-tab-group {
				margin: 0 auto;
			}
		}
	}

	.pk-viewer-seperator {
		--separator-overhang: 6px;

		height: 6px;
		width: calc(100% + var(--separator-overhang));
		margin-left: calc(var(--separator-overhang) / 2 * -1);
		background-color: #717186;
		box-sizing: content-box;
		border-block: 3px solid #595969;

		position: relative;
		z-index: 1;

		&::before,
		&::after {
			content: '';
			position: absolute;
			left: 0;
			width: 100%;
			height: 3px;
		}

		&::before {
			top: 9px;
			background-color: #557d8b;
		}

		&::after {
			bottom: 9px;
			background-color: #2e99d1;
		}
	}

	.pk-title-section,
	.pk-form-section,
	.pk-stats-section,
	.pk-links-section {
		padding-inline: 1rem;
	}

	.pk-stats-section {
		min-height: 350px;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	.pk-title-section {
		padding-top: 0.5rem;
	}

	.pk-links-section {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding-bottom: 0.5rem;
	}

	.pk-viewer-section {
		position: relative;

		.pk-viewer-controls {
			display: flex;
			justify-content: space-between;
			position: absolute;
			z-index: 2;
			width: 100%;
			top: 0;
			padding: 0.5rem;
		}
	}

	.pk-title-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		text-align: center;
		min-height: 54px;
	}

	.visible-h3 {
		text-align: center;
	}

	@media (max-height: 1200px) {
		.pk-links-section {
			padding-bottom: 0.25rem;
		}
		.pk-title-section {
			padding-top: 0.25rem;
		}
	}
</style>
