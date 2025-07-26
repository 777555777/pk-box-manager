<script lang="ts">
	let {
		icon = '',
		activeColor = 'hsla(0, 0, 40%, 0.6)',
		label = '',
		hideLabel = false,
		onUpdate = () => {},
		checked = $bindable(false),
		disabled = false,
		id = crypto.randomUUID()
	} = $props()
</script>

<button style="--active-background: {activeColor}" class="pk-button" {disabled}>
	<input type="checkbox" {id} {disabled} bind:checked onchange={() => onUpdate(checked)} />
	<label class={hideLabel ? '' : 'pk-icon-and-text'} for={id}>
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
		margin-bottom: 3px;
	}

	.pk-button {
		padding: 0;
	}

	.pk-button label {
		display: flex;
		align-items: center;
		justify-content: center;

		height: 44px;
		min-width: 44px;
		width: auto;
		cursor: pointer;
	}

	.pk-icon-and-text {
		white-space: nowrap;
		padding-inline: 1rem;
		padding-bottom: 3px;
		img {
			margin-bottom: 0;
		}
	}
</style>
