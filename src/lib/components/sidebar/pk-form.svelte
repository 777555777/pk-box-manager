<script lang="ts">
	import PkGameSelector from '$lib/components/ui/pk-game-selector.svelte'
	import PkTextarea from '$lib/components/ui/pk-textarea.svelte'
	import { type PokemonState } from '$lib/state/storage-handler'

	let {
		selectedPokemon,
		disabled,
		updateCaughtIn,
		updateComment
	}: {
		selectedPokemon: PokemonState
		disabled: boolean
		isSelectionValid: boolean
		updateCaughtIn: Function
		updateComment: Function
	} = $props()
</script>

<div class="pk-inputs">
	<div class="pk-region">
		<PkGameSelector
			label="Caught in"
			onUpdate={updateCaughtIn}
			value={selectedPokemon.caughtIn}
			{disabled}
		/>
	</div>
	<div class="pk-comment-container">
		<PkTextarea
			label="Comment"
			onUpdate={updateComment}
			value={selectedPokemon.comment}
			debounceTime={250}
			{disabled}
		/>
	</div>
</div>

<style>
	.pk-inputs {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	@media (max-height: 1200px) {
		.pk-comment-container :global(.pk-textarea) {
			min-height: 5rem;
		}
	}
	@media (max-height: 1000px) {
		.pk-comment-container :global(.pk-textarea) {
			margin-bottom: 0.25rem;
			min-height: 4rem;
		}
	}
</style>
