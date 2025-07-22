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
	let showTray = $derived(appState.isDropdownOpen(id))

	// Calculate the height of the selector tray content based on itemsPerPage and iconsPerRow
	let calculatedHeight = $derived.by(() => {
		const buttonSize = 44
		const paginationHeight = 60
		const gap = 16
		const maxRows = Math.ceil(itemsPerPage / iconsPerRow)
		const needsPagination = Object.entries(data).length > itemsPerPage
		const gridHeight = maxRows * buttonSize
		return gridHeight + (needsPagination ? paginationHeight + gap : 0)
	})

	function toggleSelectorTray(event: MouseEvent) {
		event.stopPropagation()

		if (showTray) {
			appState.closeDropdown()
		} else {
			appState.openDropdown(id)
		}
	}

	function handleClickOutside(event: MouseEvent) {
		if (trayRef && !trayRef.contains(event.target as Node)) {
			appState.closeDropdown()
		}
	}

	function handleItemUpdate(value: any) {
		onUpdate(value)
		appState.closeDropdown() // Schließe nach Auswahl
	}

	$effect(() => {
		if (showTray) {
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
           --icons-per-row: {iconsPerRow};
           --icon-scale-factor: {iconTargetSize / iconOriginalSize};"
>
	{#if label}
		<label for={id}>{label}</label>
	{/if}
	<button {id} class="pk-button" onclick={toggleSelectorTray} {disabled}>
		<img src={spriteUrl} style={setCssPosition(getPosition(selectedItem))} alt={selectedItem} />
	</button>
	{#if showTray}
		<section class="pk-selector-tray" bind:this={trayRef}>
			<PkIconGrid
				{data}
				{getPosition}
				{spriteUrl}
				{itemsPerPage}
				{disabled}
				onUpdate={handleItemUpdate}
				{activeItems}
				showBackground={false}
				alwaysActive={true}
				fixedHeight={true}
				--icons-per-row={iconsPerRow}
				--icon-original-size={iconOriginalSize}
				--icon-target-size={iconTargetSize}
				--icon-scale-factor={iconTargetSize / iconOriginalSize}
				--calculated-height={calculatedHeight}
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
		}
	}

	.pk-selector-tray {
		background-color: transparent;
		width: fit-content;
		padding: 6px;

		position: absolute;
		z-index: 2;

		image-rendering: pixelated;
		border-width: 9px solid;
		border-image: url('/ui/textarea-select-default.webp') 9 fill stretch;
		border-image-outset: 0;
		border-image-width: 9px;

		:global(.pk-pagination) {
			padding: 0.5rem;
		}
		:global(img) {
			image-rendering: pixelated;
		}
	}
</style>
