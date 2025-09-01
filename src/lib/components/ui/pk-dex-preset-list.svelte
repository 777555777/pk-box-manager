<script lang="ts">
	import { dexPresets } from '$lib/data/pokedex'

	type DexPresetKey = keyof typeof dexPresets

	let { selectedPreset = $bindable() }: { selectedPreset: DexPresetKey } = $props()

	function selectPreset(dexPresetId: string) {
		selectedPreset = dexPresetId as DexPresetKey
	}
</script>

<ul class="pk-dex-preset-list">
	{#each Object.entries(dexPresets) as [dexPresetId, dexPreset], index}
		<li class="pk-dex-preset-list-item">
			<a
				class="pk-textarea {selectedPreset === dexPresetId ? 'active' : ''}"
				href="#"
				onclick={() => selectPreset(dexPresetId)}>{dexPreset.displayName}</a
			>
		</li>
	{/each}
</ul>

<style>
	.pk-dex-preset-list {
		width: 80%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;

		list-style: none;
		overflow-y: auto;

		padding: 1rem;

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
