<script lang="ts">
	import { type BoxOrder } from '$lib/state/storage-handler'
	import PkBox from '$lib/components/box/pk-box.svelte'

	let { dexOrder }: { dexOrder: BoxOrder[] } = $props()
</script>

<section class="pk-box-container">
	{#each dexOrder as box (box.title)}
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
		padding-top: 8rem;
		padding-bottom: 2rem;

		overflow-y: scroll;
		scrollbar-width: none;
	}
</style>
