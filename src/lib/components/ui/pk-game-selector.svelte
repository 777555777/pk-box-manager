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

<div class="pk-caught-in">
	<label for={id}>{label}</label>
	<div class="pk-select-wrapper">
		<select class="pk-select" {id} {disabled} bind:value onchange={() => onUpdate(value)}>
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
		<span class="pk-select-arrow"></span>
	</div>
</div>

<style>
	label {
		margin-bottom: 0.375rem;
	}
	.pk-caught-in {
		display: flex;
		flex-direction: column;
	}
</style>
