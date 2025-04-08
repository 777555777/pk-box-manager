<script lang="ts">
	import type { PokemonEntry } from '$lib/state/storage-handler'

	let { idEntry, isSelectionValid }: { idEntry: PokemonEntry; isSelectionValid: boolean } = $props()

	function formatPokemonDisplayName(entry: any) {
		const form = entry.formid ? entry.formid.replaceAll('-', ' ') : ''
		return `${entry.id_national} | ${entry.pokemonid} ${form}`
	}
</script>

{#if !isSelectionValid}
	<h3>{formatPokemonDisplayName(idEntry)}</h3>
	{@render displayGender()}
{/if}

{#snippet displayGender()}
	{#if formatPokemonDisplayName(idEntry).includes('female')}
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
