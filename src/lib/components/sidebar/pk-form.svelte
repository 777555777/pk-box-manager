<script lang="ts">
	import PkGameSelector from '$lib/components/ui/pk-game-selector.svelte'
	import PkTextarea from '$lib/components/ui/pk-textarea.svelte'
	import { Game, type GameType } from '$lib/models/data-models'
	import { type PokemonState } from '$lib/state/storage-handler'

	let {
		selectedPokemon,
		disabled,
		isSelectionValid,
		updateCaughtIn,
		updateComment
	}: {
		selectedPokemon: PokemonState
		disabled: boolean
		isSelectionValid: boolean
		updateCaughtIn: Function
		updateComment: Function
	} = $props()

	function deriveGameRegion() {
		const game = Game[selectedPokemon.caughtIn as GameType]
		return game ? game.region : ''
	}

	function deriveOriginMark() {
		const game = Game[selectedPokemon.caughtIn as GameType]
		return game ? game.originMark : ''
	}
</script>

<div class="pk-inputs">
	<div class="pk-region">
		<PkGameSelector
			label="Caught in"
			onUpdate={updateCaughtIn}
			value={selectedPokemon.caughtIn}
			{disabled}
		/>
		{#if !isSelectionValid && selectedPokemon.caughtIn !== ''}
			<div class="pk-gen">
				<span>{deriveGameRegion()}</span>
				{#if deriveOriginMark()}
					<img
						width="44px"
						src={`/origin-marks/${deriveOriginMark()}.webp`}
						alt={`${deriveOriginMark()} origin mark`}
						title={`${deriveOriginMark()} origin mark`}
					/>
				{/if}
			</div>
		{/if}
	</div>
	<PkTextarea
		label="Comment"
		onUpdate={updateComment}
		value={selectedPokemon.comment}
		debounceTime={250}
		{disabled}
	/>
</div>

<style>
	.pk-region {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;

		margin-bottom: 0.75rem;
	}

	.pk-gen {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.3rem;
		min-height: 44px;

		img {
			image-rendering: auto;
		}
	}
</style>
