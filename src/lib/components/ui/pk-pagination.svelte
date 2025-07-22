<script lang="ts">
	import { onMount } from 'svelte'

	let {
		data,
		itemsPerPage,
		onPageChange
	}: { data: Object; itemsPerPage: number; onPageChange: Function } = $props()

	let currentPage = $state(0)

	let dataAmount = $derived(Object.entries(data))
	let totalPages = $derived(Math.ceil(dataAmount.length / itemsPerPage))

	let paginatedData = $derived(() => {
		const startIndex = currentPage * itemsPerPage
		return dataAmount.slice(startIndex, startIndex + itemsPerPage)
	})

	// Call onPageChange when data or page changes
	function updateParent() {
		if (onPageChange) {
			onPageChange(paginatedData(), currentPage)
		}
	}

	// Initialize first page on mount
	onMount(() => {
		updateParent()
	})

	function nextPage() {
		if (currentPage < totalPages - 1) {
			currentPage++
			updateParent()
		}
	}

	function prevPage() {
		if (currentPage > 0) {
			currentPage--
			updateParent()
		}
	}
</script>

<!-- Pagination Controls -->
<section class="pagination-controls">
	<button
		class="pagination-btn"
		onclick={prevPage}
		disabled={currentPage === 0}
		aria-label="Previous page"
	>
		<img src="/ui/pagination-arrow.webp" alt="Previous" />
	</button>
	<span class="page-indicator">
		{currentPage + 1} / {totalPages}
	</span>
	<button
		class="pagination-btn"
		onclick={nextPage}
		disabled={currentPage === totalPages - 1}
		aria-label="Next page"
	>
		<img src="/ui/pagination-arrow.webp" alt="Next" />
	</button>
</section>

<style>
	/* Pagination Styles */
	.pagination-controls {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 2rem;

		button {
			max-width: 3rem;
			border-radius: 5px;
			display: grid;
			place-items: center;
			cursor: pointer;
			background: transparent;
		}
		button:last-child {
			transform: scaleX(-1);
		}
	}

	.pagination-btn {
		color: white;
		padding: 4px 8px;
		cursor: pointer;
		border: none;

		&:hover:not(:disabled) {
			background-color: hsla(0, 0%, 100%, 0.175);
			img {
				filter: brightness(1.5);
			}
		}

		&:focus-visible {
			outline: 3px solid hsl(220, 100%, 65%);
		}

		&:disabled {
			img {
				filter: grayscale(1);
			}
			cursor: not-allowed;
		}
	}

	.page-indicator {
		color: white;
		min-width: 4rem;
		text-align: center;
	}
</style>
