<script lang="ts">
	import PkDialog, { type PkDialogElement } from './pk-dialog.svelte'
	import PkToggle from './pk-toggle.svelte'
	import type { BoxTags, DexConfig } from '$lib/models/data-models'
	import { getDexConfig, getAvailableTagsForPreset } from '$lib/data/pokedex-config-utils'
	import { dexPresets } from '$lib/data/pokedex'
	import { formatTagName } from '$lib/init-dex-helper'

	let { dexTitle, dexId, onSelect, imgUrl } = $props()

	let cardElement: HTMLElement | undefined
	let configurationDialog: PkDialogElement

	// Custom display name for the new Pokédex instance
	let customDisplayName = $state(dexTitle)

	// Tag toggle functionality for presets
	let availableTagsForThisPreset = getAvailableTagsForPreset(dexId)

	let tagStates: Record<string, boolean> = $state({})
	let activeTags: BoxTags[] = $derived(findActiveTags())
	let totalPokemonCount: number = $derived(determineTotalPokemonCount())
	let selectedPresetConfig = $state<DexConfig | null>(null)

	// Initialize tag states - default to true (all selected)
	for (const tag of availableTagsForThisPreset) {
		tagStates[tag] = true
	}

	function determineTotalPokemonCount(): number {
		try {
			// Passendes Preset finden
			const selectedPreset = Object.values(dexPresets).find((preset) => preset.presetId === dexId)

			if (!selectedPreset) {
				return 0
			}

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

	function findActiveTags(): BoxTags[] {
		const tags: BoxTags[] = ['normal']

		for (const [tag, active] of Object.entries(tagStates)) {
			if (active) {
				tags.push(tag as BoxTags)
			}
		}

		return tags
	}

	function handleDexSelect() {
		// For preset cards, pass the selected preset and active tags
		const selectedPreset = Object.values(dexPresets).find(
			(preset) => preset.presetId === dexId
		) as DexConfig

		if (onSelect && selectedPreset) {
			// Get base config with tags (creates a new object, doesn't mutate original)
			const baseConfigWithTags = getDexConfig(selectedPreset.presetId, activeTags)

			// Create final config with custom name (another new object)
			const configWithCustomName = {
				...baseConfigWithTags,
				displayName: customDisplayName.trim() || selectedPreset.displayName
			}

			selectedPresetConfig = configWithCustomName
			onSelect(configWithCustomName, activeTags)
		}
	}
</script>

<article class="pk-dex-card" bind:this={cardElement}>
	<section class="pk-dex-card-header">
		<div class="pk-dex-card-title">
			<h3 class="text-base">{dexTitle}</h3>
		</div>
	</section>

	<section class="pk-dex-card-image" style="background-image: url({imgUrl})"></section>

	<section class="pk-dex-card-actions">
		<!-- Select Button -->
		<button
			class="pk-button pk-dex-create-btn"
			onclick={() => {
				configurationDialog.showDialog()
			}}
		>
			Create new Pokedex
		</button>
	</section>
</article>

{#snippet dexConfigurationContent()}
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
		<p>Select the variants to be included in the Pokédex</p>

		{#if availableTagsForThisPreset.length > 0}
			<div class="tag-grid">
				{#each availableTagsForThisPreset as tag}
					<div class="tag-toggle-item">
						<PkToggle
							label={formatTagName(tag)}
							activeColor="hsla(125, 100%, 30%, 0.55)"
							bind:checked={tagStates[tag]}
						/>
					</div>
				{/each}
			</div>
		{:else}
			<div class="no-tags-info">
				<p>This Pokédex only contains base Pokemon - no additional variants available.</p>
			</div>
		{/if}

		<div class="active-tags-preview">
			<span>Include variants:</span>
			<span class="tag-list"
				>{activeTags
					.filter((tag) => tag !== 'normal')
					.map(formatTagName)
					.join(', ') || 'base Pokemon only'}</span
			>
		</div>
		<div class="pokemon-count-preview">
			<span>Total Pokemon:</span>
			<span class="pokemon-count text-large">{totalPokemonCount}</span>
		</div>
	</div>
{/snippet}

<PkDialog
	bind:this={configurationDialog}
	headline="Configuration"
	dialogContent={dexConfigurationContent}
	onConfirm={handleDexSelect}
	onCancel={() => {}}
	okBtnText="Create Pokedex"
	cancelBtnText="Cancel"
	size="S"
/>

<style>
	.pk-dex-card-header {
		.pk-dex-card-title {
			min-height: unset;
		}
	}

	.pk-dex-card-actions {
		.pk-dex-create-btn {
			margin: 0 auto;
		}
	}

	/* Dialog Tag Selection Styles */
	.dex-tag-selection {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding-inline: 1rem;
		text-align: center;
	}

	.tag-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.no-tags-info {
		padding: 1rem;
		background-color: hsla(40, 100%, 20%, 0.3);
		border-radius: 4px;
		border-left: 4px solid hsla(40, 100%, 50%, 0.8);
		margin: 1rem 0;
		text-align: center;
	}

	.active-tags-preview {
		padding: 0.75rem;
		background-color: var(--ui-text-info-darker);
		border-radius: 4px;
		border-left: 4px solid var(--ui-text-info);
		text-align: left;
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

	.tag-list {
		color: var(--ui-text-info);
		font-weight: 500;
	}

	.dex-name-input {
		display: flex;
		flex-direction: column;
		padding-inline: 1rem;
		gap: 0.5rem;
	}
</style>
