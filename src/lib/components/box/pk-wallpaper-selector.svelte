<script lang="ts">
	import { type WallpapersType } from '$lib/models/wallpapers-models'
	import { Titles, type TitlesType } from '$lib/models/titles-models'
	import { getBackgroundStyle, setCssPosition } from '$lib/spriteheet-helper'
	import { appState } from '$lib/state/app-state.svelte'
	import PkPagination from '../ui/pk-pagination.svelte'
	import PkPortal from '../ui/pk-portal.svelte'

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

	// Computed property für showTray basierend auf AppState
	let showTray = $derived(appState.isDropdownOpen(id))
	let buttonRef = $state<HTMLElement | null>(null)

	function selectWallpaper(wallpaper: WallpapersType) {
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

	// Pagination setup
	let paginatedData = $state<[string, TitlesType][]>([])
	let currentPage = $state(0)

	function handlePageChange(data: [string, TitlesType][], page: number) {
		paginatedData = data
		currentPage = page
	}

	function getTitlePosition(selectedTitle: TitlesType) {
		return Titles[selectedTitle].pos || { x: 0, y: 0 }
	}
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
	<button onclick={toggleSelectorTray} bind:this={buttonRef}>
		<h2 class="text-huge">{formatBoxTitle(title)}</h2>
	</button>
	{#if appState.isDropdownOpen(id)}
		{@render selectorTray()}
	{/if}
</header>

{#snippet selectorTray()}
	<PkPortal show={showTray} trigger={buttonRef} onClickOutside={handleClickOutside}>
		<section class="pk-selector-tray" bind:this={trayRef}>
			<!-- Wallpaper Options -->
			<div class="wallpaper-grid">
				{#each paginatedData as [key, value]: [string, TitlesType]}
					<button
						class="wallpaper-option"
						onclick={() => {
							selectWallpaper(key.replace('-title', '') as WallpapersType)
						}}
					>
						<img
							src="/spritesheets/util/st1.webp"
							style={setCssPosition(getTitlePosition(key as TitlesType))}
							alt={key}
						/>
					</button>
				{/each}
			</div>

			<PkPagination data={Titles} itemsPerPage={4} onPageChange={handlePageChange} />
		</section>
	</PkPortal>
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
			--header-text-shadow-color: #616161;
			color: #fff;
			text-shadow:
				0px 2px var(--header-text-shadow-color),
				2px 0 var(--header-text-shadow-color),
				2px 2px var(--header-text-shadow-color);
			font-weight: 300;
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
		transform: translateX(-50%);
		top: calc(100% + 26px);

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
