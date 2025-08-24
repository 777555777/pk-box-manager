<script lang="ts">
	import PkExport from '$lib/components/toolbox/pk-export.svelte'
	import PkIcon from '$lib/components/ui/pk-icon.svelte'
	import PkProgressBar from '$lib/components/ui/pk-progress-bar.svelte'

	let { dexTitle, dexId, tags, isSelected, counter, onDelete, onSelect, imgUrl } = $props()

	// Deletion state
	let isDeleting = $state(false)
	let selectedTags = $state<string[]>([])
	let cardElement: HTMLElement | undefined

	// Handle dex selection
	function handleDexSelect() {
		// For regular dex cards, just pass the dex ID
		if (onSelect) {
			onSelect(dexId)
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
			<ul class="dex-tags">
				{#each tags as tag}
					{#if tag !== 'normal'}
						<li class={selectedTags.includes(tag) ? 'selected-tag' : ''}>
							{tag}
						</li>
					{/if}
				{/each}
			</ul>
		</div>
	</section>

	<PkProgressBar
		max={counter.totalPokemon}
		value={counter.totalCaughtPokemon}
		--value-color={isSelected ? '#61ff61' : '#82829a'}
		--value-secondary-color={isSelected ? '#18c720' : '#75758a'}
	/>

	<section
		class="pk-dex-card-image {!isSelected ? 'unselected' : ''}"
		style="background-image: url({imgUrl})"
	>
		<!-- Delete Button -->
		<button class="delete-button pk-tooltip" data-tooltip="Reset Pokedex" onclick={toggleDelete}>
			<PkIcon color="#fff" name={'close'} size={16} />
		</button>

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
		<!-- Select Button -->
		<button class="pk-button" onclick={handleDexSelect}> Select Dex </button>
		<!-- Export Button -->
		<PkExport {dexId} hideLabel={true} />
	</section>
</article>

<style>
	.pk-dex-card {
		&.selected {
			border-image: url('/ui/textarea-select-focus.webp') 9 fill stretch;
			border-image-outset: 0;
			border-image-width: 9px;
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

	.pk-dex-card-image {
		&.unselected::after {
			filter: grayscale(1);
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
</style>
