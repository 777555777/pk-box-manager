<script lang="ts">
	import PkTextarea from '#lib/components/ui/pk-textarea.svelte'
	import PkDropdown from '#lib/components/ui/pk-game-dropdown.svelte'
	import { Game, Generations, type GameType } from '#lib/models/data-models.ts'
	import type { EntryData } from '#lib/dex/types.ts'

	let {
		selectedPokemon,
		disabled,
		updateCaughtIn,
		updateComment,
		updateOriginalTrainer
	}: {
		selectedPokemon: EntryData
		disabled: boolean
		isSelectionValid: boolean
		updateCaughtIn: Function
		updateComment: Function
		updateOriginalTrainer: Function
	} = $props()
</script>

<div class="pk-inputs">
	<div class="pk-region">
		<PkDropdown
			onUpdate={updateCaughtIn}
			options={Object.entries(Game)}
			groups={Generations.slice()}
			{disabled}
			selectedOption={(() => {
				const caughtIn = selectedPokemon.caughtIn as GameType
				return caughtIn && Game[caughtIn] ? [caughtIn, Game[caughtIn]] : null
			})()}
			labelText="Caught in"
		/>
	</div>
	<div class="pk-ot-container">
		<PkTextarea
			label="Original Trainer"
			onUpdate={updateOriginalTrainer}
			value={selectedPokemon.originalTrainer}
			debounceTime={250}
			maxlength={32}
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

	.pk-ot-container :global(.pk-textarea) {
		min-height: var(--ui-form-element-height);
		height: var(--ui-form-element-height);
		resize: none;
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
