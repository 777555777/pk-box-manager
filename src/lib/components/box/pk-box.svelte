<script lang="ts">
	import { type BoxOrder } from '$lib/models/data-models'
	import PkSlot from '$lib/components/box/pk-slot.svelte'
	import { getIdentifier } from '$lib/spriteheet-helper'

	let { box }: { box: BoxOrder } = $props()
</script>

<article class="pk-box">
	<header class="box-header">
		<h2>{box.title}</h2>
	</header>
	<div class="box-grid">
		{#each box.pokemon as pokemon (getIdentifier(pokemon))}
			<PkSlot pokemonEntry={pokemon} />
		{/each}
	</div>
</article>

<style>
	.pk-box {
		display: grid;
		grid-template-rows: auto 1fr;
		justify-items: center;
		gap: 0.75rem;
	}
	.box-header {
		width: 258px;
		height: 52px;

		display: flex;
		justify-content: center;
		align-items: center;

		/* concept placeholder */
		background-color: hsl(290, 100%, 90%);
		/* border: 2px solid hsl(280, 70%, 50%); */
		border-radius: 10px;
		padding: 10px;

		h2 {
			font-size: 1.5rem;
			font-weight: normal;
		}
	}
	.box-grid {
		box-sizing: content-box;
		display: grid;
		grid-template-columns: repeat(6, 1fr);
		grid-template-rows: repeat(5, 1fr);
		gap: 0;

		/* width: 384px; */
		height: 320px;

		/* concept placeholder */
		background-color: hsl(10, 100%, 90%);
		/* border: 2px solid hsl(0, 70%, 50%); */
		border-radius: 10px;
		padding: 10px;
	}
</style>
