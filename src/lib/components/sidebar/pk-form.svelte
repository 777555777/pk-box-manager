<script lang="ts">
	import { Game, type PokemonUserInfo, type GameType } from '$lib/models/data-models'

	let { userEditedData = $bindable() }: { userEditedData: PokemonUserInfo } = $props()

	// $inspect(userEditedData.caughtIn)
	let gen = $derived(Game[userEditedData.caughtIn as GameType].gen)
</script>

<form>
	<label for="pk-region">Caught in</label>

	<div class="pk-region">
		<select name="region" id="pk-region" bind:value={userEditedData.caughtIn}>
			<option value="">Caught in...</option>
			{#each Object.entries(Game) as [key, value]}
				<option value={value.title}>{value.title}</option>
			{/each}
		</select>

		<span class="pk-gen">Generation {gen}</span>
	</div>

	<label for="comment">Comment</label>
	<textarea name="comment" id="comment" bind:value={userEditedData.comment}></textarea>
</form>

<style>
	form {
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
