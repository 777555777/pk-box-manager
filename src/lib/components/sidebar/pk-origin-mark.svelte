<script lang="ts">
	import { Game, type GameType } from '$lib/models/data-models'

	let {
		caughtIn,
		isSelectionValid
	}: {
		caughtIn: string
		isSelectionValid: boolean
	} = $props()

	function deriveGameRegion() {
		const game = Game[caughtIn as GameType]
		return game ? game.region : ''
	}

	function deriveOriginMark() {
		const game = Game[caughtIn as GameType]
		return game ? game.originMark : ''
	}
</script>

{#if !isSelectionValid && caughtIn !== ''}
	<div class="pk-gen">
		{#if deriveOriginMark()}
			<div class="pk-tooltip" data-tooltip="Pokemon Home Origin Mark">
				<img
					src={`/origin-marks/${deriveOriginMark()}.webp`}
					alt={`${deriveOriginMark()} origin mark`}
				/>
			</div>
		{/if}
		<span class="text-small">{deriveGameRegion()}</span>
	</div>
{/if}

<style>
	.pk-gen {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		min-width: 48px;
		gap: 0.25rem;
		text-align: center;

		img {
			image-rendering: auto;
			width: 32px;
			height: 32px;
		}
	}

	@media (max-width: 460px) {
		.pk-gen {
			min-width: 22px;
			gap: 0;

			img {
				width: 23px;
				height: 22px;
			}

			span {
				font-size: 11px;
			}
		}
	}
</style>
