<script lang="ts">
	import type { PokemonState } from '$lib/state/storage-handler'
	import { pokemonStateManager } from '$lib/state/state-manager.svelte'
	import { getIdentifier } from '$lib/spriteheet-helper'
	import { Game, Generations, type GameType } from '$lib/models/data-models'

	let {
		selectedPokemon,
		sidebarEditMode
	}: { selectedPokemon: PokemonState; sidebarEditMode: boolean } = $props()
	let identifier = $derived(getIdentifier(selectedPokemon.idEntry))
	let localComment = $state(selectedPokemon.comment)
	let localCaughtIn = $state(selectedPokemon.caughtIn)
	let isSelectionValid = $derived(identifier === '0000-null')

	$inspect(localCaughtIn)

	function saveComment() {
		pokemonStateManager.updatePokemonState(identifier, {
			comment: localComment
		})
	}

	function saveCaughtIn() {
		pokemonStateManager.updatePokemonState(identifier, {
			caughtIn: localCaughtIn
		})
	}

	function deriveGameGen() {
		const gameKey = selectedPokemon.caughtIn
		if (gameKey in Game) {
			return Game[gameKey as GameType].gen
		}
		return ''
	}

	// Update local state when the prop changes
	$effect(() => {
		localComment = selectedPokemon.comment
		localCaughtIn = selectedPokemon.caughtIn
	})
</script>

<div class="pk-inputs">
	<label for="pk-region">Caught in</label>

	<div class="pk-region">
		<select
			name="region"
			id="pk-region"
			bind:value={localCaughtIn}
			onchange={saveCaughtIn}
			disabled={isSelectionValid || !sidebarEditMode}
		>
			<option value="">Select game</option>
			{#each Generations as gen}
				<optgroup label={`Generation ${gen}`}>
					{#each Object.entries(Game) as [key, value]}
						{#if value.gen === gen}
							<option value={key}>{value.title}</option>
						{/if}
					{/each}
				</optgroup>
			{/each}
		</select>
		{#if !isSelectionValid}
			<span class="pk-gen">Generation {deriveGameGen()}</span>
		{/if}
	</div>

	{@render commentButton()}
	<label for="comment">Comment</label>
	<textarea name="comment" id="comment" bind:value={localComment} disabled={sidebarEditMode}
	></textarea>
</div>

{#snippet commentButton()}
	<div class="button-group">
		<button type="button" onclick={saveComment} disabled={isSelectionValid || !sidebarEditMode}>
			Save comment
		</button>
	</div>
{/snippet}

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

	textarea {
		min-height: 196px;
		max-width: 400px;
	}
</style>
