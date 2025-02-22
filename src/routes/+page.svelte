<script lang="ts">
	import PkBoxContainer from '$lib/components/box/pk-box-container.svelte'
	import PkSidebar from '$lib/components/sidebar/pk-sidebar.svelte'
</script>

<main>
	<PkBoxContainer />
	<!-- <PkSidebar /> -->
</main>

<style>
	main {
		display: flex;
		justify-content: center;
		gap: 2rem;

		margin: 0 4rem;
		position: relative;
	}
</style>
