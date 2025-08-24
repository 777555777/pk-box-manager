<script lang="ts">
	import PkDialog, { type PkDialogElement } from './pk-dialog.svelte'
	import PkToggle from './pk-toggle.svelte'
	import type { BoxTags, DexConfig } from '$lib/models/data-models'
	import { getDexConfig, getAvailableTagsForPreset } from '$lib/data/pokedex-config-utils'
	import { dexPresets } from '$lib/data/pokedex'

	let { dexTitle, dexId, onSelect, imgUrl } = $props()

	let cardElement: HTMLElement | undefined
	let configurationDialog: PkDialogElement

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

	function determineTotalPokemonCount() {
		try {
			const selectedPreset = Object.values(dexPresets).find(
				(preset) => preset.id === dexId
			) as DexConfig
			if (!selectedPreset) return 0

			const configWithTags = getDexConfig(selectedPreset.id, activeTags)
			return configWithTags.pokemonOrder.reduce((total, box) => {
				return total + box.pokemon.length
			}, 0)
		} catch (error) {
			console.error('Error calculating pokemon count:', error)
			return 0
		}
	}

	function findActiveTags() {
		return [
			'normal' as BoxTags,
			...Object.entries(tagStates)
				.filter(([_, active]) => active)
				.map(([tag, _]) => tag as BoxTags)
		]
	}

	function handleDexSelect() {
		// For preset cards, pass the selected preset and active tags
		const selectedPreset = Object.values(dexPresets).find(
			(preset) => preset.id === dexId
		) as DexConfig
		if (onSelect && selectedPreset) {
			selectedPresetConfig = getDexConfig(selectedPreset.id, activeTags)
			onSelect(selectedPreset, activeTags)
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
	<div class="dex-tag-selection">
		<p class="text-small">Select which variants to include in your Pokédex:</p>

		{#if availableTagsForThisPreset.length > 0}
			<div class="tag-grid">
				{#each availableTagsForThisPreset as tag}
					<div class="tag-toggle-item">
						<PkToggle
							label={tag}
							activeColor="hsla(125, 100%, 30%, 0.55)"
							bind:checked={tagStates[tag]}
						/>
					</div>
				{/each}
			</div>
		{:else}
			<div class="no-tags-info">
				<p class="text-small">
					This Pokédex only contains base Pokemon - no additional variants available.
				</p>
			</div>
		{/if}

		<div class="active-tags-preview">
			<strong>Include variants:</strong>
			<span class="tag-list"
				>{activeTags.filter((tag) => tag !== 'normal').join(', ') || 'Base Pokemon only'}</span
			>
		</div>
		<div class="pokemon-count-preview">
			<strong>Total Pokemon:</strong>
			<span class="pokemon-count">{totalPokemonCount}</span>
		</div>
	</div>
{/snippet}

<PkDialog
	bind:this={configurationDialog}
	headline="Include variants"
	dialogContent={dexConfigurationContent}
	onConfirm={handleDexSelect}
	onCancel={() => {}}
	okBtnText="Create Pokedex"
	cancelBtnText="Cancel"
	size="S"
/>

<style>
	.pk-dex-card {
		display: flex;
		flex-direction: column;
		max-height: 290px;
		width: 220px;
		position: relative;
		padding: 0 6px 0;

		border-width: 9px solid;
		border-image: url('/ui/textarea-select-default.webp') 9 fill stretch;
		border-image-outset: 0;
		border-image-width: 9px;

		.pk-dex-card-actions button {
			position: relative;
			z-index: 2; /* Über dem Overlay */
		}
	}

	.pk-dex-card-header {
		display: flex;
		align-items: flex-start;
		padding-inline: 0.75rem;
		margin-top: 3px;
		padding-block: 8px;

		.pk-dex-card-title {
			/* min-height: 3.5rem; */

			h3 {
				line-height: 1.3;
				padding-block: 0.25rem;
				word-wrap: break-word;
				hyphens: auto;
			}
		}
	}

	.pk-dex-card-image {
		background-size: cover;
		background-position: center;
		width: 100%;
		height: 150px;
		position: relative;

		border-top: 3px solid #5d5d6f;
		border-bottom: 3px solid #5d5d6f;

		/* Background image as pseudo-element */
		&::after {
			content: '';
			position: absolute;
			inset: 0;
			background-image: inherit;
			background-size: inherit;
			background-position: inherit;
			z-index: 0;
		}

		/* Gradient to darken the image */
		&::before {
			content: '';
			position: absolute;
			inset: 0;
			background: linear-gradient(135deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.3) 100%);
			z-index: 1;
		}
	}

	.pk-dex-card-actions {
		padding: 0.5rem;
		display: flex;
		justify-content: space-between;
		position: relative;
		margin-bottom: 6px;

		/* Checkerboard background ::before pseudo-element */
		&::before {
			content: '';
			position: absolute;
			inset: 0;
			background-color: #383842;
			background-image:
				repeating-linear-gradient(
					45deg,
					#5d5d6f 25%,
					transparent 25%,
					transparent 75%,
					#5d5d6f 75%,
					#5d5d6f
				),
				repeating-linear-gradient(
					45deg,
					#5d5d6f 25%,
					#383842 25%,
					#383842 75%,
					#5d5d6f 75%,
					#5d5d6f
				);
			background-position:
				0 0,
				10px 10px;
			background-size: 20px 20px;
			opacity: 0.6;
			z-index: 1;
		}

		/* Buttons bleiben auf normalem z-index und sind nicht von opacity betroffen */
		:global(button) {
			position: relative;
			z-index: 1;
		}

		.pk-dex-create-btn {
			margin: 0 auto;
		}
	}

	/* Dialog Tag Selection Styles */
	.dex-tag-selection {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1rem;
	}

	.tag-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 0.5rem;
		margin: 1rem 0;
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
		background-color: hsla(0, 0%, 20%, 0.3);
		border-radius: 4px;
		border-left: 4px solid hsla(125, 100%, 30%, 0.55);
	}

	.pokemon-count-preview {
		padding: 0.75rem;
		background-color: hsla(200, 100%, 20%, 0.3);
		border-radius: 4px;
		border-left: 4px solid hsla(200, 100%, 50%, 0.8);
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.tag-list {
		color: hsla(125, 100%, 70%, 1);
		font-weight: 500;
	}

	.pokemon-count {
		color: hsla(200, 100%, 70%, 1);
		font-weight: bold;
		font-size: 1.25rem;
	}
</style>
