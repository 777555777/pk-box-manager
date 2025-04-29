<script lang="ts">
	import PkGameSelector from '$lib/components/ui/pk-game-selector.svelte'
	import PkTextarea from '$lib/components/ui/pk-textarea.svelte'
	import { pkState } from '$lib/state/pk-state.svelte'
	import { Game, type GameType } from '$lib/models/data-models'
	import { type PokemonState } from '$lib/state/storage-handler'

	let {
		selectedPokemon,
		identifier,
		disabled,
		isSelectionValid
	}: {
		selectedPokemon: PokemonState
		identifier: string
		disabled: boolean
		isSelectionValid: boolean
	} = $props()

	function deriveGameRegion() {
		const game = Game[selectedPokemon.caughtIn as GameType]
		return game ? game.region : ''
	}

	// === Game Dropdown ===
	function updateCaughtIn(newValue: GameType) {
		pkState.updatePokemon(identifier, {
			caughtIn: newValue
		})
	}

	// === Comment Textarea ===
	function updateComment(newValue: string) {
		pkState.updatePokemon(identifier, {
			comment: newValue
		})
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
				<img width="48px" src="mark-example.png" alt="" />
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
		align-items: center;

		margin-bottom: 0.75rem;
	}

	.pk-gen {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
	}
</style>
