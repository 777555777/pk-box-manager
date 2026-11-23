<script lang="ts">
	import PkSlot from '#lib/components/box/pk-slot.svelte'
	import { getBackgroundStyle } from '#lib/spriteheet-helper.ts'
	import { Wallpapers, type WallpapersType } from '#lib/models/wallpapers-models.ts'
	import PkWallpaperSelector from './pk-wallpaper-selector.svelte'
	import { dexStore } from '#lib/state/app.ts'
	import { appState } from '#lib/state/app-state.svelte.ts'
	import type { ResolvedBox } from '#lib/catalog/types.ts'

	let { box }: { box: ResolvedBox } = $props()

	let hideCapturedPokemon = $derived(appState.isHideCapturedPokemonEnabled())

	// Filter Pokemon based on hide captured setting
	// Empty slots (custom layouts) are kept in place, but hidden by the filter
	let visiblePokemon = $derived(
		hideCapturedPokemon
			? box.slots.filter(
					(pokemonId) => pokemonId !== null && !dexStore.getPokemon(pokemonId).captured
				)
			: box.slots
	)

	// Check if box should be hidden (no visible Pokemon)
	let shouldHideBox = $derived(hideCapturedPokemon && visiblePokemon.length === 0)

	function updateBoxWallpaper(newWallpaper: WallpapersType) {
		dexStore.updateBoxWallpaper(box.id, newWallpaper)
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
	const boxSpriteWidth = 567
	const boxSpriteHeight = 427
	const boxSpriteData = $derived(getWallpaperSpriteData(box.wallpaper as WallpapersType))
</script>

<article class="pk-box" style="display: {shouldHideBox ? 'none' : 'flex'}">
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
			{#each visiblePokemon as pokemon, index (pokemon ?? `empty-${index}`)}
				{#if pokemon}
					<PkSlot pokemonIdentifier={pokemon} />
				{:else}
					<div class="pk-empty-slot" aria-hidden="true"></div>
				{/if}
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
