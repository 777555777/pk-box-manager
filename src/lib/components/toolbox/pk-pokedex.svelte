<script lang="ts">
	import { type DexStorage } from '$lib/state/storage-handler'
	import { pkState } from '$lib/state/pk-state.svelte'
	import { appState } from '$lib/state/app-state.svelte'
	import PkDialog, { type PkDialogElement } from '$lib/components/ui/pk-dialog.svelte'
	import PkDexCard from '$lib/components/ui/pk-dex-card.svelte'
	import PkImport from '$lib/components/toolbox/pk-import.svelte'
	import PkToggle from '../ui/pk-toggle.svelte'

	// TODO: Placeholder, replace with actual background images
	const backgroundImages = [
		'/ui/HGSS_Ilex_Forest-Day.png',
		'/ui/HGSS_National_Park-Day.png',
		'/ui/HGSS_Slowpoke_Well-Day.png',
		'/ui/HGSS_Viridian_Forest-Day.png'
	]

	// Filter state - National and Forms active by default, Custom inactive
	let showBaseDex = $state(true) // Basis-Pokédexes (ohne Forms)
	let showFormsDex = $state(true) // Pokédexes mit alternativen Formen
	let showCustomDex = $state(false) // Selbst erstellte Pokédexes

	// Get current selected dex name - use derived for reactive reading
	let selectedDexName = $derived(appState.getCurrentPokedexName())
	let allPokedexes = $derived(pkState.getAllPokedexes())

	// Filter pokedexes based on toggle states
	let pokedexList = $derived.by(() => {
		console.log(allPokedexes)
		return allPokedexes.filter((pokedex) => {
			const dexName = pokedex.name

			// Check if it's a National dex
			const isNational = dexName.startsWith('national-dex')
			if (isNational && showBaseDex) return true

			// Check if it's a Forms dex (but not National)
			const isForms = dexName.includes('-forms.json') && !isNational
			if (isForms && showFormsDex) return true

			// Check if it's a Custom dex (user-created)
			const isCustom = pokedex.sortOrder?.type === 'client'
			if (isCustom && showCustomDex) return true

			// Check if it's a regular generation dex (not forms, not national, not custom)
			const isRegular =
				!dexName.includes('-forms.json') && !isNational && pokedex.sortOrder?.type !== 'client'
			if (isRegular && showBaseDex) return true // Regular generation dexes are grouped with National

			return false
		})
	})

	let pokedexDialog: PkDialogElement

	export function showPokedexDialog() {
		pokedexDialog.showDialog()
	}

	async function handlePokedexDelete(isSelected: boolean, dexName: string) {
		await pkState.resetPokedex(dexName, isSelected)
		// Reload the pokedex list to reflect the reset
		pkState.loadAllPokedexes()
	}

	async function handlePokedexSelect(dexName: string) {
		console.log('Selecting pokedex:', dexName)

		// Load the new dex state
		await pkState.switchPokedex(dexName)

		// Set the new pokedex name after the switch so that +page.svelte renders again
		// when the boxorder is in the cache, preventing duplicate requests.
		appState.setCurrentPokedexName(dexName)

		// Reload the pokedex list to update the dialog with the newly loaded dex
		pkState.loadAllPokedexes()
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
	size="L"
/>
{#snippet pokedexDialogContent()}
	<fieldset class="pk-fieldset pk-dex-filter-options">
		<legend>Pokedex Filters</legend>
		<div class="pk-filter-container">
			<div class="pk-btn-group pk-filter-toggles">
				<PkToggle
					label="Base Dex"
					activeColor="hsla(125, 100%, 30%, 0.55)"
					bind:checked={showBaseDex}
				/>
				<PkToggle
					label="Forms Dex"
					activeColor="hsla(125, 100%, 30%, 0.55)"
					bind:checked={showFormsDex}
				/>
				<PkToggle
					label="Custom Dex"
					activeColor="hsla(125, 100%, 30%, 0.55)"
					bind:checked={showCustomDex}
				/>
			</div>
			<div class="pk-btn-group pk-filter-actions">
				<PkImport />
			</div>
		</div>
	</fieldset>
	<section class="pk-pokedex-section">
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
{/snippet}

<style>
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
		.pk-dex-filter-options {
			.pk-filter-container {
				flex-direction: column;
				justify-content: center;
				gap: 1rem;
			}
		}
	}

	@media (max-width: 520px) {
		.pk-dex-filter-options {
			.pk-filter-toggles {
				flex-direction: column;
				gap: 0.75rem;
				width: 100%;
				padding-inline: 2rem;
			}
		}
	}
	.pk-pokedex-section {
		padding-bottom: 2rem;
		padding-inline: 2rem;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		place-items: center;
		gap: 2rem;
		max-height: 680px;
		overflow-y: scroll;

		scrollbar-color: #444450 #717186;

		mask: var(--scroll-indicator-gradient);
	}

	@media (max-width: 768px) {
		.pk-pokedex-section {
			gap: 1rem;
			padding-bottom: 2rem;
		}
	}
</style>
