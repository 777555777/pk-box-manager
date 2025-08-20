<script lang="ts">
	import { dexPresets } from '$lib/data/pokedex'
	import type { BoxTags, DexConfig } from '$lib/models/data-models'
	import { pkState } from '$lib/state/pk-state.svelte'
	import PkToggle from './pk-toggle.svelte'
	import { getAllPossibleTags, getDexConfig } from '$lib/data/pokedex-config-utils'

	// let selectedPreset: HTMLSelectElement

	// Filter out 'normal' tag from UI - it's always active
	let allTags = getAllPossibleTags()
	let optionalTags = $state(allTags.filter((tag) => tag !== 'normal'))
	let selectedPreset: DexConfig = $state(dexPresets.nationalDex)
	$inspect(selectedPreset)

	// Create reactive boolean state for optional tags only
	let tagStates = $state<Record<string, boolean>>({})
	let activeTags = $derived.by<BoxTags[]>(() => {
		// Always include 'normal', plus any selected optional tags
		const selectedOptionalTags = Object.entries(tagStates)
			.filter(([_, active]) => active)
			.map(([tag, _]) => tag as BoxTags)
		return ['normal' as BoxTags, ...selectedOptionalTags]
	})

	$inspect(activeTags)

	// Initialize optional tag states to false
	for (const tag of optionalTags) {
		tagStates[tag] = false
	}

	function createAndSelectDex() {
		// Convert boolean states back to tags array
		selectedPreset.tags = activeTags as BoxTags[]
		const initPreset = getDexConfig(selectedPreset.id, selectedPreset.tags)
		console.log('00000000000000000', initPreset)
		// create and switch with selected tags:
		pkState.switchPokedex(initPreset)
	}
</script>

<div class="container">
	<!-- select zum auswählen des presets -->
	<select name="dex-select" id="dex-select" bind:value={selectedPreset}>
		{#each Object.values(dexPresets) as preset}
			<option value={preset}>{preset.displayName}</option>
		{/each}
	</select>

	<!-- toggle für zusätzliche tags (normal ist immer aktiv) -->

	{#each optionalTags as tag}
		<PkToggle label={tag} activeColor="hsla(125, 100%, 30%, 0.55)" bind:checked={tagStates[tag]} />
	{/each}

	<!-- create pokedex button -->
	<button onclick={createAndSelectDex}
		>create dex: {selectedPreset.id}-{activeTags.join('-')}</button
	>
</div>

<style>
	.container {
		background-color: cadetblue;
		padding: 1rem;
		border-radius: 0.5rem;
	}
</style>
