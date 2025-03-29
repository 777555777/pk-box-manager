<script lang="ts">
	import PkStatMeter from '../ui/pk-stat-meter.svelte'
	import PkTypeBadge from '../ui/pk-type-badge.svelte'

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
		if (!response.ok) {
			throw new Error('Pokemon nicht gefunden')
		}
		return await response.json()
	}

	const statLabels = ['HP', 'Attack', 'Defense', 'Sp. Atk', 'Sp. Def', 'Speed']
</script>

<section class="pk-stats-container">
	{#await requestPokemon}
		<!-- <p>...loading</p> -->
	{:then pokemon}
		<div class="pk-types">
			{#each pokemon.types as type}
				<PkTypeBadge {type} />
			{/each}
		</div>

		<div class="pk-stats">
			{#each pokemon.stats as stat, index}
				<div class="stat-row">
					<PkStatMeter value={stat} {index} label={statLabels[index]} />
				</div>
			{/each}
		</div>

		<div class="pk-origin">
			<span>Origin: {pokemon.originRegion}</span>
		</div>

		<div class="pk-Abilities">
			Abilities:
			{#each pokemon.abilities as abilities}
				<span>{abilities}</span>
			{/each}
		</div>

		<div class="pk-gender">
			<span>♂️{pokemon.genderRatio.male}% / ♀️{pokemon.genderRatio.female}%</span>
		</div>
	{:catch error}
		<p>{error.message}</p>
	{/await}
</section>

<style>
	.pk-stats-container {
		padding: 1rem;
	}

	.pk-types {
		display: flex;
		justify-content: center;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.pk-stats {
		margin-bottom: 1rem;
	}

	.stat-row {
		display: flex;
		align-items: center;
		margin-bottom: 0.5rem;
	}

	.pk-origin,
	.pk-Abilities,
	.pk-gender {
		text-align: center;
		font-style: italic;
	}
</style>
