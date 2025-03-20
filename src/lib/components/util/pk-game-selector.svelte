<script lang="ts">
	import { Game, Generations } from '$lib/models/data-models'
	import { appState } from '../../state/app-state.svelte'

	let localCaughtIn = $state(appState.getAppDefaults().caughtIn)

	function saveCaughtIn() {
		appState.setAppDefaults({ caughtIn: localCaughtIn })
	}
</script>

<select name="region" id="pk-region" bind:value={localCaughtIn} onchange={saveCaughtIn}>
	<option value="">Select game</option>
	{#each Generations as gen}
		<optgroup label={`Generation ${gen}`}>
			{#each Object.entries(Game) as [key, value]}
				{#if value.gen === gen}
					<option value={key}>{value.title}</option>
				{/if}
			{/each}
		</optgroup>
	{/each}
</select>
