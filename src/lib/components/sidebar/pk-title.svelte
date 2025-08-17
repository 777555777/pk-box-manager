<script lang="ts">
	import type { PokemonEntry } from '$lib/models/data-models'

	let { idEntry, isSelectionValid }: { idEntry: PokemonEntry; isSelectionValid: boolean } = $props()

	function formatPokemonDisplayName(entry: any) {
		const form = entry.formid ? entry.formid.replaceAll('-', ' ') : ''
		return `${entry.pokemonid} ${form}`
	}

	function capitalizeFirstLetter(val: string) {
		return (String(val).charAt(0).toUpperCase() + String(val).slice(1)).trim()
	}

	// Bestimme die optimale Schriftgröße basierend auf der Textlänge
	function getTextSizeClass(text: string) {
		const length = text.length
		if (length <= 36) return 'text-large'
		if (length <= 52) return 'text-base'
		return 'text-small'
	}

	let displayName = $derived(capitalizeFirstLetter(formatPokemonDisplayName(idEntry)))
	let sizeClass = $derived(getTextSizeClass(displayName))
</script>

{#if !isSelectionValid}
	<h3 class="pk-name {sizeClass}">{displayName}</h3>
	<h3 class="pk-number {sizeClass}">{idEntry.id_national}</h3>
{/if}

<style>
	.pk-name {
		text-align: center;
		overflow: hidden;
		text-overflow: ellipsis;
		padding-inline: 1.25rem;
		width: 100%;
		max-width: 22ch;
	}

	.pk-number {
		width: 48px; /* Same as Ballselector */
	}
</style>
