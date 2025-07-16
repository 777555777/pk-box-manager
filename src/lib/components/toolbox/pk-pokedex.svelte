<script lang="ts">
	import PkDialog, { type PkDialogElement } from '../ui/pk-dialog.svelte'
	import PkDexCard from '../ui/pk-dex-card.svelte'
	import { storageHandler, type DexStorage } from '$lib/state/storage-handler'
	import PkExport from './pk-export.svelte'
	import { pkState } from '$lib/state/pk-state.svelte'
	import { appState } from '$lib/state/app-state.svelte'

	const backgroundImages = [
		'/ui/HGSS_Ilex_Forest-Day.png',
		'/ui/HGSS_National_Park-Day.png',
		'/ui/HGSS_Slowpoke_Well-Day.png',
		'/ui/HGSS_Viridian_Forest-Day.png'
	]

	// Get current selected dex name - use derived for reactive reading
	let selectedDexName = $derived(appState.getCurrentPokedexName())
	let pokedexList = $state(storageHandler.loadEveryPokedex())

	let pokedexDialog: PkDialogElement

	export function showPokedexDialog() {
		pokedexDialog.showDialog()
	}

	async function handlePokedexDelete(isSelected: boolean, dexName: string) {
		await pkState.resetPokedex(dexName, isSelected)

		// Refresh the pokedex list to reflect the reset
		pokedexList = storageHandler.loadEveryPokedex()
	}

	async function handlePokedexSelect(dexName: string) {
		console.log('Selecting pokedex:', dexName)

		// Load the new dex state
		await pkState.switchPokedex(dexName)

		// Set the new pokedex name after the switch so that +page.svelte renders again
		// when the boxorder is in the cache, preventing duplicate requests.
		appState.setCurrentPokedexName(dexName)

		// Force a refresh of the pokedex list to ensure UI updates
		pokedexList = storageHandler.loadEveryPokedex()
	}

	function getPokedexCounts(pokedex: DexStorage) {
		let count = 0
		let shinyCount = 0
		let limit = Object.values(pokedex.pokemon).length
		for (const pokemon of Object.values(pokedex.pokemon)) {
			if (pokemon.captured) {
				count++
			}
			if (pokemon.captured && pokemon.shiny) {
				shinyCount++
			}
		}
		return { count, shinyCount, limit }
	}
</script>

<PkDialog
	bind:this={pokedexDialog}
	headline="Pokedex settings"
	dialogContent={pokedexDialogContent}
	onConfirm={() => {}}
	onCancel={() => {}}
	cancelBtnText="Close"
/>

{#snippet pokedexDialogContent()}
	<section class="pk-dialog-content">
		{#each pokedexList as pokedex, index}
			<PkDexCard
				dexTitle={pokedex.displayName}
				dexName={pokedex.name}
				isSelected={pokedex.name === selectedDexName}
				counter={getPokedexCounts(pokedex)}
				onDelete={handlePokedexDelete}
				onSelect={handlePokedexSelect}
				imgUrl={backgroundImages[index]}
				--value-color="red"
				--value-secondary-color="blue"
			/>
		{/each}
	</section>
	<section class="pk-export-section">
		<p>Export the selected Dex:</p>
		<PkExport />
	</section>
{/snippet}

<style>
	.pk-dialog-content {
		padding-inline: 2rem;
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		place-items: center;
		margin: 0 auto;
		/* grid-template-rows: repeat(min-max(), 1fr); */
		gap: 2rem;
	}

	.pk-export-section {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.75rem;
		padding-inline: 2rem;
		margin-top: 1.25rem;
	}
</style>
