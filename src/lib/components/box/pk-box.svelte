<script lang="ts">
	import { type BoxOrder } from '$lib/state/storage-handler'
	import PkSlot from '$lib/components/box/pk-slot.svelte'
	import { getBackgroundStyle, getIdentifier } from '$lib/spriteheet-helper'
	import { Wallpapers, type WallpapersType } from '$lib/models/wallpapers-models'
	import { Titles, type TitlesType } from '$lib/models/titles-models'

	let { box }: { box: BoxOrder } = $props()

	function formatBoxTitle(title: string): string {
		const boxTitle = title.replace(/_/g, ' ').replace(/-/g, ' ')
		return boxTitle.charAt(0).toUpperCase() + boxTitle.slice(1)
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
		<h2>{formatBoxTitle(box.title)}</h2>
	</header>
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
		padding-block: 14px;
	}

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

		h2 {
			font-size: 1.4rem;
			color: #fff;
			text-shadow: 0 0 5px #000;
		}
	}

	.box-grid {
		box-sizing: content-box;
		display: grid;
		grid-template-columns: repeat(6, 1fr);
		grid-template-rows: repeat(5, 1fr);
		place-items: center;
		height: 100%;
	}
</style>
