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
	import PkOriginMark from './pk-origin-mark.svelte'
	import PkIcon from '../ui/pk-icon.svelte'

	let selectedPokemon = $derived(pkState.getSelectedPokemon())
	let identifier = $derived(getIdentifier(selectedPokemon.idEntry))

	let isSelectionValid = $derived(identifier === '0000-null')
	let viewerMode = $derived(appState.isViewerModeEnabled())
	let disabled = $derived(isSelectionValid || viewerMode)

	let isMobileSidebarOpen = $derived(appState.isMobileSidebarOpen())

	// === Details Elements State ===
	let currentExpanded = $derived(appState.getAppSettings().sidebarExpanded)

	function toggleDetailsSection(sectionId: 'catch' | 'ribbon' | 'mark' | 'stats') {
		const expandedSet = new Set(currentExpanded)

		if (expandedSet.has(sectionId)) {
			expandedSet.delete(sectionId)
		} else {
			expandedSet.add(sectionId)
		}

		appState.updateAppSettings({ sidebarExpanded: Array.from(expandedSet) })
	}

	function handleSummaryClick(event: Event, sectionId: 'catch' | 'ribbon' | 'mark' | 'stats') {
		event.preventDefault() // Verhindert das native toggle-Verhalten
		toggleDetailsSection(sectionId)
	}

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

	// === Mobile Sidebar Toggle ===
	function toggleMobileSidebar(event: Event) {
		// prevents deselection of the currently selected Pokémon
		event.preventDefault()
		event.stopPropagation()
		appState.toggleMobileSidebar()
	}

	$inspect('Update from Sidebar:', selectedPokemon)
</script>

