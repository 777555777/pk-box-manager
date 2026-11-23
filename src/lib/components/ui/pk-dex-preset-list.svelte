<script lang="ts">
	import { catalog } from '$lib/catalog/catalog'

	let { selectedPreset = $bindable() }: { selectedPreset: string | null } = $props()

	const presets = catalog.listPresets()

	function selectPreset(event: Event, presetId: string) {
		event.preventDefault()
		selectedPreset = presetId
	}
</script>

<div class="pk-dex-preset-list-container">
	<h3>Preset List</h3>
	<ul class="pk-dex-preset-list">
		{#each presets as preset (preset.id)}
			<li class="pk-dex-preset-list-item">
				<a
					class="pk-textarea {selectedPreset === preset.id ? 'active' : ''}"
					href="/"
					onclick={(event) => selectPreset(event, preset.id)}>{preset.name}</a
				>
			</li>
		{/each}
	</ul>
</div>

<style>
	.pk-dex-preset-list-container {
		width: 80%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 0.75rem;
	}
	.pk-dex-preset-list {
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 0.75rem;

		list-style: none;
		overflow-y: auto;

		padding: 0 1rem 1rem 0;

		.pk-dex-preset-list-item {
			width: 100%;
		}

		li a {
			display: block;
			width: 100%;
			padding: 1rem 1.5rem;

			color: var(--ui-text-color);
			text-decoration: none;
			font-weight: 500;

			cursor: pointer;
		}

		a.active {
			color: var(--ui-text-active);
		}
	}

	@media (max-width: 768px) {
		.pk-dex-preset-list-container {
			width: 100%;
			h3 {
				padding-left: 1rem;
			}
		}
		.pk-dex-preset-list {
			width: 100%;
			gap: 0.5rem;
			padding: 0;
			padding-inline: 1rem;
			justify-content: start;
			overflow-y: unset;
		}
	}
</style>
