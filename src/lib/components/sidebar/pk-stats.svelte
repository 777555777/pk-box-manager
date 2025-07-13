<script lang="ts">
	import PkStatMeter from '$lib/components/ui/pk-stat-meter.svelte'
	import PkTypeBadge from '$lib/components/ui/pk-type-badge.svelte'
	import { fade } from 'svelte/transition'

	interface StaticPokemonData {
		originRegion: string
		stats: [number, number, number, number, number, number]
		types: [string, string] | [string]
		abilities: [string] | [string, string] | [string, string, string]
		genderRatio: { male: number; female: number }
	}

	let { identifier } = $props()
	let requestPokemon = $derived(requestPokemonStats())

	async function requestPokemonStats(): Promise<StaticPokemonData> {
		const response = await fetch(`/pkinfo?identifier=${encodeURIComponent(identifier)}`)
		if (!response.ok) throw new Error('Pokemon nicht gefunden')

		const data = await response.json()
		if (!data) throw new Error('Keine Daten erhalten')

		return data
	}

	const statLabels = ['HP', 'Attack', 'Defense', 'Sp. Atk', 'Sp. Def', 'Speed']
</script>

<div class="pk-stats-container">
	{#await requestPokemon}
		<!-- <p>...loading</p> -->
	{:then pokemon}
		<div class="pk-row-1">
			<div class="pk-origin">
				<h4 class="sr-only">Origin Region</h4>
				<span>Origin: {pokemon.originRegion}</span>
			</div>

			<div class="pk-types">
				<h4 class="sr-only">Types</h4>
				{#each pokemon.types as type}
					<PkTypeBadge {type} />
				{/each}
			</div>
		</div>

		<div class="pk-stats">
			<h4 class="sr-only">Base stats</h4>
			{#each pokemon.stats as stat, index}
				<div class="stat-row">
					<PkStatMeter label={statLabels[index]} value={stat} {index} />
				</div>
			{/each}
		</div>

		<div class="pk-Abilities">
			<h4 class="sr-only">Abilities</h4>
			{#each pokemon.abilities as ability}
				<span class={ability.includes('*') ? 'hidden-ability' : ''}>{ability}</span>
			{/each}
		</div>

		<div class="pk-gender">
			<h4 class="sr-only">Gender ratio</h4>
			{#if !pokemon.genderRatio.male && !pokemon.genderRatio.female}
				<span>Unknown</span>
			{:else}
				<div class="gender-ratio">
					<div class="gender-item">
						<img width="16px" src="ui/male.png" alt="♂️" />
						<span>{pokemon.genderRatio.male}%</span>
					</div>
					<div class="gender-item">
						<img width="16px" src="ui/female.png" alt="♀️" />
						<span>{pokemon.genderRatio.female}%</span>
					</div>
				</div>
			{/if}
		</div>
	{:catch error}
		<p>{error.message}</p>
	{/await}
</div>

<style>
	.pk-stats-container {
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 1rem;
		min-height: 320px;
	}

	.pk-row-1 {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		min-height: 32px;

		.pk-origin {
			text-align: left;
		}

		.pk-types {
			display: flex;
			gap: 1rem;
			max-width: 135px;
		}
	}

	.pk-stats {
		.stat-row {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 0.5rem;
			margin-bottom: 0.5rem;
		}
		.stat-row:last-child {
			margin-bottom: 0;
		}
	}

	.pk-Abilities {
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;
		gap: 0.5rem;

		text-align: center;
		min-height: 32px;

		span {
			display: block;
			flex-grow: 1;
			padding: 0.175rem 0.25rem;
		}

		.hidden-ability {
			color: #ffb366;
		}
	}

	.pk-gender {
		text-align: center;
		vertical-align: middle;
		min-height: 1.5rem;

		.gender-ratio {
			display: flex;
			justify-content: center;
			align-items: center;
			gap: 2rem;

			.gender-item {
				display: flex;
				align-items: center;
				gap: 0.375rem;
			}
		}
	}

	@media (max-height: 1200px) {
		.pk-stats-container {
			gap: 0.5rem;
			min-height: unset;
		}
		.pk-stats {
			.stat-row {
				gap: 0.5rem;
				margin-bottom: 0.375rem;
			}
		}
		.pk-row-1 {
			margin-block: 0.25rem;
		}
	}
</style>
