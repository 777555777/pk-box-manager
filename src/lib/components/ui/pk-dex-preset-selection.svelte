<script lang="ts">
	import { getDexConfig, getAvailableTagsForPreset } from '$lib/data/pokedex-config-utils'
	import PkToggle from '$lib/components/ui/pk-toggle.svelte'
	import { formatTagName } from '$lib/init-dex-helper'
	import type { BoxTags, DexConfig } from '$lib/models/data-models'
	import { dexPresets } from '$lib/data/pokedex'

	let { onSelect, selectedPresetDexConfig } = $props()

	// Custom display name for the new Pokédex instance
	let customDisplayName = $derived(selectedPresetDexConfig.displayName)
	let allTags = $derived(getAvailableTagsForPreset(selectedPresetDexConfig.presetId))

	let allTagsState = $state<Record<string, boolean>>({})

	// Initialisierung, wenn allTags sich ändert
	$effect(() => {
		let newState: Record<string, boolean> = {}
		for (const tag of allTags) {
			newState[tag] = true
		}
		allTagsState = newState
	})

	let totalPokemonCount = $derived(determineTotalPokemonCount())

	// Functions
	function determineTotalPokemonCount(): number {
		try {
			// Passendes Preset finden
			const selectedPreset = Object.values(dexPresets).find(
				(preset) => preset.presetId === selectedPresetDexConfig.presetId
			)

			if (!selectedPreset) {
				return 0
			}

			const activeTags = Object.entries(allTagsState)
				.filter(([_, isActive]) => isActive)
				.map(([tag]) => tag as BoxTags)

			// Konfiguration mit aktiven Tags holen
			const configWithTags = getDexConfig(selectedPreset.presetId, activeTags)

			// Anzahl Pokémon summieren
			let totalCount = 0
			for (const box of configWithTags.pokemonOrder) {
				totalCount += box.pokemon.length
			}

			return totalCount
		} catch (error) {
			console.error('Error calculating pokemon count:', error)
			return 0
		}
	}

	function handleDexSelect() {
		const selectedPreset = Object.values(dexPresets).find(
			(preset) => preset.presetId === selectedPresetDexConfig.presetId
		) as DexConfig

		if (onSelect && selectedPreset) {
			// aktive Tags ermitteln
			const activeTags = Object.entries(allTagsState)
				.filter(([_, isActive]) => isActive)
				.map(([tag]) => tag as BoxTags)

			const baseConfigWithTags = getDexConfig(selectedPreset.presetId, activeTags)

			const configWithCustomName = {
				...baseConfigWithTags,
				displayName: customDisplayName.trim() || selectedPreset.displayName
			}

			selectedPresetDexConfig = configWithCustomName
			onSelect(configWithCustomName, activeTags)
		}
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
				{#each Object.entries(allTagsState) as [tag, isActive]}
					{#if tag !== 'normal'}
						<div class="tag-toggle-item">
							<PkToggle
								label={formatTagName(tag as BoxTags)}
								activeColor="hsla(125, 100%, 30%, 0.55)"
								bind:checked={allTagsState[tag as BoxTags]}
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
		height: 100%;
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
