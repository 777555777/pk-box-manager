<script lang="ts">
	let {
		icon = '',
		activeColor = 'hsla(0, 0, 40%, 0.6)',
		label = '',
		hideLabel = false,
		onUpdate = () => {},
		checked = false,
		disabled = false,
		id = crypto.randomUUID()
	} = $props()

	$inspect(label)
	$inspect(icon)
</script>

<button
	style="--active-background: {activeColor}"
	class="pk-button"
	onclick={() => onUpdate(!checked)}
	{disabled}
>
	<input type="checkbox" {id} {disabled} bind:checked onchange={() => onUpdate(checked)} />
	<label for={id}>
		{#if icon}
			<img src={icon} alt="" />
		{/if}
		{#if label}
			<span class={hideLabel ? 'sr-only' : ''}>{label}</span>
		{/if}
	</label>
</button>

<style>
	input[type='checkbox'] {
		display: none;
	}

	input[type='checkbox']:checked + label {
		background-color: var(--active-background);
		clip-path: polygon(
			3px calc(100% - 6px),
			6px calc(100% - 6px),
			6px calc(100% - 3px),
			calc(100% - 6px) calc(100% - 3px),
			calc(100% - 6px) calc(100% - 6px),
			calc(100% - 3px) calc(100% - 6px),
			calc(100% - 3px) 6px,
			calc(100% - 6px) 6px,
			calc(100% - 6px) 3px,
			6px 3px,
			6px 6px,
			3px 6px
		);
		mix-blend-mode: color-dodge;
	}

	.pk-button img {
		width: 26px;
		height: 26px;
		margin-bottom: 3px;
	}

	.pk-button {
		padding: 0;
	}

	.pk-button label {
		display: flex;
		align-items: center;
		justify-content: center;

		width: 44px;
		height: 44px;
		cursor: pointer;
	}
</style>
