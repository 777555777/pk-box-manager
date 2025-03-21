<script lang="ts">
	let {
		label = '',
		checked = false,
		disabled = false,
		id = crypto.randomUUID(),
		onChange = () => {},
		icon = ''
	} = $props()
</script>

<div class="toggle-component">
	{#if label}
		<label for={id}>{label}</label>
	{/if}

	<input type="checkbox" {id} {disabled} bind:checked onchange={() => onChange(checked)} />

	{#if icon && !label}
		<label for={id} class="icon-label">{icon}</label>
	{/if}
</div>

<style>
	.toggle-component {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.icon-label {
		cursor: pointer;
	}
</style>
