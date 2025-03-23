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
	<label class="switch">
		<input type="checkbox" {id} {disabled} bind:checked onchange={() => onChange(checked)} />
		<span class="slider"></span>
	</label>
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

	.switch {
		position: relative;
		display: inline-block;
		width: 40px;
		height: 20px;
	}

	.switch input {
		opacity: 0;
		width: 0;
		height: 0;
	}

	.slider {
		position: absolute;
		cursor: pointer;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: #ccc;
		transition: 0.3s;
		border-radius: 20px;
	}

	.slider:before {
		position: absolute;
		content: '';
		height: 14px;
		width: 14px;
		left: 3px;
		bottom: 3px;
		background-color: white;
		transition: 0.3s;
		border-radius: 50%;
	}

	input:checked + .slider {
		background-color: #4caf50;
	}

	input:checked + .slider:before {
		transform: translateX(20px);
	}

	input:disabled + .slider {
		background-color: #aaa;
		cursor: not-allowed;
	}

	.icon-label {
		cursor: pointer;
	}
</style>
