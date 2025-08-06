<script lang="ts">
	import { type DexStorage } from '$lib/state/storage-handler'
	import PkBox from '$lib/components/box/pk-box.svelte'

	let { dexStorage }: { dexStorage: DexStorage } = $props()
</script>

<section class="pk-box-container">
	{#each dexStorage.boxes as box (box.id)}
		<PkBox {box} />
	{/each}
</section>

<style>
	.pk-box-container {
		width: 100%;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(var(--box-width), 1fr));
		row-gap: 3rem;
		column-gap: 2rem;
		justify-items: center;
		padding: 8rem 2rem 2rem 2rem; /* Padding left and right to prevent Tooltips from beeing cut off */

		overflow-y: auto;
		scrollbar-width: none;
	}

	@media (max-width: 680px) {
		.pk-box-container {
			padding-inline: 0.5rem;
		}
	}
</style>
