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
			<button onclick={cycleBadgeDisplay}>Badge 🔄</button>

			<!-- cycle to additional display modes -->
			<button onclick={openDefaultDialog}
				>Defaults{#if appState.hasModifiedDefaults()}❗{/if}</button
			>
		</div>
	</div>

	<PkDefaults bind:this={defaultsDialog} />
</aside>

<style>
	.pk-toolbox {
		width: 60rem;

		/* concept placeholder */
		background-color: hsl(212, 100%, 90%);
		border: 2px solid hsl(202, 100%, 74%);
		border-radius: 10px;
		padding: 10px;

		display: flex;
		justify-content: space-around;
		flex-direction: row;
		gap: 0.75rem;

		margin: 0 auto;

		position: sticky;
		top: 0;
		z-index: 5;
		margin-left: calc(2rem + calc(100vw - 408px - 2rem - 4rem) / 2 - 30rem);
		margin-bottom: 2rem;
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

	button {
		padding: 0.35rem 0.25rem;
	}
</style>
