<script lang="ts">
	import { type BoxOrder } from '$lib/state/storage-handler'
	import PkSlot from '$lib/components/box/pk-slot.svelte'
	import { getBackgroundStyle, getIdentifier } from '$lib/spriteheet-helper'
	import { Wallpapers, type WallpapersType } from '$lib/models/wallpapers-models'
	import { Titles, type TitlesType } from '$lib/models/titles-models'
	import PkWallpaperSelector from './pk-wallpaper-selector.svelte'

	let { box }: { box: BoxOrder } = $props()

	function updateBoxWallpaper(newWallpaper: WallpapersType) {
		console.log('updated wallpaper', newWallpaper)
		// todo proper implementation
	}

	// Sprite sheet data
	const boxRows = 6
	const boxColumns = 4
	const boxSpriteWidth = 1134
	const boxSpriteHeight = 854
	const boxSpriteData = Wallpapers[box.wallpaper as WallpapersType].pos

	// Sprite sheet data
	const titleRows = 6
	const titleColumns = 4
	const titleSpriteWidth = 812
	const titleSpriteHeight = 161
	const titleSpriteData = Titles[`${box.wallpaper}-title` as TitlesType].pos
</script>

<article class="pk-box">
	<PkWallpaperSelector
		title={box.title}
		wallpaper={box.wallpaper as WallpapersType}
		onUpdate={updateBoxWallpaper}
	/>
	<div
		class="pk-box-background"
		style={getBackgroundStyle(boxRows, boxColumns, boxSpriteWidth, boxSpriteHeight, boxSpriteData)}
	>
		<div class="box-grid">
			{#each box.pokemon as pokemon (getIdentifier(pokemon))}
				<PkSlot pokemonEntry={pokemon} />
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
