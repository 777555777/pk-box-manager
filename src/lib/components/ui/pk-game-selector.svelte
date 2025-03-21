<script lang="ts">
	import { Game, Generations } from '$lib/models/data-models'

	let {
		disabled = false,
		id = crypto.randomUUID(),
		value = '', // '' Renders as "Select game"
		onChange = () => {}
	} = $props()
</script>

<label for={id}>Caught in</label>
<select {id} {disabled} bind:value onchange={() => onChange(value)}>
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
