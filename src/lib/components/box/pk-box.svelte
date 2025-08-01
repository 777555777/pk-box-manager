<script lang="ts">
	import { type BoxData } from '$lib/state/storage-handler'
	import PkSlot from '$lib/components/box/pk-slot.svelte'
	import { getBackgroundStyle } from '$lib/spriteheet-helper'
	import { Wallpapers, type WallpapersType } from '$lib/models/wallpapers-models'
	import { Titles, type TitlesType } from '$lib/models/titles-models'
	import PkWallpaperSelector from './pk-wallpaper-selector.svelte'
	import { pkState } from '$lib/state/pk-state.svelte'

	let { box }: { box: BoxData } = $props()

	function updateBoxWallpaper(newWallpaper: WallpapersType) {
		console.log('Updating wallpaper to:', newWallpaper)
		pkState.updateBoxWallpaper(box.id, newWallpaper)
	}

	function getWallpaperSpriteData(wallpaperName: WallpapersType) {
		const wallpaperData = Wallpapers[wallpaperName]

		if (!wallpaperData) {
			console.warn(`Wallpaper data not found for: ${wallpaperName}`)
			// Fallback zu erstem verfügbaren Wallpaper
			const firstWallpaper = Object.keys(Wallpapers)[0] as WallpapersType
			return Wallpapers[firstWallpaper].pos
		}

		return wallpaperData.pos
	}

	// Sprite sheet data
	const boxRows = 8 // 40 wallpapers with 5 columns = 8 rows
	const boxColumns = 5 // column-amount from package.json
	const boxSpriteWidth = 1134
	const boxSpriteHeight = 854
	const boxSpriteData = $derived(getWallpaperSpriteData(box.settings.wallpaper as WallpapersType))
</script>

<article class="pk-box">
	<PkWallpaperSelector
		title={box.title}
		wallpaper={box.settings.wallpaper as WallpapersType}
		onUpdate={updateBoxWallpaper}
	/>
	<div
		class="pk-box-background"
		style={getBackgroundStyle(boxRows, boxColumns, boxSpriteWidth, boxSpriteHeight, boxSpriteData)}
	>
		<div class="box-grid">
			{#each box.pokemon as pokemon}
				<PkSlot pokemonIdentifier={pokemon} />
			{/each}
		</div>
	</div>
</article>

<style>
	:root {
		--source-box-bg-url: url('/boxes/forest.webp');
		--source-box-bg-url: url('/spritesheets/util/sw1.webp');
		--source-title-bg-url: url('/spritesheets/util/st1.webp');
	}

	.pk-box {
		width: fit-content;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
	}

	.pk-box-background {
		box-sizing: border-box;
		image-rendering: pixelated;

		background: var(--source-box-bg-url);
		padding-inline: 13px;
		padding-block: 15px;
	}

	.box-grid {
		box-sizing: content-box;
		display: grid;
		grid-template-columns: repeat(6, 1fr);
		grid-template-rows: repeat(5, 1fr);
		place-items: center;
		height: 100%;
		gap: 1px;
	}
</style>