<button class="pk-mobile-sidebar-toggle" onclick={toggleMobileSidebar}>
	{#if isMobileSidebarOpen}
		<PkIcon name="close" />
	{:else}
		<PkIcon name="hamburger" />
	{/if}
</button>

<aside class="pk-sidebar pk-ui-section {isMobileSidebarOpen ? 'show' : ''}">
	<h2 class="sr-only">Pokemon details sidebar</h2>
	<section class="pk-viewer-section">
		<h3 class="sr-only">Pokémon Viewer</h3>
		<PkViewer {identifier} shiny={selectedPokemon.shiny} />
		<div class="pk-viewer-controls">
			<PkResetBtn {identifier} {disabled} />
			<PkToggle
				icon="sparkles-solid"
				iconColor="#fff"
				activeColor="hsla(125, 100%, 30%, 0.55)"
				label="Shiny"
				hideLabel={true}
				onUpdate={toggleShiny}
				checked={selectedPokemon.shiny}
				{disabled}
			/>
		</div>
		{#if selectedPokemon.caughtIn}
			<div class="pk-catch-location">
				<PkOriginMark caughtIn={selectedPokemon.caughtIn} {isSelectionValid} />
			</div>
		{/if}
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
			<div class="separator"></div>
		</section>

		<details class="pk-details" open={currentExpanded.includes('catch')}>
			<summary class="pk-summary" onclick={(event) => handleSummaryClick(event, 'catch')}>
				Catch data
			</summary>
			<section class="pk-form-section">
				<h3 class="sr-only">Catch data</h3>
				<PkForm {selectedPokemon} {disabled} {isSelectionValid} {updateCaughtIn} {updateComment} />
			</section>
		</details>

		<div class="separator"></div>

		<details class="pk-details" open={currentExpanded.includes('ribbon')}>
			<summary class="pk-summary" onclick={(event) => handleSummaryClick(event, 'ribbon')}>
				Ribbons
			</summary>
			<section class="pk-ribbon-section">
				<h3 class="sr-only">Ribbons</h3>
				<PkRibbonPicker
					{disabled}
					onUpdate={updateRibbons}
					selectedRibbons={selectedPokemon.ribbons}
				/>
			</section>
		</details>

		<div class="separator"></div>

		<details class="pk-details" open={currentExpanded.includes('mark')}>
			<summary class="pk-summary" onclick={(event) => handleSummaryClick(event, 'mark')}>
				Marks
			</summary>
			<section class="pk-marks-section">
				<h3 class="sr-only">Marks</h3>
				<PkMarkPicker {disabled} onUpdate={updateMarks} selectedMarks={selectedPokemon.marks} />
			</section>
		</details>

		<div class="separator"></div>
		<details class="pk-details" open={currentExpanded.includes('stats')}>
			<summary class="pk-summary" onclick={(event) => handleSummaryClick(event, 'stats')}>
				Status values
			</summary>
			<section class="pk-stats-section">
				<h3 class="sr-only">Status values</h3>
				<PkStats {identifier} />
			</section>
		</details>

		<section class="pk-links-section">
			<div class="separator"></div>
			<h3 class="text-base">Catch location</h3>
			<PkLinks idEntry={selectedPokemon.idEntry} />
		</section>
		<!-- <pre>{JSON.stringify(selectedPokemon, null, 2)}</pre> -->
	</section>
</aside>

<style>
	.pk-sidebar {
		min-width: var(--box-width);
		max-width: 415px;
		height: 92dvh;
		position: sticky;
		z-index: 2;
		margin: auto 0;
		margin-right: 2rem;
		color: var(--ui-text-color);
		display: flex;
		flex-direction: column;

		.pk-sidebar-content {
			display: flex;
			flex-direction: column;
			padding-inline: 0.5rem;
			flex: 1 1 0; /* Ensure inner pixelart Border is stuck at bottom of the sidebar */
			min-height: 0;
			overflow: auto;
			scrollbar-color: var(--scrollbar-color-primary) var(--scrollbar-color-secondary);
		}
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

		.pk-catch-location {
			position: absolute;
			bottom: 3px;
			right: 0;
			background-color: hsla(201, 64%, 50%, 0.75);
			border-radius: 5px 0 0 0;

			border-style: solid;
			border-color: transparent;
			border-width: 6px;

			border-image-source: url('/ui/inner-border-viewer.webp');
			border-image-slice: 6;
			border-image-repeat: stretch;
			border-image-outset: 3px;

			z-index: 2;
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

	.pk-title-section {
		padding-top: 0.5rem;

		.pk-title-row {
			display: flex;
			justify-content: space-between;
			align-items: center;
			text-align: center;
			min-height: 54px;
			padding-inline: 0.5rem;
		}
	}

	.pk-form-section,
	.pk-stats-section,
	.pk-ribbon-section,
	.pk-marks-section {
		padding: 1rem;
	}

	.pk-links-section {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding-bottom: 0.5rem;
		margin-top: auto; /* Align to the bottom of the container */
		align-self: flex-end;
		text-align: center;
		width: 100%;
	}

	/* Responsive Styles */
	/* Extra small mobile adjustments */
	@media (max-width: 680px) {
		.pk-sidebar {
			position: fixed;
			bottom: 0;
			left: 0;
			right: 0;
			width: 100vw;
			max-width: 100vw;
			min-width: 0;
			height: 65vh;
			border-radius: 20px 20px 0 0;
			box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
			transform: translateY(100%);
			transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
			z-index: 80;

			.separator {
				margin-block: 0.375rem;
			}

			summary {
				padding: 0.5rem 1rem;
			}
		}

		.pk-sidebar.show {
			transform: translateY(21px);
		}
	}

	.pk-mobile-sidebar-toggle {
		display: none;
	}

	@media (max-width: 680px) {
		.pk-mobile-sidebar-toggle {
			position: fixed;
			bottom: 1rem;
			right: 1rem;
			z-index: 100;
			background-color: hsla(201, 64%, 50%, 0.9);
			border: none;
			padding: 1rem;
			border-radius: 50%;
			cursor: pointer;
			display: flex;
			align-items: center;
			justify-content: center;
			width: 52px;
			height: 52px;
			color: white;
			font-size: 1.2rem;
			box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
			transition: all 0.2s ease;
		}

		.pk-mobile-sidebar-toggle:hover {
			background-color: hsla(199, 63%, 39%, 0.9);
			transform: scale(1.05);
		}

		.pk-mobile-sidebar-toggle:active {
			transform: scale(0.95);
		}
	}

	@media (max-width: 400px) {
		.pk-sidebar {
			.pk-sidebar-content {
				padding-inline: 0;
			}
		}
	}
</style>
