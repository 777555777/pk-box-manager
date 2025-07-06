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

	// Computed property für showTray basierend auf AppState
	let showTray = $derived(appState.isDropdownOpen(id))

	function selectWallpaper(wallpaper: WallpapersType) {
		console.log(wallpaper)
		onUpdate(wallpaper)
		appState.closeDropdown() // Dropdown schließen nach Auswahl
	}

	function formatBoxTitle(title: string): string {
		const boxTitle = title.replace(/_/g, ' ').replace(/-/g, ' ')
		return boxTitle.charAt(0).toUpperCase() + boxTitle.slice(1)
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
	const titleRows = 6
	const titleColumns = 4
	const titleSpriteWidth = 812
	const titleSpriteHeight = 161
	const titleSpriteData = $derived(Titles[`${wallpaper}-title` as TitlesType].pos)
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
		{#each Object.entries(Titles) as [name, data]}
			<button
				onclick={() => {
					selectWallpaper(name.replace('-title', '') as WallpapersType)
				}}
			>
				<!-- <p>{name}</p> -->
				<img src="/spritesheets/util/st1.webp" style={setCssPosition(data.pos)} alt={name} />
			</button>
		{/each}
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
			/* display: flex; */
			/* align-items: center; */
			/* justify-content: center; */

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
		--target-width: calc(812 / 4);
		--target-height: calc(161 / 4);
		--original-width: 812;
		--original-height: 161;
		--scale-factor-x: calc(var(--target-width) / var(--original-width));
		--scale-factor-y: calc(var(--target-height) / var(--original-height));

		--ball-amount: 2;
		--ball-size: 203px;

		background-color: #717186;
		width: fit-content;
		padding: 8px;

		/* Positioning */
		display: grid;
		grid-template-columns: repeat(var(--ball-amount), var(--ball-size));
		place-items: center;

		/* Position below trigger Button */
		position: absolute;
		top: 100%;
		z-index: 2;

		/* ======================== */
		background-color: transparent;
		image-rendering: pixelated;
		cursor: text;

		border-width: 9px solid;
		border-image: url('/ui/textarea-select-default.webp') 9 fill stretch;
		border-image-outset: 0;
		border-image-width: 9px;

		button {
			background-color: transparent;
			cursor: pointer;

			max-width: calc(var(--target-width) * 1px);
			max-height: calc(var(--target-height) * 1px);

			&:hover {
				filter: brightness(1.15);
				background-color: hsla(0, 0%, 100%, 0.175);
			}

			&:active {
				filter: brightness(0.9);
				background-color: hsla(0, 0%, 100%, 0.1);
			}

			&:focus-visible {
				outline: 3px solid hsl(220, 100%, 65%);
			}
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
