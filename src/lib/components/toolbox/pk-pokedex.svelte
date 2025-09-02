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
	import PkDexPresetSelection from '../ui/pk-dex-preset-selection.svelte'
	import PkDexPresetList from '../ui/pk-dex-preset-list.svelte'

	const optionConfig = [
		{ tabId: 'active', label: 'Active' },
		{ tabId: 'create', label: 'Create' }
	]

	let currentPage = $state('active')

	// Get current selected dex id - use derived for reactive reading
	let selectedDexId = $derived(appState.getSelectedPokedexId())
	let pokedexIndexList = $derived(pkState.getPokedexIndexList())
	let selectedDexRef = $derived.by(() => {
		return pokedexIndexList.find((dex) => dex.dexSaveId === selectedDexId)
	})

	type DexPresetKey = keyof typeof dexPresets

	let selectedPreset = $state<DexPresetKey | null>(null)
	let selectedPresetDexConfig: DexConfig | undefined = $derived.by(() =>
		selectedPreset ? dexPresets[selectedPreset] : undefined
	)

	let pokedexDialog: PkDialogElement

	export function showPokedexDialog() {
		pokedexDialog.showDialog()
	}

	function createAndSelectDex(selectedPreset: DexConfig, activeTags: BoxTags[]) {
		// Create new config with selected tags without mutating the original
		const initPreset = getDexConfig(selectedPreset.presetId, activeTags)

		if (!initPreset) {
			console.error('Failed to create Pokedex: Invalid preset or tags')
			return
		}

		// Apply the custom display name to the final config (already a copy from getDexConfig)
		const finalConfig = {
			...initPreset,
			displayName: selectedPreset.displayName // This comes from the preset card with custom name
		}

		const initialisedDexSave = pkState.initPokedex(finalConfig)

		if (!initialisedDexSave) {
			console.error('Failed to create Pokedex: Invalid preset or tags')
			return
		}

		// create and switch with selected tags:
		pkState.switchPokedex(initialisedDexSave)

		// Switch to active pokedex tab to show the newly created dex
		currentPage = 'active'
	}

	function handlePokedexDelete(toDeleteDexSaveId: string) {
		try {
			pkState.deletePokedex(toDeleteDexSaveId)
			console.log(`Successfully deleted Pokedex: ${toDeleteDexSaveId}`)
		} catch (error) {
			console.error('Failed to delete Pokedex:', error)
		}
	}

	function handleConfirmReset(toResetDexSaveId: string) {
		try {
			pkState.resetPokedex(toResetDexSaveId)
			console.log(`Successfully reset Pokedex: ${toResetDexSaveId}`)
		} catch (error) {
			console.error('Failed to reset Pokedex:', error)
		}
	}

	function loadSelectedDex(selectedDex: DexIndexEntry) {
		console.log('Loading selected dex:', selectedDex)
		const targetDexSave = pkState.loadPokedex(selectedDex.dexSaveId)

		// Update app state first, then switch pokédex
		appState.setSelectedPokedexId(selectedDex.dexSaveId)
		pkState.switchPokedex(targetDexSave)
	}

	function editDisplayName(dexId: string, newName: string) {
		// load the dexSave via dexId
		const targetDexSave = pkState.loadPokedex(dexId)

		if (targetDexSave) {
			// then apply the new name
			targetDexSave.config.displayName = newName

			// persist in localstorage
			pkState.savePokedex(targetDexSave)
		}
	}
</script>

<PkDialog
	bind:this={pokedexDialog}
	headline="Pokedex settings"
	dialogContent={pokedexDialogContent}
	onConfirm={() => {}}
	onCancel={() => {
		currentPage = 'active'
	}}
	cancelBtnText="Close"
	size="L"
/>

