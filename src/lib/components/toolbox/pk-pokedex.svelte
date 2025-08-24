<script lang="ts">
	import { pkState } from '$lib/state/pk-state.svelte'
	import { appState } from '$lib/state/app-state.svelte'
	import PkDialog, { type PkDialogElement } from '$lib/components/ui/pk-dialog.svelte'
	import PkDexCard from '$lib/components/ui/pk-dex-card.svelte'
	import PkImport from '$lib/components/toolbox/pk-import.svelte'
	import { type DexIndexEntry } from '$lib/state/storage-handler'
	import PkRadioGroup from '../ui/pk-radio-group.svelte'
	import { dexPresets } from '$lib/data/pokedex'
	import type { BoxTags, DexConfig } from '$lib/models/data-models'
	import { getDexConfig } from '$lib/data/pokedex-config-utils'
	import PkDexPresetCard from '../ui/pk-dex-preset-card.svelte'

	const optionConfig = [
		{ tabId: 'active-pokedex', label: 'Active Pokedex' },
		{ tabId: 'new-pokedex', label: 'New Pokedex' }
	]

	let currentPage = $state('active-pokedex')

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

	function createAndSelectDex(selectedPreset: DexConfig, activeTags: BoxTags[]) {
		// Create new config with selected tags without mutating the original
		const initPreset = getDexConfig(selectedPreset.id, activeTags)

		// Generate the correct dex ID that will be created
		const dexId = `${initPreset.type}-${initPreset.id}-${initPreset.tags.join('-')}`

		// create and switch with selected tags:
		pkState.switchPokedex(initPreset)

		// Update app state with the correct dex ID - this ensures the UI reactive variables update
		appState.setSelectedPokedexId(dexId)

		// Switch to active pokedex tab to show the newly created dex
		currentPage = 'active-pokedex'

		// The dialog will be closed by the dialog's onConfirm handler
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
		console.log('Loading selected dex:', selectedDex)
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
			<summary class="pk-summary">Options</summary>
			<div class="pk-filter-container">
				<div class="pk-btn-group pk-filter-toggles">
					<PkRadioGroup bind:currentOption={currentPage} {optionConfig} />
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
			<legend>Options</legend>
			<div class="pk-btn-group pk-filter-toggles">
				<PkRadioGroup bind:currentOption={currentPage} {optionConfig} />
			</div>
			<div class="pk-btn-group pk-filter-actions">
				<PkImport />
			</div>
		</fieldset>
	</div>

	{#if currentPage === 'active-pokedex'}
		{@render pokedexActiveList()}
	{:else if currentPage === 'new-pokedex'}
		{@render pokedexPresetList()}
	{/if}
{/snippet}

{#snippet pokedexActiveList()}
	<section class="pk-pokedex-section">
		{#each pokedexIndexList as pokedexIndex, index}
			<PkDexCard
				dexTitle={pokedexIndex.displayName}
				dexId={pokedexIndex.id}
				tags={pokedexIndex.tags}
				isSelected={pokedexIndex.id === selectedDexRef?.id}
				counter={{
					totalPokemon: pokedexIndex.totalPokemon,
					totalCaughtPokemon: pokedexIndex.totalCaughtPokemon,
					totalShinyPokemon: pokedexIndex.totalShinyPokemon
				}}
				onDelete={handlePokedexDelete}
				onSelect={() => loadSelectedDex(pokedexIndex)}
				imgUrl={`/ui/dex/${pokedexIndex.coverImage}`}
				--value-color="red"
				--value-secondary-color="blue"
			/>
		{/each}
	</section>
{/snippet}

{#snippet pokedexPresetList()}
	<section class="pk-pokedex-section">
		{#each Object.entries(dexPresets) as [dexPresetId, dexPreset], index}
			<PkDexPresetCard
				dexTitle={dexPreset.displayName}
				dexId={dexPreset.id}
				onSelect={(selectedPreset: DexConfig, activeTags: BoxTags[]) =>
					createAndSelectDex(selectedPreset, activeTags)}
				imgUrl={`/ui/dex/${dexPreset.coverImage}`}
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
		display: flex;
		justify-content: space-between;

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
		gap: 2rem;
		height: 680px;
		overflow-y: auto;

		mask: var(--scroll-indicator-gradient);
	}

	@media (max-width: 1024px) {
		.pk-pokedex-section {
			place-items: center;
		}
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
