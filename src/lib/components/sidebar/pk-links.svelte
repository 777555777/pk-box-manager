<script lang="ts">
	import type { PokemonEntry } from '$lib/models/data-models'
	import { appState } from '$lib/state/app-state.svelte'

	let { idEntry }: { idEntry: PokemonEntry } = $props()

	let visibleWikiPages = $derived(appState.loadAppSettings().wikiLinkConfig)

	function formatExternalUrl(site: string): string {
		switch (site) {
			case 'bulbapedia':
				return `https://bulbapedia.bulbagarden.net/wiki/${idEntry.pokemonid}_(Pok%C3%A9mon)#Game_locations`
			case 'pokewiki':
				return `https://www.pokewiki.de/${idEntry.pokemonid}#Fundorte`
			case 'bisafans':
				return `https://www.bisafans.de/pokedex/${idEntry.id_national.toString().padStart(4, '0')}.php#fundorte`
			case 'wikidex':
				return `https://www.wikidex.net/wiki/${idEntry.pokemonid}`
			default:
				return '#'
		}
	}
</script>

<div class="pk-external-urls {idEntry.pokemonid === 'null' ? 'hidden' : ''}">
	{#if visibleWikiPages.includes('bulbapedia')}
		<a href={formatExternalUrl('bulbapedia')} target="_blank">Bulbapedia(EN)</a>
	{/if}
	{#if visibleWikiPages.includes('pokewiki')}
		<a href={formatExternalUrl('pokewiki')} target="_blank">Pokewiki(DE)</a>
	{/if}
	{#if visibleWikiPages.includes('bisafans')}
		<a href={formatExternalUrl('bisafans')} target="_blank">Bisafans(DE)</a>
	{/if}
	{#if visibleWikiPages.includes('wikidex')}
		<a href={formatExternalUrl('wikidex')} target="_blank">Wikidex(ES)</a>
	{/if}
</div>

<style>
	:root {
		--pk-link-color: hsl(50, 90%, 60%);
		--pk-link-hover-color: hsl(50, 100%, 75%);
		--pk-link-visited-color: hsl(50, 90%, 42%);
	}

	.pk-external-urls {
		display: flex;
		justify-content: center;
		gap: 1.25rem;
		overflow: auto;
	}

	.pk-external-urls a {
		position: relative;
		color: var(--pk-link-color);
		text-decoration: none;
	}

	.pk-external-urls a:hover {
		color: var(--pk-link-hover-color);
		text-decoration: underline;
	}

	.pk-external-urls a:visited {
		color: var(--pk-link-visited-color);
	}

	.hidden {
		visibility: hidden;
	}

	@media (max-width: 400px) {
		.pk-external-urls {
			flex-direction: column;
			align-items: center;
			justify-content: center;
			gap: 0.5rem;
		}
	}
</style>
