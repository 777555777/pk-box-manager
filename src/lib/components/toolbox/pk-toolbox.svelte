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

<aside class="pk-toolbox pk-ui-section">
	<div class="pk-data">
		<PkDexSelector />
		<div class="pk-toolbox-btn-group">
			<PkImport />
			<PkExport />
		</div>
	</div>

	<hr />

	<div class="pk-modes">
		<PkToggle
			icon="pen.svg"
			activeColor="hsla(0, 100%, 30%, 0.6)"
			label="Viewer Mode"
			hideLabel={true}
			checked={viewerMode}
			onUpdate={toggleViewerMode}
		/>

		<div class="pk-toolbox-btn-group">
			<!-- cycle to additional display modes -->
			<button class="pk-button" onclick={cycleBadgeDisplay}>Badge 🔄</button>

			<!-- cycle to additional display modes -->
			<button class="pk-button" onclick={openDefaultDialog}
				>Defaults{#if appState.hasModifiedDefaults()}❗{/if}</button
			>
		</div>
	</div>

	<PkDefaults bind:this={defaultsDialog} />
</aside>

<style>
	.pk-toolbox {
		/* Layout */
		width: 60rem;
		padding: 0.5rem;
		display: flex;
		justify-content: space-around;

		/* Positioning */
		position: sticky;
		top: 0;
		z-index: 5;
		margin-left: calc(2rem + (100vw - 408px - 2rem - 4rem) / 2 - 30rem);
		margin-bottom: 2rem;

		/* Adjust top offset correctly */
		transform: translateY(calc(-1 * var(--corner-top)));
	}

	.pk-data {
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
</style>
