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
		padding-top: 8rem;
		padding-bottom: 2rem;
		padding-right: 4rem; /* Prevent Tooltips from beeing cut off, used instead of gap: 4rem; */

		overflow-y: auto;
		scrollbar-width: none;
	}

	@media (max-width: 1350px) {
		.pk-box-container {
			padding-right: 2rem;
		}
	}
</style>
