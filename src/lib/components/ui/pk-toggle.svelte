<script lang="ts">
	import PkIcon from '$lib/components/ui/pk-icon.svelte'

	let {
		icon = '',
		iconColor = '#fff',
		activeColor = 'hsla(0, 0, 40%, 0.6)',
		label = '',
		hideLabel = false,
		tooltip = '',
		onUpdate = () => {},
		checked = $bindable(false),
		disabled = false,
		id = crypto.randomUUID()
	} = $props()

	function handleToggle(event: MouseEvent) {
		// No "preventDefault" because toggling the checkbox checked state
		event.stopPropagation()

		if (!disabled) {
			checked = !checked
			onUpdate(checked)
		}
	}
</script>

<input type="checkbox" class="sr-only" {id} {disabled} bind:checked onclick={handleToggle} />
<label
	for={id}
	class="pk-button {tooltip ? 'pk-tooltip' : ''} "
	data-tooltip={tooltip}
	style="--active-background: {activeColor}"
>
	<div class="pk-toggle-state {hideLabel ? '' : 'pk-icon-and-text'}">
		{#if icon}
			<PkIcon color={iconColor} name={icon} size={24} />
		{/if}
		{#if label}
			<span class={hideLabel ? 'sr-only' : ''}>{label}</span>
		{/if}
	</div>
</label>

<style>
	label {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;
		cursor: pointer;
	}

	label div.pk-toggle-state {
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		padding: 0;
		height: 44px;
		min-width: 44px;
		max-width: fit-content;
	}

	label div.pk-icon-and-text {
		white-space: nowrap;
		padding-inline: 1rem;
		padding-bottom: 3px;
	}

	/* Only apply Background in checked state */
	input[type='checkbox']:checked + label .pk-toggle-state {
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
		pointer-events: none;
	}

	input:disabled ~ label {
		filter: brightness(0.75);
		pointer-events: none;
		cursor: not-allowed;
		color: var(--ui-text-disabled);
	}

	input:focus-visible ~ label::before {
		outline: none;
		border-image-source: url('/ui/textarea-select-focus.webp');
	}

	label span {
		user-select: none;
	}
</style>
