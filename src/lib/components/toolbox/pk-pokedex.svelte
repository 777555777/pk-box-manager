<script lang="ts">
	import { type DexStorage } from '$lib/state/storage-handler'
	import { pkState } from '$lib/state/pk-state.svelte'
	import { appState } from '$lib/state/app-state.svelte'
	import PkDialog, { type PkDialogElement } from '$lib/components/ui/pk-dialog.svelte'
	import PkDexCard from '$lib/components/ui/pk-dex-card.svelte'
	import PkExport from '$lib/components/toolbox/pk-export.svelte'
	import PkImport from '$lib/components/toolbox/pk-import.svelte'

	// TODO: Placeholder, replace with actual background images
	const backgroundImages = [
		'/ui/HGSS_Ilex_Forest-Day.png',
		'/ui/HGSS_National_Park-Day.png',
		'/ui/HGSS_Slowpoke_Well-Day.png',
		'/ui/HGSS_Viridian_Forest-Day.png'
	]

	// Get current selected dex name - use derived for reactive reading
	let selectedDexName = $derived(appState.getCurrentPokedexName())
	let pokedexList = $derived(pkState.getAllPokedexes())

	let pokedexDialog: PkDialogElement

	export function showPokedexDialog() {
		pokedexDialog.showDialog()
	}

	async function handlePokedexDelete(isSelected: boolean, dexName: string) {
		await pkState.resetPokedex(dexName, isSelected)
	}

	async function handlePokedexSelect(dexName: string) {
		console.log('Selecting pokedex:', dexName)

		// Load the new dex state
		await pkState.switchPokedex(dexName)

		// Set the new pokedex name after the switch so that +page.svelte renders again
		// when the boxorder is in the cache, preventing duplicate requests.
		appState.setCurrentPokedexName(dexName)
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
	<section class="pk-option-section">
		<h3 class="section-title text-large">Pokedex Data Management</h3>

		<div class="option-group">
			<div class="option-item">
				<div class="option-header">
					<img src="/ui/download.svg" alt="Export" class="option-icon" />
					<span class="option-label">Export Data</span>
				</div>
				<p class="option-description text-small">
					Export the selected Pokedex to a <abbr>.json</abbr> file
				</p>
				<PkExport />
			</div>

			<div class="option-item">
				<div class="option-header">
					<img src="/ui/save-solid.svg" alt="Import" class="option-icon" />
					<span class="option-label">Import Data</span>
				</div>
				<p class="option-description text-small">Import a Pokedex from a <abbr>.json</abbr> file</p>
				<PkImport />
			</div>
		</div>
	</section>
{/snippet}

<style>
	.pk-dialog-content {
		padding-inline: 2rem;
		padding-bottom: 1rem;
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		place-items: center;
		margin: 0 auto;
		gap: 2rem;
		max-height: 360px;
		overflow-y: scroll;

		scrollbar-color: #444450 #717186;

		mask: linear-gradient(to bottom, black 94%, black 92%, transparent 100%);
	}

	.pk-option-section {
		border-width: 9px solid;
		border-image: url('/ui/textarea-select-default.webp') 9 fill stretch;
		border-image-outset: 0;
		border-image-width: 9px;

		padding: 1.5rem;
		margin-top: 1rem;
		margin-inline: 2rem;
		position: relative;
		overflow: hidden;

		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;

		z-index: 1;

		.section-title {
			margin: 0 0 1.5rem 0;
			text-align: center;
		}

		.option-group {
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
			gap: 1.5rem;
			align-items: stretch;
			justify-content: center;
			max-width: 60rem;
			width: 100%;
		}

		.option-item {
			display: flex;
			flex-direction: column;
			gap: 1rem;
			padding: 1.25rem;
			background-color: #618e9e;
			min-width: 200px;
			max-width: 260px;
			width: 100%;
			justify-self: center;
			text-wrap: balance;

			--clip-path-pixel-size: 3px;

			clip-path: polygon(
				0% calc(0% + var(--clip-path-pixel-size)),
				calc(0% + var(--clip-path-pixel-size)) calc(0% + var(--clip-path-pixel-size)),
				calc(0% + var(--clip-path-pixel-size)) 0%,
				calc(100% - var(--clip-path-pixel-size)) 0%,
				calc(100% - var(--clip-path-pixel-size)) calc(0% + var(--clip-path-pixel-size)),
				100% calc(0% + var(--clip-path-pixel-size)),
				100% calc(100% - var(--clip-path-pixel-size)),
				calc(100% - var(--clip-path-pixel-size)) calc(100% - var(--clip-path-pixel-size)),
				calc(100% - var(--clip-path-pixel-size)) 100%,
				calc(0% + var(--clip-path-pixel-size)) 100%,
				calc(0% + var(--clip-path-pixel-size)) calc(100% - var(--clip-path-pixel-size)),
				0% calc(100% - var(--clip-path-pixel-size))
			);

			border: 2px solid rgba(93, 93, 111, 0.2);
		}

		.option-header {
			display: flex;
			align-items: center;
			gap: 0.75rem;
			margin-bottom: 0.5rem;
			justify-content: center;
		}

		.option-icon {
			width: 1.5rem;
			height: 1.5rem;
			filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
		}

		.option-description {
			color: rgba(255, 255, 255, 0.7);
			text-align: center;
			min-height: 2.4em;
			line-height: 1.4;
		}
	}

	/* Mobile Responsive */
	@media (max-width: 768px) {
		.pk-option-section {
			margin-inline: 1rem;
			padding: 1.5rem;

			.option-group {
				grid-template-columns: 1fr;
				gap: 1.5rem;
			}

			.option-item {
				max-width: none;
				min-width: auto;
			}
		}
	}
</style>
