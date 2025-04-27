<script lang="ts">
	let {
		icon = '',
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

<button class="pk-button" onclick={() => onUpdate(!checked)} {disabled}>
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
		background-color: hsla(0, 100%, 30%, 0.6);
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
		width: 28px;
		height: 28px;
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
