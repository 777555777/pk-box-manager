<script lang="ts">
	import { type WallpapersType } from '$lib/models/wallpapers-models'
	import { Titles, type TitlesType } from '$lib/models/titles-models'
	import { getBackgroundStyle, setCssPosition } from '$lib/spriteheet-helper'
	import { appState } from '$lib/state/app-state.svelte'

	let {
		title,
		wallpaper,
		onUpdate = () => {},
		id = crypto.randomUUID()
	}: {
		title: string
		wallpaper: WallpapersType
		onUpdate: Function
		id?: string
	} = $props()

	let trayRef = $state<HTMLElement | null>(null)
	let currentPage = $state(0)
	const itemsPerPage = 4

	// Computed property für showTray basierend auf AppState
	let showTray = $derived(appState.isDropdownOpen(id))

	// Pagination logic
	const allTitles = $derived(Object.entries(Titles))
	const totalPages = $derived(Math.ceil(allTitles.length / itemsPerPage))
	const paginatedTitles = $derived(() => {
		const startIndex = currentPage * itemsPerPage
		return allTitles.slice(startIndex, startIndex + itemsPerPage)
	})

	function selectWallpaper(wallpaper: WallpapersType) {
		console.log(wallpaper)
		onUpdate(wallpaper)
		appState.closeDropdown() // Dropdown schließen nach Auswahl
	}

	function formatBoxTitle(title: string): string {
		const boxTitle = title.replace(/_/g, ' ').replace(/-/g, ' ')
		return boxTitle.charAt(0).toUpperCase() + boxTitle.slice(1)
	}

	function getTitleSpriteData(wallpaperName: WallpapersType) {
		const titleKey = `${wallpaperName}-title` as TitlesType
		const titleData = Titles[titleKey]

		if (!titleData) {
			console.warn(`Title data not found for wallpaper: ${wallpaperName}, looking for: ${titleKey}`)
			// Fallback zu erstem verfügbaren Titel
			const firstTitle = Object.keys(Titles)[0] as TitlesType
			return Titles[firstTitle].pos
		}

		return titleData.pos
	}

	function handleClickOutside(event: MouseEvent) {
		if (trayRef && !trayRef.contains(event.target as Node)) {
			appState.closeDropdown()
		}
	}

	function toggleSelectorTray(event: MouseEvent) {
		event.stopPropagation() // Verhindert, dass der Click Outside Handler ausgelöst wird

		if (showTray) {
			// Wenn dieses Dropdown bereits offen ist, schließe es
			appState.closeDropdown()
		} else {
			// Öffne dieses Dropdown (schließt automatisch andere)
			appState.openDropdown(id)
			// Reset to first page when opening
			// currentPage = 0
		}
	}

	function nextPage() {
		if (currentPage < totalPages - 1) {
			currentPage++
		}
	}

	function prevPage() {
		if (currentPage > 0) {
			currentPage--
		}
	}

	$effect(() => {
		if (showTray) {
			// Fügt den Event Listener hinzu wenn das Tray sichtbar ist
			document.addEventListener('click', handleClickOutside)
		}

		return () => {
			// Cleanup: Entfernt den Event Listener
			document.removeEventListener('click', handleClickOutside)
		}
	})

	// Sprite sheet data
	const titleRows = 10 // 40 titles with 4 columns = 10 rows
	const titleColumns = 4 // column-amount from package.json
	const titleSpriteWidth = 812
	const titleSpriteHeight = 161
	const titleSpriteData = $derived(getTitleSpriteData(wallpaper))
</script>

<header
	class="box-header"
	style={getBackgroundStyle(
		titleRows,
		titleColumns,
		titleSpriteWidth,
		titleSpriteHeight,
		titleSpriteData
	)}
