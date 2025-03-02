<script lang="ts">
	import PkBoxContainer from '$lib/components/box/pk-box-container.svelte'
	import { storageHandler } from '$lib/state/storage-handler'

	// State für ausgewählten DexName
	let selectedDexName = $state(storageHandler.getSelectedDexName())
	// $inspect(selectedDexName)

	// Ausgewählte DexOrder
	let dexOrder = $derived(storageHandler.getDexOrder(selectedDexName))
	// $inspect(selectedDexOrder)

	// State für ausgewählte DexOrder
	let dexState = $derived(storageHandler.getDexState(selectedDexName))

	let isLoading = $state(true)

	// Wenn sich selectedDexName ändert, speichern wir die Auswahl
	$effect(() => {
		// Sicherstellen, dass Daten geladen sind
		if (dexState && dexOrder) {
			isLoading = false
		}
		storageHandler.switchDex(selectedDexName)
	})
</script>

{#if isLoading}
	<div class="loading">Lade Pokédex...</div>
{:else}
	<select name="pk-order" id="pk-order" bind:value={selectedDexName}>
		<!--  default soll order-national.json sein -->
		<option value="order-national.json">order-national.json</option>
		<option value="order-national-forms.json">order-national-forms.json</option>
		<option value="order-national-test.json">order-national-test.json</option>
		<option value="order-test-small-1.json">order-test-small-1.json</option>
		<option value="order-test-small-2.json">order-test-small-2.json</option>
	</select>

	<main>
		<PkBoxContainer {dexOrder} {dexState} />
	</main>
{/if}

<style>
	main {
		display: flex;
		justify-content: center;
		gap: 2rem;

		margin: 0 4rem;
		position: relative;
	}
</style>
