<script lang="ts">
	import PkExport from '$lib/components/toolbox/pk-export.svelte'
	import PkIcon from '$lib/components/ui/pk-icon.svelte'
	import PkProgressBar from '$lib/components/ui/pk-progress-bar.svelte'
	import PkDialog, { type PkDialogElement } from './pk-dialog.svelte'
	import PkToggle from './pk-toggle.svelte'
	import type { BoxTags, DexConfig } from '$lib/models/data-models'
	import { getAllPossibleTags, getDexConfig } from '$lib/data/pokedex-config-utils'
	import { dexPresets } from '$lib/data/pokedex'

	let {
		dexTitle,
		dexId,
		tags,
		isSelected,
		isPreset = false,
		counter,
		onDelete,
		onSelect,
		imgUrl
	} = $props()

	// Deletion state
	let isDeleting = $state(false)
	let selectedTags = $state<string[]>([])
	let cardElement: HTMLElement | undefined
	let configurationDialog: PkDialogElement

	// Tag toggle functionality for presets
	let allTags = getAllPossibleTags()
	let optionalTags = allTags.filter((tag) => tag !== 'normal')
	let tagStates = $state<Record<string, boolean>>({})

	// Initialize tag states - default to true (all selected)
	for (const tag of optionalTags) {
		tagStates[tag] = true
	}

	let activeTags = $derived.by<BoxTags[]>(() => {
		// Always include 'normal', plus any selected optional tags
		const selectedOptionalTags = Object.entries(tagStates)
			.filter(([_, active]) => active)
			.map(([tag, _]) => tag as BoxTags)
		return ['normal' as BoxTags, ...selectedOptionalTags]
	})

	// Handle dex selection
	function handleDexSelect() {
		if (isPreset) {
			// For preset cards, pass the selected preset and active tags
			const selectedPreset = Object.values(dexPresets).find(
				(preset) => preset.id === dexId
			) as DexConfig
			if (onSelect && selectedPreset) {
				onSelect(selectedPreset, activeTags)
			}
		} else {
			// For regular dex cards, just pass the dex ID
			if (onSelect) {
				onSelect(dexId)
			}
		}
	}

	// Handle delete toggle
	function toggleDelete() {
		isDeleting = !isDeleting
	}

	// Handle dex reset
	function confirmDelete() {
		if (onDelete) {
			onDelete(isSelected, dexId)
		}
		isDeleting = false
	}

	function cancelDelete() {
		isDeleting = false
	}

	// ================================================================================

	// Close delete confirmation when clicking outside
	function handleClickOutside(event: MouseEvent) {
		if (isDeleting && cardElement && !cardElement.contains(event.target as Node)) {
			cancelDelete()
		}
	}

	// Add/remove event listener when delete state changes
	$effect(() => {
		if (isDeleting) {
			document.addEventListener('click', handleClickOutside)
		} else {
			document.removeEventListener('click', handleClickOutside)
		}

		// Cleanup on component destroy
		return () => {
			document.removeEventListener('click', handleClickOutside)
		}
	})
</script>

<article
	class="pk-dex-card {isDeleting ? 'deleting' : ''} {isSelected ? 'selected' : ''}"
	bind:this={cardElement}
