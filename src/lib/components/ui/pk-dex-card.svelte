<script lang="ts">
	import PkExport from '$lib/components/toolbox/pk-export.svelte'
	import PkIcon from '$lib/components/ui/pk-icon.svelte'
	import PkProgressBar from '$lib/components/ui/pk-progress-bar.svelte'
	import { formatTagName } from '$lib/init-dex-helper'
	import { appState } from '$lib/state/app-state.svelte'
	import PkDialog, { type PkDialogElement } from './pk-dialog.svelte'

	let {
		dexTitle,
		dexSaveId,
		tags,
		isSelected,
		counter,
		onDelete,
		onReset,
		onSelect,
		onUpdateName,
		imgUrl,
		isSystemDefault = false
	} = $props()

	let editNameDialog: PkDialogElement

	// Deletion state
	let isDeleting = $state(false)
	let selectedTags = $state<string[]>([])

	// Edit name state
	let newName = $state(dexTitle)

	// Context menu handling via appState
	const contextMenuId = `context-${dexSaveId}`
	let contextVisible = $derived(appState.isDropdownOpen(contextMenuId))
	let cardElement: HTMLElement | undefined

	function editDisplayName() {
		// Reset input to current title and show dialog
		newName = dexTitle
		editNameDialog.showDialog()
	}

	function handleNameUpdate() {
		// Validate the new name
		const trimmedName = newName.trim()
		if (trimmedName && trimmedName !== dexTitle) {
			// Call the parent's update function
			if (onUpdateName) {
				onUpdateName(dexSaveId, trimmedName)
			}
		}
	}

	// Handle dex selection
	function handleDexSelect() {
		// For regular dex cards, just pass the dex ID
		if (onSelect) {
			onSelect(dexSaveId)
		}
	}

	// More direct function to show delete overlay
	function showDeleteOverlay() {
		isDeleting = true
	}
	function toggleContextMenu() {
		if (contextVisible) {
			appState.closeDropdown()
		} else {
			appState.openDropdown(contextMenuId)
		}
	}

	// Handle dex reset
	function confirmDelete() {
		if (onDelete) {
			onDelete(dexSaveId)
		}
		isDeleting = false
	}

	// Handle dex reset
	function confirmReset() {
		if (onReset) {
			onReset(dexSaveId)
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

		// Close context menu when clicking outside
		if (contextVisible && cardElement && !cardElement.contains(event.target as Node)) {
			appState.closeDropdown()
		}
	}

	// Add/remove event listener when delete state or context menu changes
	$effect(() => {
		if (isDeleting || contextVisible) {
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
			<div class="pk-title-row">
				<h3 class="text-base" style={isSelected ? 'color: var(--ui-text-active);' : ''}>
					{dexTitle}
				</h3>
				<!-- Delete Button -->
				<button class="delete-button" onclick={toggleContextMenu}>
					<PkIcon color="#fff" name={'options'} size={16} />
				</button>
			</div>
			{#if contextVisible}
				<div class="pk-context-menu">
					<ul>
						<li>
							<button
								onclick={(event) => {
									event.stopPropagation()
									appState.closeDropdown()
									showDeleteOverlay()
								}}
							>
								<PkIcon color="#fff" name={'close'} size={16} />
								Delete or reset
							</button>
						</li>
						<li>
							<button
								onclick={(event) => {
									event.stopPropagation()
									appState.closeDropdown()
									editDisplayName()
								}}
							>
								<PkIcon color="#fff" name={'pen'} size={16} />
								Edit name</button
							>
						</li>
					</ul>
				</div>
			{/if}

			<!-- Active Tags list -->
			<ul class="dex-tags">
				{#each tags as tag}
					{#if tag !== 'normal'}
						<li class={selectedTags.includes(tag) ? 'selected-tag' : ''}>
							{formatTagName(tag)}
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
		{#if isDeleting}
			<!-- Delete Overlay -->
			<div class="delete-confirmation">
				{#if !isSystemDefault}
					<h4>Delete or Reset Pokedex?</h4>
					<div class="delete-actions">
						<a class="danger" href="#top" onclick={confirmDelete}>Delete</a>
						<a class="danger" href="#top" onclick={confirmReset}>Reset</a>
					</div>
				{:else}
					<h4>This Pokedex is the system default and can only be reset</h4>
					<div class="delete-actions">
						<a class="danger" href="#top" onclick={confirmReset}>Reset</a>
					</div>
				{/if}
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
		<PkExport {dexSaveId} hideLabel={true} />
	</section>
</article>

{#snippet editNameDialogContent()}
	<!-- Edit Name Dialog Content -->
	<div class="dex-name-input">
		<label for="edit-name-input" class="text-base">New Name</label>
		<input
			id="edit-name-input"
			class="pk-textarea"
			type="text"
			bind:value={newName}
			placeholder="Enter new Pokedex name"
			maxlength="18"
		/>
	</div>
{/snippet}

<PkDialog
	bind:this={editNameDialog}
	headline="Edit Pokedex Name"
	dialogContent={editNameDialogContent}
	onConfirm={handleNameUpdate}
	onCancel={() => {}}
	okBtnText="Save"
	cancelBtnText="Cancel"
	size="S"
/>

<style>
	.pk-dex-card {
		display: flex;
		flex-direction: column;
		height: 320px;
		width: 240px;
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
		min-height: 80px;
		.pk-dex-card-title {
			min-height: 3.5rem;
			width: 100%;

			h3 {
				line-height: 1.3;
				padding-block: 0.5rem;
				word-wrap: break-word;
				hyphens: auto;
			}
		}
	}

	.pk-dex-card-image {
		background-size: cover;
		background-position: center;
		width: 100%;
		height: 100%;
		position: relative;
		image-rendering: auto;

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
		}
	}

	.dex-name-input {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

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
		flex-wrap: nowrap;
		gap: 0.5rem;
		overflow-x: auto;
		overflow-y: hidden;
		scrollbar-width: none;

		li {
			list-style: none;
			background-color: rgba(255, 255, 255, 0.1);
			border-radius: 5px;
			padding: 0.25rem 0.5rem;
			font-size: 0.875rem;
			user-select: none;
			flex-shrink: 0; /* Verhindert Zusammendrücken der Tags */
			white-space: nowrap; /* Verhindert Textumbruch innerhalb der Tags */
		}
	}

	.pk-context-menu {
		position: absolute;
		right: -154px;
		top: 16px;

		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
		padding: 0.325rem;
		z-index: 10;

		background-color: rgb(21, 21, 21, 1);
		border: 2px solid #272727;
		border-radius: 5px;

		li {
			display: flex;
			align-items: center;
			gap: 0.25rem;
			background-color: rgb(21, 21, 21, 1);
			border-radius: 5px;

			button {
				display: block;
				background: transparent;
				border: none;
				width: 100%;
				padding: 0.325rem 0.5rem;
				border-radius: 5px;
				color: white;
				text-align: left;
				cursor: pointer;
			}

			&:hover {
				background-color: hsla(0, 0%, 100%, 0.15);
			}
		}
	}

	.pk-title-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.delete-button {
		background-color: rgba(128, 128, 128, 0.65);
		border: none;
		padding: 5px;
		border-radius: 5px;
		display: grid;
		place-items: center;
		transition: background-color 0.2s ease;
		cursor: pointer;
		z-index: 1;

		&:hover:not(:disabled) {
			background-color: rgba(185, 185, 185, 0.75);
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
			rgba(0, 0, 0, 0.9) 0%,
			rgba(0, 0, 0, 0.5) 70%,
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

		h4 {
			text-align: center;
			padding-inline: 1.5rem;
		}

		.delete-actions {
			display: flex;
			gap: 1.5rem;

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

	@media (max-width: 768px) {
		.pk-context-menu {
			right: 18px;
			top: 44px;
		}
	}
</style>
