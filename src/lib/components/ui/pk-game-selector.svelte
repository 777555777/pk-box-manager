<script lang="ts">
	import { Game, Generations } from '$lib/models/data-models'

	let {
		label = '',
		onUpdate = () => {},
		value = '', // '' Renders as "Select game"
		disabled = false,
		id = crypto.randomUUID()
	} = $props()
</script>

<label for={id}>{label}</label>
<select {id} {disabled} bind:value onchange={() => onUpdate(value)}>
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
