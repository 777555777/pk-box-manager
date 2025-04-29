<script lang="ts">
	import type { PokemonEntry } from '$lib/state/storage-handler'

	let { idEntry, isSelectionValid }: { idEntry: PokemonEntry; isSelectionValid: boolean } = $props()

	function formatPokemonDisplayName(entry: any) {
		const form = entry.formid ? entry.formid.replaceAll('-', ' ') : ''
		return `${entry.pokemonid} ${form}`
	}

	function capitalizeFirstLetter(val: string) {
		return String(val).charAt(0).toUpperCase() + String(val).slice(1)
	}
</script>

{#if !isSelectionValid}
	<h3>{capitalizeFirstLetter(formatPokemonDisplayName(idEntry))}</h3>
	<h3>{idEntry.id_national}</h3>
{/if}

<style>
	h3:last-child {
		margin-right: 12px;
	}
</style>
