<script lang="ts">
	// Usage: <PkRadioGroup bind:currentOption {optionConfig} />

	interface optionConfig {
		tabId: string
		label: string
	}

	let {
		currentOption = $bindable(),
		optionConfig,
		onUpdate = () => {},
		id = crypto.randomUUID()
	}: {
		currentOption: string
		optionConfig: optionConfig[]
		onUpdate?: (value: string) => void
		id?: string
	} = $props()

	$inspect('currentOption: ', currentOption)
</script>

<section class="pk-tab-group">
	{#each optionConfig as { tabId, label }}
		<input
			type="radio"
			id="{tabId}-tab-{id}"
			name="tab-group-{id}"
			value={tabId}
			bind:group={currentOption}
			onchange={() => onUpdate(currentOption)}
		/><label for="{tabId}-tab-{id}">{label}</label>
	{/each}
</section>

<style>
	.pk-tab-group {
		margin: 0 auto;

		padding-inline: 6px;
		padding-block: 12px;
		max-height: 44px;

		border-width: 9px solid;
		border-image: url('/ui/textarea-select-default.webp') 9 fill stretch;
		border-image-outset: 0;
		border-image-width: 9px;

		display: inline-block;
	}

	.pk-tab-group:has(input[type='radio']:focus-visible) {
		border-width: 9px solid;
		border-image: url('/ui/textarea-select-focus.webp') 9 fill stretch;
		border-image-outset: 0;
		border-image-width: 9px;
	}

	.pk-tab-group input[type='radio'] {
		/* Accessibility-friendly method to hide Radio-Buttons */
		position: absolute;
		opacity: 0;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
	}

	.pk-tab-group label {
		padding: 8px 12px;
		text-align: center;
		cursor: pointer;
		&:nth-child(even):not(:last-child) {
			border-right: 3px solid #5d5d6f;
		}
	}

	.pk-tab-group label:hover {
		background: #82829a;

		/* Erster Button (linke Seite) */
		&:first-of-type {
			clip-path: polygon(0% 12%, 5% 12%, 5% 3%, 100% 3%, 100% 95%, 5% 95%, 5% 87%, 0% 87%);
		}

		/* Letzter Button (rechte Seite) */
		&:last-of-type {
			clip-path: polygon(0 3%, 95% 3%, 95% 12%, 100% 12%, 100% 87%, 95% 87%, 95% 95%, 0 95%);
		}

		/* Mittlere Buttons (falls mehr als 2 vorhanden) */
		&:not(:first-of-type):not(:last-of-type) {
			clip-path: polygon(0% 3%, 100% 3%, 100% 95%, 0 95%);
		}
	}

	/* Hover-Effekt für disabled Buttons deaktivieren */
	.pk-tab-group input[type='radio']:disabled + label:hover {
		background: transparent;
		clip-path: none;
	}

	/* Disabled state für Labels */
	.pk-tab-group input[type='radio']:disabled + label {
		filter: brightness(0.75);
		pointer-events: none;
		cursor: not-allowed;
	}

	.pk-tab-group input[type='radio']:checked + label {
		color: #ffb267;
	}

	.pk-tab-group input[type='radio']:focus-visible + label {
		outline: 3px solid hsl(220, 100%, 65%);
		border-radius: 0.3rem;
	}
</style>
