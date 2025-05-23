<script lang="ts">
	import { appState } from '$lib/state/app-state.svelte'
	import PkImport from '$lib/components/toolbox/pk-import.svelte'
	import PkDexSelector from '$lib/components/toolbox/pk-dex-selector.svelte'
	import PkExport from '$lib/components/toolbox/pk-export.svelte'
	import PkDefaults from '$lib/components/toolbox/pk-defaults.svelte'
	import PkToggle from '$lib/components/ui/pk-toggle.svelte'
	import PkDexReset from './pk-dex-reset.svelte'

	interface PkDefaultsDialogElement {
		showDefaultsDialog: Function
	}

	let defaultsDialog: PkDefaultsDialogElement

	let viewerMode = $derived(appState.isViewerModeEnabled())

	function toggleViewerMode() {
		appState.toggleViewerMode()
	}

	function cycleBadgeDisplay() {
		appState.cycleBadgeDisplayMode()
	}

	function openDefaultDialog() {
		defaultsDialog.showDefaultsDialog()
	}
</script>

<aside class="pk-toolbox pk-ui-section">
	<section class="pk-ui-section-inner">
		<div class="pk-pokedex-data">
			<PkDexSelector />
			<div class="pk-toolbox-btn-group">
				<PkImport />
				<PkExport />
				<PkDexReset />
			</div>
		</div>

		<div class="separator-vertical"></div>

		<div class="pk-modes">
			<PkToggle
				icon="/ui/pen.svg"
				activeColor="hsla(0, 100%, 30%, 0.6)"
				label="Viewer Mode"
				hideLabel={true}
				checked={viewerMode}
				onUpdate={toggleViewerMode}
			/>

			<button class="pk-button" onclick={cycleBadgeDisplay}
				><img src="/ui/refresh.svg" alt="" /><span>Badge</span>
			</button>

			<button class="pk-button" onclick={openDefaultDialog}
				><img class={appState.hasModifiedDefaults() ? 'modified' : ''} src="/ui/tag.svg" alt="" />
				<span>Defaults</span></button
			>
		</div>
	</section>

	<PkDefaults bind:this={defaultsDialog} />
</aside>

<style>
	.pk-toolbox {
		/* Positioning */
		position: fixed;
		top: 0;
		z-index: 5;

		/* Adjust top offset correctly */
		transform: translateY(calc(-1 * 18px));

		.pk-ui-section-inner {
			display: flex;
			justify-content: space-around;
			padding: 0.5rem;
		}
	}

	.pk-pokedex-data {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
	}

	.pk-modes {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
	}

	.pk-toolbox-btn-group {
		display: flex;
		gap: 1rem;
	}

	.modified {
		filter: sepia(100%) hue-rotate(-10deg) saturate(1000%);
	}

	@media (max-width: 1350px) {
		.pk-button {
			max-width: 44px;

			span {
				display: none;
			}
		}
	}
</style>
