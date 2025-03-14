<script lang="ts">
	import { appState } from '$lib/state/app-state.svelte'
	import PkImport from '$lib/components/toolbox/pk-import.svelte'
	import PkDexSelector from './pk-dex-selector.svelte'
	import PkExport from './pk-export.svelte'

	let sidebarEditMode = $derived(appState.getSidebarEditMode())
	let badgeDisplay = $derived(appState.getBadgeDisplay())

	function toggleSidebarEditMode() {
		appState.toggleSidebarEditMode()
	}

	function cycleBadgeDisplay() {
		appState.cycleBadgeDisplay(badgeDisplay)
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
		<!-- in quick edit mode sidebar will display on hover
		and wont allow edits to its data
		the slots can be clicked to mark caught or not caught -->

		<!-- in sidebar-edit mode clicking a slot does not toggle captured state
		instead it highlights the slot and editing via sidebar will be enabled -->
		<label for="sidebar-edit"
			>Sidebar Edit
			<input
				type="checkbox"
				name="sidebar-edit"
				id="sidebar-edit"
				onchange={toggleSidebarEditMode}
				checked={sidebarEditMode}
			/>
		</label>

		<!-- cycle to additional display modes -->
		<button onclick={cycleBadgeDisplay}>🔄</button>
	</div>
</aside>

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
