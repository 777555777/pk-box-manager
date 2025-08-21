<script lang="ts">
	import { pkState } from '$lib/state/pk-state.svelte'
	import { appState } from '$lib/state/app-state.svelte'
	import PkDialog, { type PkDialogElement } from '$lib/components/ui/pk-dialog.svelte'
	import PkDexCard from '$lib/components/ui/pk-dex-card.svelte'
	import PkImport from '$lib/components/toolbox/pk-import.svelte'
	import { type DexIndexEntry } from '$lib/state/storage-handler'

	// TODO: Placeholder, replace with actual background images
	const backgroundImages = [
		'/ui/HGSS_Ilex_Forest-Day.png',
		'/ui/HGSS_National_Park-Day.png',
		'/ui/HGSS_Slowpoke_Well-Day.png',
		'/ui/HGSS_Viridian_Forest-Day.png'
	]

	// Get current selected dex id - use derived for reactive reading
	let selectedDexId = $derived(appState.getSelectedPokedexId())
	let pokedexIndexList = $derived(pkState.getPokedexIndexList())
	let selectedDexRef = $derived.by(() => {
		return pokedexIndexList.find((dex) => dex.id === selectedDexId)
	})

	let pokedexDialog: PkDialogElement

	export function showPokedexDialog() {
		pokedexDialog.showDialog()
	}

	// function handlePokedexDelete(isSelected: boolean, dexName: string) {
	// 	 pkState.deletePokedex(dexName)
	// 	// Reload the pokedex list to reflect the reset
	// 	// pkState.loadAllPokedexes()
	// }

	function handlePokedexDelete() {
		// pkState.deletePokedex(selectedDexId)
		console.log('Delete function not implemented yet')
	}

	function loadSelectedDex(selectedDex: DexIndexEntry) {
		const targetDexSave = pkState.loadPokedex(selectedDex.id)
		appState.setSelectedPokedexId(selectedDex.id)
		pkState.switchPokedex(targetDexSave.config)
	}
</script>

<PkDialog
	bind:this={pokedexDialog}
	headline="Pokedex settings"
	dialogContent={pokedexDialogContent}
	onConfirm={() => {}}
	onCancel={() => {}}
	cancelBtnText="Close"
	size="L"
/>

{#snippet pokedexDialogContent()}
	<!-- Mobile: Details/Summary Layout -->
	<div class="mobile-filter-accordion">
		<details class="pk-details">
			<summary class="pk-summary">Pokedex Filters</summary>
			<div class="pk-filter-container">
				<div class="pk-btn-group pk-filter-toggles">
					<p>test</p>
				</div>
				<div class="pk-btn-group pk-filter-actions">
					<PkImport />
				</div>
			</div>
		</details>
	</div>

	<!-- Desktop: Fieldset Layout -->
	<div class="desktop-filter-fieldset">
		<fieldset class="pk-fieldset pk-dex-filter-options">
			<legend>Pokedex Filters</legend>
			<div class="pk-btn-group pk-filter-actions">
				<PkImport />
			</div>
		</fieldset>
	</div>

	<section class="pk-pokedex-section">
		{#each pokedexIndexList as pokedexIndex, index}
			<PkDexCard
				dexTitle={pokedexIndex.displayName}
				dexId={pokedexIndex.id}
				isSelected={pokedexIndex.id === selectedDexRef?.id}
				counter={{
					totalPokemon: pokedexIndex.totalPokemon,
					totalCaughtPokemon: pokedexIndex.totalCaughtPokemon,
					totalShinyPokemon: pokedexIndex.totalShinyPokemon
				}}
				onDelete={handlePokedexDelete}
				onSelect={() => loadSelectedDex(pokedexIndex)}
				imgUrl={backgroundImages[index]}
				--value-color="red"
				--value-secondary-color="blue"
			/>
		{/each}
	</section>
{/snippet}

<style>
	/* Mobile Accordion Styles */
	.mobile-filter-accordion {
		display: none; /* Hidden by default, shown on mobile */
	}

	.pk-details {
		.pk-filter-container {
			padding: 1rem;
			display: flex;
			justify-content: space-between;
			align-items: center;
			gap: 1rem;

			.pk-btn-group {
				display: flex;
				gap: 0.5rem;
			}
		}
	}

	/* Desktop Fieldset Styles */
	.desktop-filter-fieldset {
		display: block;
	}

	.pk-dex-filter-options {
		margin-bottom: 1rem;

		.pk-filter-container {
			display: flex;
			justify-content: space-between;
			align-items: center;
			gap: 3rem;
		}

		.pk-btn-group {
			display: flex;
			gap: 0.5rem;
		}
	}

	/* Responsive Filter-Optionen */
	@media (max-width: 768px) {
		/* Mobile: Show accordion, hide fieldset */
		.mobile-filter-accordion {
			display: block;
		}

		.desktop-filter-fieldset {
			display: none;
		}

		/* Mobile-specific styling for accordion content */
		.pk-details .pk-filter-container {
			flex-direction: column;
			justify-content: center;
			gap: 1rem;
		}
	}

	@media (max-width: 520px) {
		.pk-details .pk-filter-toggles {
			flex-direction: column;
			gap: 0.75rem;
			width: 100%;
		}

		.pk-details .pk-filter-container {
			padding: 0.75rem;
		}

		.pk-details summary {
			padding: 0.5rem 0.75rem;
		}
	}
	.pk-pokedex-section {
		padding-bottom: 2rem;
		padding-inline: 2rem;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		place-items: center;
		gap: 2rem;
		height: 680px;
		overflow-y: auto;

		mask: var(--scroll-indicator-gradient);
	}

	@media (max-width: 768px) {
		.pk-pokedex-section {
			gap: 1rem;
			padding-bottom: 2rem;
		}
	}

	@media (max-width: 460px) {
		.pk-fieldset {
			margin-bottom: 0;
			padding-inline: 0.25rem;
		}

		.pk-pokedex-section {
			padding-inline: 1rem;
		}
	}
</style>