{#snippet pokedexDialogContent()}
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

	{#if currentPage === 'active'}
		{@render pokedexActiveList()}
	{:else if currentPage === 'create'}
		{@render pokedexPresetList()}
	{/if}
{/snippet}

{#snippet pokedexActiveList()}
	<section class="pk-pokedex-section">
		{#each pokedexIndexList as pokedexIndex, index}
			<PkDexCard
				dexTitle={pokedexIndex.displayName}
				dexSaveId={pokedexIndex.dexSaveId}
				tags={pokedexIndex.tags}
				isSelected={pokedexIndex.dexSaveId === selectedDexRef?.dexSaveId}
				counter={{
					totalPokemon: pokedexIndex.totalPokemon,
					totalCaughtPokemon: pokedexIndex.totalCaughtPokemon,
					totalShinyPokemon: pokedexIndex.totalShinyPokemon
				}}
				onDelete={handlePokedexDelete}
				onReset={handleConfirmReset}
				onSelect={() => loadSelectedDex(pokedexIndex)}
				onUpdateName={editDisplayName}
				imgUrl={`/ui/dex/${pokedexIndex.coverImage}`}
				isSystemDefault={pokedexIndex.isSystemDefault}
				--value-color="red"
				--value-secondary-color="blue"
			/>
		{/each}
	</section>
{/snippet}

{#snippet pokedexPresetList()}
	<section class="pk-preset-section">
		<PkDexPresetList bind:selectedPreset={selectedPreset as DexPresetKey} />

		<div class="separator-responsive"></div>

		<div class="pk-dex-configuration">
			{#if selectedPresetDexConfig}
				<PkDexPresetSelection
					{selectedPresetDexConfig}
					onSelect={(selectedPreset: DexConfig, activeTags: BoxTags[]) =>
						createAndSelectDex(selectedPreset, activeTags)}
				/>
			{:else}
				<div class="no-preset-selected">
					<p>Please select a Pokédex preset from the list above to configure it.</p>
				</div>
			{/if}
		</div>
	</section>
{/snippet}

<style>
	/* Desktop Fieldset Styles */

	.pk-dex-filter-options {
		margin-bottom: 1rem;
		display: flex;
		justify-content: space-between;

		.pk-btn-group {
			display: flex;
			gap: 0.5rem;
		}
	}

	@media (max-width: 520px) {
		.pk-dex-filter-options {
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			gap: 1rem;
		}
	}
	.pk-pokedex-section {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: 1.5rem;
		width: 100%;
		align-content: start;
		justify-items: center;

		padding: 2rem;
		overflow-y: auto;
		overflow-x: hidden;
		height: 680px;

		border-radius: 5px;
		border: 1px solid rgba(0, 0, 0, 0.1);
		background-color: var(--ui-section-background-color-accent);
	}

	.pk-preset-section {
		display: flex;

		width: 100%;
		align-content: start;
		justify-items: center;

		padding: 2rem;
		overflow-y: auto;
		height: 680px;

		border-radius: 5px;
		border: 1px solid rgba(0, 0, 0, 0.1);
		background-color: var(--ui-section-background-color-accent);
	}

	.separator-responsive {
		width: 2px;
		height: auto;
		background-color: rgba(0, 0, 0, 0.3);
		margin: 0 1rem;
		/* Prevent margin collapsing */
		border-left: 1px solid transparent;
		border-right: 1px solid transparent;
	}

	.pk-dex-configuration {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: start;
		gap: 1rem;

		.no-preset-selected {
			padding-inline: 1rem;
			margin: auto;
			text-align: center;
		}
	}

	@media (max-width: 768px) {
		.pk-preset-section {
			flex-direction: column;
		}
		.pk-pokedex-section {
			padding-bottom: 2rem;
		}

		.separator-responsive {
			width: auto;
			height: 2px;
			margin: 2rem 0;
			/* Prevent margin collapsing */
			border-top: 1px solid transparent;
			border-bottom: 1px solid transparent;
		}
	}
	@media (max-width: 520px) {
		.pk-preset-section {
			padding: 1rem;
			padding-block: 2rem;
		}
	}

	@media (max-width: 460px) {
		.pk-fieldset {
			margin-bottom: 0;
			padding-inline: 0.25rem;
		}

		.pk-pokedex-section {
			padding-inline: 0rem;
		}
	}
</style>
