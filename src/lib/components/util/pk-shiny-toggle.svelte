<script lang="ts">
	import { appState } from '../../state/app-state.svelte'

	let localShiny = $state(appState.getAppDefaults().shiny)

	function toggleShiny() {
		appState.setAppDefaults({ shiny: localShiny })
	}
</script>

<label for="shiny-toggle">Shiny</label>
<input
	type="checkbox"
	name="shiny-toggle"
	id="shiny-toggle"
	bind:checked={localShiny}
	onchange={toggleShiny}
/>
