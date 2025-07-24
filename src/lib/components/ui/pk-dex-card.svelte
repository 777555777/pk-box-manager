<script lang="ts">
	import PkProgressBar from './pk-progress-bar.svelte'

	let { dexTitle, dexName, isSelected, counter, onDelete, onSelect, imgUrl } = $props()

	// Deletion state
	let isDeleting = $state(false)
	let cardElement: HTMLElement | undefined

	// Handle dex selection
	function handleDexSelect() {
		if (onSelect) {
			onSelect(dexName)
		}
	}

	// Handle dex reset
	function confirmDelete() {
		if (onDelete) {
			onDelete(isSelected, dexName)
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

<article class="pk-dex-card {isDeleting ? 'deleting' : ''}" bind:this={cardElement}>
	<section class="pk-dex-card-header">
		<div class="pk-dex-card-title">
			<h3 class="text-base">{dexTitle}</h3>
		</div>
	</section>

	<PkProgressBar
		max={counter.limit}
		value={counter.count}
		--value-color={isSelected ? '#61ff61' : '#82829a'}
		--value-secondary-color={isSelected ? '#18c720' : '#75758a'}
	/>

	<section
		class="pk-dex-card-image {!isSelected ? 'unselected' : ''}"
		style="background-image: url({imgUrl})"
	>
		{#if isDeleting}
			{@render confirmDeletion()}
		{:else}
			{@render cardImageStatOverlay()}
		{/if}
	</section>

	<section class="pk-dex-card-actions">
		<!-- Select Button -->
		<button class="pk-button" onclick={handleDexSelect}>Select Dex</button>
		<!-- Delete / Reset Button -->
		<button
			class="pk-button"
			onclick={() => {
				isDeleting = true
			}}
			disabled={counter.limit === 0}
		>
			<img src="/ui/trash-alt-solid.svg" alt="" />
		</button>
	</section>
</article>

{#snippet confirmDeletion()}
	<div class="delete-confirmation">
		<button class="close-button" onclick={cancelDelete}>
			<img src="/ui/x-icon.svg" alt="Schließen" />
		</button>
		<h4>Delete Progress?</h4>
		<div class="delete-actions">
			<a class="danger" href="#top" onclick={confirmDelete}>Delete</a>
		</div>
	</div>
{/snippet}

{#snippet cardImageStatOverlay()}
	{#if counter.limit !== 0}
		<div class="pk-dex-card-overlay">
			<div class="pk-dex-card-stats text-small">
				<div class="stat-item">
					<img src="/ui/tag.svg" alt="Caught" />
					<span>{counter.count}/{counter.limit}</span>
				</div>
				<div class="stat-item">
					<img src="/ui/sparkle.svg" alt="Seen" />
					<span>{counter.shinyCount}/{counter.limit}</span>
				</div>
			</div>
		</div>
	{/if}
{/snippet}

<style>
	.pk-dex-card {
		display: flex;
		flex-direction: column;
		max-height: 290px;
		width: 220px;
		position: relative;
		padding: 1rem 6px 0;

		border-width: 9px solid;
		border-image: url('/ui/textarea-select-default.webp') 9 fill stretch;
		border-image-outset: 0;
		border-image-width: 9px;

		&.deleting {
			background-color: rgba(239, 68, 68, 0.1);
		}

		&:hover {
			.pk-dex-card-image .pk-dex-card-overlay {
				opacity: 1;
			}
		}
	}

	.pk-dex-card-header {
		display: flex;
		align-items: flex-start;
		padding-inline: 0.75rem;
		padding-bottom: 0.5rem;

		.pk-dex-card-title h3 {
			line-height: 1.3;
			height: 2.6em; /* 2 lines height */
			line-clamp: 2; /* maybe remove  */
			overflow: hidden; /* maybe remove  */
			word-wrap: break-word;
			hyphens: auto;
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
		opacity: 0;
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
				color: white;

				img {
					width: 1rem;
					height: 1rem;
					filter: brightness(0) invert(1);
				}
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

		.close-button {
			position: absolute;
			top: 8px;
			right: 8px;
			background-color: rgba(128, 128, 128, 0.5);
			border: none;
			padding: 5px;
			border-radius: 5px;
			display: grid;
			place-items: center;
			transition: background-color 0.2s ease;
			cursor: pointer;

			&:hover {
				background-color: rgba(255, 255, 255, 0.2);
			}

			img {
				width: 1rem;
				height: 1rem;
				filter: brightness(0) invert(1);
			}
		}

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
	}
</style>
