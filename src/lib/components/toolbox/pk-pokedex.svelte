<script lang="ts">
	import { dexStore } from '#lib/state/app.ts'
	import type { NewDexOptions } from '#lib/state/dex-store.svelte.ts'
	import PkDialog, { type PkDialogElement } from '#lib/components/ui/pk-dialog.svelte'
	import PkDexCard from '#lib/components/ui/pk-dex-card.svelte'
	import PkImport from '#lib/components/toolbox/pk-import.svelte'
	import PkRadioGroup from '../ui/pk-radio-group.svelte'
	import PkDexPresetSelection from '../ui/pk-dex-preset-selection.svelte'
	import PkDexPresetList from '../ui/pk-dex-preset-list.svelte'

	const optionConfig = [
		{ tabId: 'active', label: 'Active' },
		{ tabId: 'create', label: 'Create' }
	]

	let currentPage = $state('active')

	let dexes = $derived(dexStore.dexes)
	let activeId = $derived(dexStore.activeId)
	let selectedPreset = $state<string | null>(null)

	let pokedexDialog: PkDialogElement

	export function showPokedexDialog() {
		pokedexDialog.showDialog()
	}

	async function createAndSelectDex(options: NewDexOptions) {
		try {
			await dexStore.createDex(options)
			// Switch to active pokedex tab to show the newly created dex
			currentPage = 'active'
		} catch (error) {
			console.error('Failed to create Pokedex:', error)
		}
	}

	async function handlePokedexDelete(dexId: string) {
		try {
			await dexStore.deleteDex(dexId)
		} catch (error) {
			console.error('Failed to delete Pokedex:', error)
		}
	}

	async function handleConfirmReset(dexId: string) {
		try {
			await dexStore.resetDex(dexId)
		} catch (error) {
			console.error('Failed to reset Pokedex:', error)
		}
	}

	async function loadSelectedDex(dexId: string) {
		try {
			await dexStore.switchDex(dexId)
		} catch (error) {
			console.error('Failed to load Pokedex:', error)
		}
	}

	function editDisplayName(dexId: string, newName: string) {
		dexStore.renameDex(dexId, newName)
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
		{#each dexes as dex (dex.id)}
			<PkDexCard
				dexTitle={dex.name}
				dexSaveId={dex.id}
				tags={dex.layout.kind === 'preset' ? dex.layout.tags : []}
				isSelected={dex.id === activeId}
				counter={{
					totalPokemon: dex.stats.total,
					totalCaughtPokemon: dex.stats.caught,
					totalShinyPokemon: dex.stats.shiny
				}}
				onDelete={handlePokedexDelete}
				onReset={handleConfirmReset}
				onSelect={() => loadSelectedDex(dex.id)}
				onUpdateName={editDisplayName}
				imgUrl={`/ui/dex/${dex.coverImage}`}
				isSystemDefault={dex.isDefault}
				--value-color="red"
				--value-secondary-color="blue"
			/>
		{/each}
	</section>
{/snippet}

{#snippet pokedexPresetList()}
	<section class="pk-preset-section">
		<PkDexPresetList bind:selectedPreset />

		<div class="separator-responsive"></div>

		<div class="pk-dex-configuration">
			{#if selectedPreset}
				{#key selectedPreset}
					<PkDexPresetSelection presetId={selectedPreset} onSelect={createAndSelectDex} />
				{/key}
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
		height: 680px;
		overflow: auto;

		border-radius: 5px;
		border: 1px solid rgba(0, 0, 0, 0.1);
		background-color: var(--ui-section-background-color-accent);
		margin-bottom: 1rem;
	}

	.pk-preset-section {
		display: flex;

		width: 100%;
		align-content: start;
		justify-items: center;

		padding: 2rem;
		height: 680px;
		overflow: auto;

		border-radius: 5px;
		border: 1px solid rgba(0, 0, 0, 0.1);
		background-color: var(--ui-section-background-color-accent);
		margin-bottom: 1rem;
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
		justify-content: center;
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
		.pk-pokedex-section {
			height: unset;
			overflow: unset;
		}

		.pk-preset-section {
			height: unset;
			overflow: unset;

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