>
	<button onclick={toggleSelectorTray}>
		<h2>{formatBoxTitle(title)}</h2>
	</button>
	{#if appState.isDropdownOpen(id)}
		{@render selectorTray()}
	{/if}
</header>

{#snippet selectorTray()}
	<section class="pk-selector-tray" bind:this={trayRef}>
		<!-- Wallpaper Options -->
		<div class="wallpaper-grid">
			{#each paginatedTitles() as [name, data]}
				<button
					class="wallpaper-option"
					onclick={() => {
						selectWallpaper(name.replace('-title', '') as WallpapersType)
					}}
				>
					<img src="/spritesheets/util/st1.webp" style={setCssPosition(data.pos)} alt={name} />
				</button>
			{/each}
		</div>

		<!-- Pagination Controls -->
		<div class="pagination-controls">
			<button
				class="pagination-btn"
				onclick={prevPage}
				disabled={currentPage === 0}
				aria-label="Previous page"
			>
				<img src="/ui/pagination-arrow.png" alt="Previous" loading="lazy" />
			</button>
			<span class="page-indicator">
				{currentPage + 1} / {totalPages}
			</span>
			<button
				class="pagination-btn"
				onclick={nextPage}
				disabled={currentPage === totalPages - 1}
				aria-label="Next page"
			>
				<img src="/ui/pagination-arrow.png" alt="Next" loading="lazy" />
			</button>
		</div>
	</section>
{/snippet}

<style>
	.box-header {
		box-sizing: border-box;
		image-rendering: pixelated;

		background: var(--source-title-bg-url);
		width: 258px;
		height: 52px;

		/* center headline */
		display: flex;
		align-items: center;
		justify-content: center;

		position: relative;
		button {
			background-color: transparent;
			border: none;
			cursor: pointer;
			width: 100%;
			height: 100%;

			&:hover {
				background-color: rgba(255, 255, 255, 0.15);
			}
		}

		h2 {
			font-size: 1.4rem;
			color: #fff;
			text-shadow: 0 0 5px #000;
		}
	}

	.pk-selector-tray {
		--original-width: 812;
		--original-height: 161;
		--target-width: calc(var(--original-width) / 4);
		--target-height: calc(var(--original-height) / 4);
		--scale-factor-x: calc(var(--target-width) / var(--original-width));
		--scale-factor-y: calc(var(--target-height) / var(--original-height));

		--column-amount: 1;
		--button-size: 203px;

		width: fit-content;
		padding: 12px;

		/* Position below trigger Button */
		position: absolute;
		top: 100%;
		z-index: 2;

		/* Styling */
		image-rendering: pixelated;
		border-width: 9px solid;
		border-image: url('/ui/textarea-select-default.webp') 9 fill stretch;
		border-image-outset: 0;
		border-image-width: 9px;

		/* Layout */
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.pagination-controls {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 2rem;

		button {
			max-width: 3rem;
			border-radius: 5px;
			display: grid;
			place-items: center;
		}
		button:last-child {
			transform: scaleX(-1);
		}
	}

	.pagination-btn {
		color: white;
		padding: 4px 8px;
		cursor: pointer;

		&:hover:not(:disabled) {
			img {
				filter: brightness(1.5);
			}
		}

		&:focus-visible {
			outline: 3px solid hsl(220, 100%, 65%);
		}

		&:disabled {
			img {
				filter: grayscale(1);
			}
			cursor: not-allowed;
		}
	}

	.page-indicator {
		color: white;
		min-width: 4rem;
		text-align: center;
	}

	.wallpaper-grid {
		display: grid;
		grid-template-columns: repeat(var(--column-amount), var(--button-size));
		gap: 4px;
		place-items: center;
	}

	.wallpaper-option {
		cursor: pointer;
		max-width: calc(var(--target-width) * 1px);
		max-height: calc(var(--target-height) * 1px);
		overflow: hidden;
		background-color: transparent !important; /* Override .box-header button hover */

		&:hover {
			filter: brightness(1.15);
		}

		&:active {
			filter: brightness(0.85);
		}

		&:focus-visible {
			outline: 3px solid hsl(220, 100%, 65%);
		}

		img {
			width: calc(var(--original-width) * 1px);
			height: calc(var(--original-height) * 1px);
			object-fit: none;
			transform: scaleX(var(--scale-factor-x)) scaleY(var(--scale-factor-y));
			transform-origin: top left;
		}
	}
</style>
