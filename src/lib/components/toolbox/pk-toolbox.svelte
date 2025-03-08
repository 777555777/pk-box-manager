<script lang="ts">
	import { appState } from '$lib/state/app-state.svelte'
	import { storageHandler } from '$lib/state/storage-handler'

	let sidebarEditMode = $derived(appState.getSidebarEditMode())
	let badgeDisplay = $derived(appState.getBadgeDisplay())

	function toggleSidebarEditMode() {
		appState.toggleSidebarEditMode()
	}

	function cycleBadgeDisplay() {
		appState.cycleBadgeDisplay(badgeDisplay)
	}

	function exportCurrentDex() {
		const selectedDexName = storageHandler.getSelectedDexName()
		const dexState = JSON.stringify(storageHandler.getDexState(selectedDexName), null, 2)

		// Erstelle einen Blob mit dem JSON-Inhalt
		const blob = new Blob([dexState], { type: 'application/json' })

		// Erstelle eine URL für den Blob
		const url = URL.createObjectURL(blob)

		// Erstelle ein temporäres a-Element zum Herunterladen
		const a = document.createElement('a')
		a.href = url
		a.download = selectedDexName

		// Füge das Element zum DOM hinzu, klicke es und entferne es wieder
		document.body.appendChild(a)
		a.click()
		document.body.removeChild(a)

		// Gib die URL frei
		URL.revokeObjectURL(url)
	}
</script>

<aside class="pk-toolbox">
	<div class="pk-data">
		<select class="pk-order" name="pk-order" id="pk-order" title="pokedex-order" value="">
			<option value="order-national.json">order-national.json</option>
			<option value="order-national-forms.json">order-national-forms.json</option>
			<option value="order-national-test.json">order-national-test.json</option>
			<option value="order-test-small-1.json">order-test-small-1.json</option>
			<option value="order-test-small-2.json">order-test-small-2.json</option>
		</select>
		<!-- export the edit state that is stored for the currently selected dex
		 so just export the localstorage entry as json to the user -->
		<button onclick={exportCurrentDex}>Export</button>
		<!-- adds the uploaded file to localstorage, sets it as selected in localstorage
		 also adds it to the select menu, needs to be criticaly validated -->
		<button>Import</button>
	</div>

	<hr />

	<div class="pk-modes">
		<!-- in quick edit mode sidebar will display on hover
		and wont allow edits to its data
		the slots can be clicked to mark caught or not caught -->

		<!-- in sidebar-edit mode clicking a slot does not toggle captured state
		instead it highlights the slot and editing via sidebar will be enabled -->
		<label for="sidebar-edit">Sidebar Edit</label>
		<input
			type="checkbox"
			name="sidebar-edit"
			id="sidebar-edit"
			onchange={toggleSidebarEditMode}
			checked={sidebarEditMode}
		/>

		<!-- cycle to additional display modes -->
		<button onclick={cycleBadgeDisplay}>🔄</button>
	</div>
</aside>

<style>
	.pk-toolbox {
		width: 400px;
		height: 180px;

		position: sticky;
		top: 5.5rem; /* Abstand von oben */
		align-self: flex-start; /* Damit es oben beginnt */
		height: fit-content; /* Passt sich dem Inhalt an */

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
		justify-content: center;
	}

	.pk-order {
		padding: 0.35rem 0.25rem;
		margin: 0 auto;
	}

	.pk-modes {
		display: flex;
		justify-content: flex-start;
		gap: 0.5rem;
	}

	button {
		width: 5rem;
		padding: 0.35rem 0.25rem;
	}
</style>
