<script lang="ts">
	import { catalog } from '$lib/catalog/catalog'
	import { formatTagName } from '$lib/catalog/tags'
	import type { BoxTag } from '$lib/catalog/types'
	import type { NewDexOptions } from '$lib/state/dex-store.svelte'
	import PkToggle from '$lib/components/ui/pk-toggle.svelte'

	let { onSelect, presetId }: { onSelect: (options: NewDexOptions) => void; presetId: string } =
		$props()

	let preset = $derived(catalog.getPreset(presetId))

	// Custom display name for the new Pokédex instance (editable, resets with the preset)
	let customDisplayName = $derived(preset?.name ?? '')
	let allTags = $derived(catalog.getAvailableTags(presetId))

	// Not a writable $derived: the toggles bind to single keys, which needs a deep $state proxy.
	// eslint-disable-next-line svelte/prefer-writable-derived
	let allTagsState = $state<Record<string, boolean>>({})

	// all variants are selected by default whenever the preset changes
	$effect(() => {
		allTagsState = Object.fromEntries(allTags.map((tag) => [tag, true]))
	})

	let activeTags = $derived(
		Object.entries(allTagsState)
			.filter(([, isActive]) => isActive)
			.map(([tag]) => tag as BoxTag)
	)

	let totalPokemonCount = $derived(
		catalog.listPokemonIds({ kind: 'preset', presetId, tags: activeTags }).length
	)

	function handleDexSelect() {
		onSelect({ presetId, tags: activeTags, name: customDisplayName.trim() || (preset?.name ?? '') })
	}
</script>

<section class="dex-preset-details">
	<div class="dex-name-input">
		<label for="dex-name">Pokedex Name</label>
		<input
			class="pk-textarea"
			type="text"
			id="dex-name"
			bind:value={customDisplayName}
			maxlength="18"
		/>
	</div>

	<div class="separator"></div>

	<div class="dex-tag-selection">
		<p>Select the variants to be included in the Pokédex additional to the base forms:</p>

		{#if allTagsState}
			<div class="tag-grid">
				{#each Object.keys(allTagsState) as tag (tag)}
					{#if tag !== 'normal'}
						<div class="tag-toggle-item">
							<PkToggle
								label={formatTagName(tag as BoxTag)}
								activeColor="hsla(125, 100%, 30%, 0.55)"
								bind:checked={allTagsState[tag]}
							/>
						</div>
					{/if}
				{/each}
			</div>
		{:else}
			<div class="no-tags-info">
				<p>This Pokédex only contains base Pokemon - no additional variants available.</p>
			</div>
		{/if}

		<div class="pokemon-count-preview">
			<span>Total Pokemon:</span>
			<span class="pokemon-count text-large">{totalPokemonCount}</span>
		</div>
	</div>
	<button class="pk-button" onclick={handleDexSelect}> Create Pokedex </button>
</section>

<style>
	.dex-preset-details {
		display: flex;
		flex-direction: column;
		gap: 2rem;
		width: 100%;
		height: 85%;
		padding: 1rem;

		.dex-name-input {
			display: flex;
			flex-direction: column;
			gap: 0.5rem;
		}

		.dex-tag-selection {
			display: flex;
			flex-direction: column;
			gap: 1rem;
			text-align: center;
		}

		.tag-grid {
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
			gap: 0.5rem;
		}

		.no-tags-info {
			padding: 1rem;
			background-color: hsla(40, 100%, 20%, 0.3);
			border-radius: 4px;
			border-left: 4px solid hsla(40, 100%, 50%, 0.8);
			margin: 1rem 0;
			text-align: center;
		}

		.pokemon-count-preview {
			padding: 0.75rem;
			background-color: var(--ui-text-info-darker);
			border-radius: 4px;
			border-left: 4px solid var(--ui-text-info);
			display: flex;
			justify-content: space-between;
			align-items: center;
		}
	}

	button {
		margin-top: auto;
	}

	@media (max-width: 950px) {
		.dex-preset-details {
			height: 100%;
		}
	}

	@media (max-width: 768px) {
		.dex-preset-details {
			gap: 0.5rem;
			padding: 0;
			padding-inline: 1rem;
		}

		.dex-tag-selection {
			p {
				font-size: var(--small-font-size);
			}
		}
	}
</style>
