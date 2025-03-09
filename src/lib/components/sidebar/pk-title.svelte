<script lang="ts">
	import { getIdentifier } from '$lib/spriteheet-helper'
	import type { PokemonState } from '$lib/state/storage-handler'

	let { selectedPokemon }: { selectedPokemon: PokemonState } = $props()
	let identifier = $derived(getIdentifier(selectedPokemon.idEntry))
	let isSelectionValid = $derived(identifier === '0000-null')

	function getDisplayname(entry: any) {
		return `${entry.id_national} | ${entry.pokemonid} ${entry.formid ? entry.formid : ''}`
	}
</script>

{#if !isSelectionValid}
	<h3>{getDisplayname(selectedPokemon.idEntry)}</h3>
	{@render displayGender()}
{/if}

{#snippet displayGender()}
	{#if getDisplayname(selectedPokemon.idEntry).includes('female')}
		<span class="pk-gender">♀️</span>
	{:else}
		<span class="pk-gender">♂️</span>
	{/if}
{/snippet}

<style>
	.pk-gender {
		display: inline-block;
		font-size: 1.5rem;
	}
</style>
