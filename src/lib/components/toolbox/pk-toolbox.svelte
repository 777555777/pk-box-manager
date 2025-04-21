<script lang="ts">
	import { appState } from '$lib/state/app-state.svelte'
	import PkImport from '$lib/components/toolbox/pk-import.svelte'
	import PkDexSelector from '$lib/components/toolbox/pk-dex-selector.svelte'
	import PkExport from '$lib/components/toolbox/pk-export.svelte'
	import PkDefaults from '$lib/components/toolbox/pk-defaults.svelte'
	import PkToggle from '$lib/components/ui/pk-toggle.svelte'

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

<aside class="pk-toolbox">
	<div class="pk-data">
		<PkDexSelector />
		<div class="pk-toolbox-btn-group">
			<PkImport />
			<PkExport />
		</div>
	</div>

	<hr />

	<div class="pk-modes">
		<PkToggle icon="👀" label="Viewer Mode" checked={viewerMode} onUpdate={toggleViewerMode} />

		<div class="pk-toolbox-btn-group">
			<!-- cycle to additional display modes -->
			<button class="pk-button" onclick={cycleBadgeDisplay}>Badge 🔄</button>

			<!-- cycle to additional display modes -->
			<button class="pk-button" disabled onclick={openDefaultDialog}
				>Defaults{#if appState.hasModifiedDefaults()}❗{/if}</button
			>
		</div>
	</div>

	<PkDefaults bind:this={defaultsDialog} />
</aside>

<style>
	.pk-toolbox {
		width: 60rem;
		padding: 0.5rem;

		display: flex;
		justify-content: space-around;

		position: sticky;
		top: 0;
		z-index: 5;
		/* center the toolbox above the boxes */
		margin-left: calc(2rem + calc(100vw - 408px - 2rem - 4rem) / 2 - 30rem);
		margin-bottom: 2rem;

		--border-corner-size: 15px;
		--border-corner-size-num: 15;

		border-width: var(--border-corner-size);
		border-style: solid;
		border-image-source: url('ui-layout-border.png');
		border-image-slice: var(--border-corner-size-num) fill;
		border-image-repeat: stretch;
		border-image-outset: 0;
		border-image-width: var(--border-corner-size);

		image-rendering: pixelated;

		transform: translateY(calc(var(--border-corner-size) * -1)); /* hide border-image top-edge */
	}

	.pk-data {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
	}

	.pk-modes {
		display: flex;
		justify-content: space-between;
		gap: 0.5rem;
	}

	.pk-toolbox-btn-group {
		display: flex;
		gap: 1rem;
	}
</style>
