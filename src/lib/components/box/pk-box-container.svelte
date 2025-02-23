<script lang="ts">
	import { type BoxOrder } from '$lib/models/data-models'
	import PkBox from '$lib/components/box/pk-box.svelte'
	import boxOrder from '$lib/order/order-national-forms.json'

	const boxes: BoxOrder[] = boxOrder
</script>

<section class="pk-box-container">
	{#each boxes as box}
		<PkBox {box} />
	{/each}
</section>

<style>
	.pk-box-container {
		margin: 4rem 0;
		width: 100%;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
		gap: 2rem;
	}
</style>
