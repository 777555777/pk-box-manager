<script lang="ts">
	import { appState } from '$lib/state/app-state.svelte'
	import PkImport from '$lib/components/toolbox/pk-import.svelte'
	import PkDexSelector from '$lib/components/toolbox/pk-dex-selector.svelte'
	import PkExport from '$lib/components/toolbox/pk-export.svelte'
	import PkDefaults from '$lib/components/toolbox/pk-defaults.svelte'

	interface PkDefaultsDialogElement {
		showDefaultsDialog: Function
	}

	let defaultsDialog: PkDefaultsDialogElement

	let viewerMode = $derived(appState.getViewerMode())
	let badgeDisplay = $derived(appState.getBadgeDisplay())

	function toggleViewerMode() {
		appState.toggleViewerMode()
	}

	function cycleBadgeDisplay() {
		appState.cycleBadgeDisplay(badgeDisplay)
	}

	function openDefaultDialog() {
		defaultsDialog.showDefaultsDialog()
	}
</script>

<aside class="pk-toolbox">
	<div class="pk-data">
		<PkDexSelector />
		<div class="pk-btn-grp">
			<PkImport />
			<PkExport />
		</div>
	</div>

	<hr />

	<div class="pk-modes">
		<label for="sidebar-edit"
			>Viewer Mode
			<input
				type="checkbox"
				name="sidebar-edit"
				id="sidebar-edit"
				onchange={toggleViewerMode}
				checked={viewerMode}
			/>
		</label>

		<!-- cycle to additional display modes -->
		<button onclick={cycleBadgeDisplay}>🔄</button>

		<!-- cycle to additional display modes -->
		<button onclick={openDefaultDialog}
			>{#if appState.checkForModifiedDefaults()}
				👌
				<!-- TODO: fix indicator that defaults were edited -->
			{/if}Defaults</button
		>
	</div>
</aside>

<PkDefaults bind:this={defaultsDialog} />

<style>
	.pk-toolbox {
		width: 400px;

		/* concept placeholder */
		background-color: hsl(212, 100%, 90%);
		border: 2px solid hsl(202, 100%, 74%);
		border-radius: 10px;
		padding: 10px;

		display: flex;
		justify-content: center;
		flex-direction: column;
		gap: 0.75rem;

		margin: 0 auto;
	}

	.pk-data {
		display: flex;
		justify-content: space-between;
	}

	.pk-modes {
		display: flex;
		justify-content: space-between;
		gap: 0.5rem;
	}

	button {
		width: 5rem;
		padding: 0.35rem 0.25rem;
	}
</style>
