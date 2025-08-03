<script lang="ts">
	import { setCssPosition } from '$lib/spriteheet-helper'
	import { appState } from '$lib/state/app-state.svelte'
	import PkIconGrid from './pk-icon-grid.svelte'

	let {
		label = '',
		onUpdate = () => {},
		data, // Die Daten (z.B. Balls, Ribbons, Marks)
		getPosition, // Funktion zum Ermitteln der Sprite-Position
		spriteUrl, // URL zum Spritesheet
		selectedItem,
		activeItems = new Set(),
		disabled = false,
		itemsPerPage = 42,
		iconsPerRow = 7,
		iconOriginalSize = 30,
		iconTargetSize = 44,
		id = crypto.randomUUID()
	}: {
		label?: string
		onUpdate: (value: any) => void
		data: Record<string, any>
		getPosition: (key: string) => { x: number; y: number }
		spriteUrl: string
		selectedItem: string
		activeItems?: Set<string>
		disabled?: boolean
		itemsPerPage?: number
		iconsPerRow?: number
		iconOriginalSize?: number
		iconTargetSize?: number
		id?: string
	} = $props()

	let trayRef = $state<HTMLElement | null>(null)
	let buttonRef = $state<HTMLElement | null>(null)
	let showTray = $derived(appState.isDropdownOpen(id))

	function toggleSelectorTray(event: MouseEvent) {
		event.stopPropagation()

		if (showTray) {
			appState.closeDropdown()
		} else {
			appState.openDropdown(id)
		}
	}

	function handleClickOutside(event: MouseEvent) {
		if (
			trayRef &&
			!trayRef.contains(event.target as Node) &&
			!buttonRef?.contains(event.target as Node)
		) {
			appState.closeDropdown()
		}
	}

	function handleItemUpdate(value: any) {
		onUpdate(value)
		appState.closeDropdown() // Schließe nach Auswahl
	}

	$effect(() => {
		if (trayRef && showTray) {
			document.addEventListener('click', handleClickOutside)
		}

		return () => {
			document.removeEventListener('click', handleClickOutside)
		}
	})
</script>

<div
	class="pk-picker-selector"
	style="--icon-target-size: {iconTargetSize};
           --icon-original-size: {iconOriginalSize};
           --icon-scale-factor: {iconTargetSize / iconOriginalSize};"
>
	{#if label}
		<label for={id}>{label}</label>
	{/if}
	<button {id} class="pk-button" onclick={toggleSelectorTray} {disabled} bind:this={buttonRef}>
		<img src={spriteUrl} style={setCssPosition(getPosition(selectedItem))} alt={selectedItem} />
	</button>
	{#if showTray}
		<section class="pk-selector-tray" bind:this={trayRef}>
			<div class="pk-selector-header">
				{#if label}
					<h3 class="text-large">{label}</h3>
				{/if}
				<button class="pk-button pk-close-btn" onclick={() => appState.closeDropdown()}>
					<span>✕</span>
				</button>
			</div>
			<PkIconGrid
				{data}
				{getPosition}
				{spriteUrl}
				{itemsPerPage}
				{iconsPerRow}
				{disabled}
				onUpdate={handleItemUpdate}
				{activeItems}
				showBackground={false}
				alwaysActive={true}
				fixedHeight={true}
				--icon-original-size={iconOriginalSize}
				--icon-target-size={iconTargetSize}
				--icon-scale-factor={iconTargetSize / iconOriginalSize}
			/>
		</section>
	{/if}
</div>

<style>
	.pk-picker-selector {
		position: relative;
	}

	button {
		width: 44px;
		height: 44px;
		padding: 0;
		display: flex;
		justify-content: center;
		align-items: center;

		img {
			image-rendering: pixelated;
			object-fit: none;
			width: calc(var(--icon-original-size) * 1px);
			height: calc(var(--icon-original-size) * 1px);
			transform: scale(var(--icon-scale-factor));
			margin-bottom: 2px;
		}
	}

	.pk-selector-tray {
		background-color: transparent;
		width: fit-content;
		padding: 6px;

		position: fixed;
		z-index: 20;

		border-width: 9px solid;
		border-image: url('/ui/textarea-select-default.webp') 9 fill stretch;
		border-image-outset: 0;
		border-image-width: 9px;
	}

	.pk-selector-header {
		display: none;
	}

	.pk-close-btn {
		min-width: 44px;
		padding: 0 !important;
	}

	/* Mobile Fullscreen Layout */
	@media (max-width: 768px) {
		.pk-selector-tray {
			/* Fullscreen overlay */
			position: fixed;
			top: 0;
			left: 0;
			width: 100vw;
			height: 100vh;
			max-width: none;
			max-height: none;

			/* Background */
			background-color: var(--ui-section-background-color);
			border: none;
			border-radius: 0;

			/* Layout */
			display: flex;
			flex-direction: column;
			padding: 1rem;

			/* Scrolling */
			overflow-y: auto;

			/* Remove border styling */
			border-image: none;
		}

		.pk-selector-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 1rem;
			flex-shrink: 0;
		}

		.pk-selector-tray :global(.container-grid) {
			flex: 1;
			height: 100%;
			padding: 0;
		}

		.pk-selector-tray :global(.pk-icon-grid) {
			/* Mobile: More columns for better space usage */
			grid-template-columns: repeat(6, 1fr) !important;
			gap: 0.75rem;
			padding: 0;
			border: none;
			height: auto;
			min-height: 0;
		}
	}

	/* Sehr kleine Bildschirme */
	@media (max-width: 480px) {
		.pk-selector-tray :global(.pk-icon-grid) {
			grid-template-columns: repeat(5, 1fr) !important;
			gap: 0.5rem;
		}

		.pk-selector-header h3 {
			font-size: var(--base-font-size);
		}
	}
</style>
