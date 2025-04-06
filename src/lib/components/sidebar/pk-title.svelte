<script lang="ts">
	import type { PokemonEntry } from '$lib/state/storage-handler'

	let { idEntry, identifier }: { idEntry: PokemonEntry; identifier: string } = $props()
	let isSelectionValid = $derived(identifier === '0000-null')

	function getDisplayname(entry: any) {
		return `${entry.id_national} | ${entry.pokemonid} ${entry.formid ? entry.formid.replaceAll('-', ' ') : ''}`
	}
</script>

{#if !isSelectionValid}
	<h3>{getDisplayname(idEntry)}</h3>
	{@render displayGender()}
{/if}

{#snippet displayGender()}
	{#if getDisplayname(idEntry).includes('female')}
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
