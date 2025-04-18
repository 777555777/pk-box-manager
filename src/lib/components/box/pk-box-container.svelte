<script lang="ts">
	import { type BoxOrder } from '$lib/models/data-models'
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
		grid-template-columns: repeat(auto-fill, minmax(404px, 1fr));
		row-gap: 3rem;
		column-gap: 2rem;
		justify-items: center;
		margin-bottom: 2rem;
	}
</style>
