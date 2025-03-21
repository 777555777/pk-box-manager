<script lang="ts">
	import type { PokemonState } from '$lib/state/storage-handler'
	import { pkState } from '$lib/state/pk-state.svelte'
	import { getIdentifier } from '$lib/spriteheet-helper'
	import { Game, type GameType } from '$lib/models/data-models'
	import PkGameSelector from '$lib/components/ui/pk-game-selector.svelte'
	import PkTextarea from '$lib/components/ui/pk-textarea.svelte'

	let { selectedPokemon, viewerMode }: { selectedPokemon: PokemonState; viewerMode: boolean } =
		$props()
	let identifier = $derived(getIdentifier(selectedPokemon.idEntry))
	let isSelectionValid = $derived(identifier === '0000-null')

	function deriveGameGen() {
		const gameKey = selectedPokemon.caughtIn
		if (gameKey in Game) {
			return Game[gameKey as GameType].gen
		}
		return ''
	}

	// === Game Dropdown ===
	function handleGameChange(newValue: GameType) {
		pkState.updatePokemonState(identifier, {
			caughtIn: newValue
		})
	}

	// === Comment Textarea ===
	function handleCommentChange(newValue: string) {
		console.log('updating the state :D')
		pkState.updatePokemonState(identifier, {
			comment: newValue
		})
	}
</script>

<div class="pk-inputs">
	<div class="pk-region">
		<PkGameSelector
			onChange={handleGameChange}
			disabled={isSelectionValid || viewerMode}
			value={selectedPokemon.caughtIn}
		/>
		{#if !isSelectionValid && selectedPokemon.caughtIn !== ''}
			<span class="pk-gen">Generation {deriveGameGen()}</span>
		{/if}
	</div>

	<PkTextarea
		label="Comment"
		onInput={handleCommentChange}
		value={selectedPokemon.comment}
		debounceTime={1250}
		disabled={isSelectionValid || viewerMode}
	/>
</div>

<style>
	.pk-inputs {
		display: flex;
		justify-content: flex-start;
		flex-direction: column;
	}

	.pk-region {
		display: flex;
		justify-content: space-between;
	}
</style>
