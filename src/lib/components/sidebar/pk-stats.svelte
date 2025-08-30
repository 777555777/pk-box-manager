<script lang="ts">
	import PkStatMeter from '$lib/components/ui/pk-stat-meter.svelte'
	import PkTypeBadge from '$lib/components/ui/pk-type-badge.svelte'
	import PkIcon from '$lib/components/ui/pk-icon.svelte'
	import pkStats from '$lib/data/pk-stats.json' with { type: 'json' }

	let { identifier }: { identifier: keyof typeof pkStats } = $props()

	const statLabels = ['HP', 'Attack', 'Defense', 'Sp. Atk', 'Sp. Def', 'Speed']
</script>

<div class="pk-stats-container">
	{#if identifier === '0000-null'}
		<p class="unselected-hint">Select a Pokemon <br />to view its stats</p>
	{/if}

	{#if identifier !== '0000-null'}
		<div class="pk-row-1">
			<div class="pk-origin">
				<h4 class="sr-only">Origin Region</h4>
				<span>Origin: {pkStats[identifier].originRegion}</span>
			</div>

			<div class="pk-types">
				<h4 class="sr-only">Types</h4>
				{#each pkStats[identifier].types as type}
					<PkTypeBadge {type} />
				{/each}
			</div>
		</div>

		<div class="pk-stats">
			<h4 class="sr-only">Base stats</h4>
			{#each pkStats[identifier].stats as stat, index}
				<div class="stat-row">
					<PkStatMeter label={statLabels[index]} value={stat} {index} />
				</div>
			{/each}
		</div>

		<div class="pk-Abilities">
			<h4 class="sr-only">Abilities</h4>
			{#each pkStats[identifier].abilities as ability}
				<span class={ability.includes('*') ? 'hidden-ability' : ''}>{ability}</span>
			{/each}
		</div>

		<div class="pk-gender">
			<h4 class="sr-only">Gender ratio</h4>
			{#if !pkStats[identifier].genderRatio.male && !pkStats[identifier].genderRatio.female}
				<span>Unknown</span>
			{:else}
				<div class="gender-ratio">
					<div class="gender-item">
						<PkIcon name="male" size={24} ariaLabelledby="male-icon" />
						<span>{pkStats[identifier].genderRatio.male}%</span>
					</div>
					<div class="gender-item">
						<PkIcon name="female" size={24} ariaLabelledby="female-icon" />
						<span>{pkStats[identifier].genderRatio.female}%</span>
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.pk-stats-container {
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 1rem;
		min-height: 320px;
	}

	.unselected-hint {
		text-align: center;
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
		min-height: 48px;

		span {
			display: block;
			flex-grow: 1;
			padding: 0.175rem 0.25rem;
			max-width: 13ch;
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