>
	<section class="pk-dex-card-header">
		<div class="pk-dex-card-title">
			<h3 class="text-base">{dexTitle}</h3>
			<!-- {#if !isPreset} -->
			<ul class="dex-tags">
				{#each tags as tag}
					{#if tag !== 'normal'}
						<li class={selectedTags.includes(tag) ? 'selected-tag' : ''}>
							{tag}
						</li>
					{/if}
				{/each}
			</ul>
			<!-- {/if} -->
		</div>
	</section>

	{#if !isPreset}
		<PkProgressBar
			max={counter.totalPokemon}
			value={counter.totalCaughtPokemon}
			--value-color={isSelected ? '#61ff61' : '#82829a'}
			--value-secondary-color={isSelected ? '#18c720' : '#75758a'}
		/>
	{/if}

	<section
		class="pk-dex-card-image {!isSelected ? 'unselected' : ''}"
		style="background-image: url({imgUrl})"
	>
		{#if !isPreset}
			<!-- Delete Button -->
			<button class="delete-button pk-tooltip" data-tooltip="Reset Pokedex" onclick={toggleDelete}>
				<PkIcon color="#fff" name={'close'} size={16} />
			</button>
		{/if}

		{#if isDeleting}
			<!-- Delete Overlay -->
			<div class="delete-confirmation">
				<h4>Delete Progress?</h4>
				<div class="delete-actions">
					<a class="danger" href="#top" onclick={confirmDelete}>Delete</a>
				</div>
			</div>
		{:else if counter.totalPokemon !== 0}
			<!-- Counter Overlay -->
			<div class="pk-dex-card-overlay">
				<div class="pk-dex-card-stats text-small">
					<div class="stat-item">
						<PkIcon color="#fff" name={'tag'} size={16} />
						<span>{counter.totalCaughtPokemon}/{counter.totalPokemon}</span>
					</div>
					<div class="stat-item">
						<PkIcon color="#fff" name={'sparkles-solid'} size={16} />
						<span>{counter.totalShinyPokemon}/{counter.totalPokemon}</span>
					</div>
				</div>
			</div>
		{/if}
	</section>

	<section class="pk-dex-card-actions">
		{#if isPreset}
			<!-- Select Button -->
			<button
				class="pk-button pk-dex-create-btn"
				onclick={() => {
					configurationDialog.showDialog()
				}}
			>
				Create new Pokedex
			</button>
		{:else}
			<!-- Select Button -->
			<button class="pk-button" onclick={handleDexSelect}> Select Dex </button>
			<!-- Export Button -->
			<PkExport {dexId} hideLabel={true} />
		{/if}
	</section>
</article>

{#snippet dexConfigurationContent()}
	<div class="dex-tag-selection">
		<p class="text-small">Select which variants to include in your Pokédex:</p>
		<div class="tag-grid">
			{#each optionalTags as tag}
				<div class="tag-toggle-item">
					<PkToggle
						label={tag}
						activeColor="hsla(125, 100%, 30%, 0.55)"
						bind:checked={tagStates[tag]}
						tooltip="Include {tag} variants"
					/>
				</div>
			{/each}
		</div>
		<div class="active-tags-preview">
			<strong>Include variants:</strong>
			<span class="tag-list"
				>{activeTags.filter((tag) => tag !== 'normal').join(', ') || 'Base Pokemon only'}</span
			>
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
		&.selected {
			border-image: url('/ui/textarea-select-focus.webp') 9 fill stretch;
			border-image-outset: 0;
			border-image-width: 9px;
		}

		.pk-dex-card-actions button {
			position: relative;
			z-index: 2; /* Über dem Overlay */
		}

		&.deleting {
			background-color: rgba(239, 68, 68, 0.1);
		}

		&:hover {
			.pk-dex-card-image .pk-dex-card-overlay {
				opacity: 1;
			}
		}
	}

	.dex-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;

		li {
			list-style: none;
			background-color: rgba(255, 255, 255, 0.1);
			border-radius: 5px;
			padding: 0.25rem 0.5rem;
			font-size: 0.875rem;
			user-select: none;
		}
	}

	.delete-button {
		position: absolute;
		top: 8px;
		right: 8px;
		background-color: rgba(128, 128, 128, 0.65);
		border: none;
		padding: 5px;
		border-radius: 5px;
		display: grid;
		place-items: center;
		transition: background-color 0.2s ease;
		cursor: pointer;
		z-index: 10;

		&:hover:not(:disabled) {
			background-color: rgba(128, 128, 128, 0.5);
		}

		&:disabled {
			background-color: rgba(128, 128, 128, 0.5);
			opacity: 0.5;
			cursor: not-allowed;
		}
	}

	.pk-dex-card-header {
		display: flex;
		align-items: flex-start;
		padding-inline: 0.75rem;
		padding-block: 0.5rem;

		.pk-dex-card-title {
			min-height: 3.5rem;

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

		/* Grayscale filter only for background image when unselected */
		&.unselected::after {
			filter: grayscale(1);
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

	.pk-dex-card-overlay {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		background: linear-gradient(
			to top,
			rgba(0, 0, 0, 0.8) 0%,
			rgba(0, 0, 0, 0.4) 70%,
			transparent 100%
		);
		padding: 0.75rem;
		opacity: 1; /* set to 0 to only show on hover */
		z-index: 2;
		transition: opacity 0.3s ease;

		.pk-dex-card-stats {
			display: flex;
			justify-content: space-between;
			gap: 0.5rem;

			.stat-item {
				display: flex;
				align-items: center;
				gap: 0.25rem;
				color: rgb(235, 235, 235);
			}
		}
	}

	.delete-confirmation {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		height: 100%;
		background: rgba(239, 68, 68, 0.9);
		gap: 0.5rem;
		position: relative;
		z-index: 2;
		cursor: text;

		.delete-actions {
			display: flex;
			gap: 0.5rem;

			.danger {
				color: var(--ui-text-color);
				text-align: center;
				padding: 0.175rem;
				cursor: pointer;
				text-decoration: underline;

				&:hover {
					border-radius: 5px;
					background-color: rgba(255, 255, 255, 0.2);
				}
			}
		}
	}

	.pk-dex-card-actions {
		padding: 0.75rem;
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

	.active-tags-preview {
		padding: 0.75rem;
		background-color: hsla(0, 0%, 20%, 0.3);
		border-radius: 4px;
		border-left: 4px solid hsla(125, 100%, 30%, 0.55);
	}

	.tag-list {
		color: hsla(125, 100%, 70%, 1);
		font-weight: 500;
	}
</style>
