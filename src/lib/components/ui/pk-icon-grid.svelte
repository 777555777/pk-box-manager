<script lang="ts">
	import { setCssPosition } from '$lib/spriteheet-helper'
	import PkPagination from './pk-pagination.svelte'

	let {
		data,
		getPosition,
		spriteUrl = '/spritesheets/util/sr1.webp',
		itemsPerPage = 40,
		disabled = false,
		onUpdate = () => {},
		activeItems = new Set(),
		showBackground = true,
		alwaysActive = false,
		fixedHeight = false,
		iconsPerRow = 6,
		hasBorder = false,
		id = crypto.randomUUID()
	}: {
		data: Record<string, any>
		getPosition: (key: string) => { x: number; y: number }
		spriteUrl: string
		itemsPerPage: number
		disabled: boolean
		onUpdate: (value: any) => void
		activeItems: Set<string>
		showBackground?: boolean
		alwaysActive?: boolean
		fixedHeight?: boolean
		iconsPerRow?: number
		hasBorder?: boolean
		id?: string
	} = $props()

	let paginatedData = $state<[string, any][]>([])

	// Check if pagination is needed based on original data
	const needsPagination = $derived(Object.entries(data).length > itemsPerPage)

	// Display data - either paginated or all data if no pagination needed
	const displayData = $derived(needsPagination ? paginatedData : Object.entries(data))

	// Calculate the height of the selector tray content based on itemsPerPage and iconsPerRow
	let calculatedHeight = $derived.by(() => {
		const buttonSize = 44
		const paginationHeight = 60
		const gap = 8
		const borders = hasBorder ? 12 : 0
		const maxRows = Math.ceil(itemsPerPage / iconsPerRow)

		const needsPagination = Object.entries(data).length > itemsPerPage
		const gridHeight = maxRows * buttonSize
		return gridHeight + (needsPagination ? paginationHeight + gap + borders : 0)
	})

	function handlePageChange(data: [string, any][], page: number) {
		paginatedData = data
	}

	function handleItemClick(key: string, value: any, event: MouseEvent) {
		event.preventDefault()
		event.stopPropagation()
		onUpdate(key)
	}
</script>

<section
	class="container-grid {showBackground ? '' : 'no-container-padding'} 
		{fixedHeight ? 'fixed-height' : ''}"
	style={fixedHeight
		? `--calculated-height: ${calculatedHeight}px; --icons-per-row: ${iconsPerRow}`
		: `--icons-per-row: ${iconsPerRow}`}
>
	<div
		class="pk-icon-grid {showBackground ? '' : 'no-background'} 
		{fixedHeight ? 'fixed-grid-height' : ''}"
	>
		{#each displayData as [key, value]: [string, any]}
			<button
				class=""
				{disabled}
				onclick={(event) => !disabled && handleItemClick(key, value, event)}
			>
				<img
					src={spriteUrl}
					style={setCssPosition(getPosition(key))}
					class={alwaysActive || activeItems.has(key) ? '' : 'inactive'}
					alt={key}
					loading="lazy"
				/>
			</button>
		{/each}
	</div>

	{#if needsPagination}
		<div class="pk-pagination">
			<PkPagination {data} {itemsPerPage} onPageChange={handlePageChange} />
		</div>
	{/if}
</section>

<style>
	/* To use this component the following CSS variables need to be set */
	/* --icon-target-size, --icon-original-size, --icon-scale-factor  */

	/* Container Grid Styles */
	.container-grid {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		align-items: center;
		flex: 1;
		min-height: 0;
		gap: 0.5rem;

		&.no-container-padding {
			padding: 0;
		}

		&.fixed-height {
			min-height: calc(var(--calculated-height));
		}
	}

	.pk-icon-grid {
		display: grid;
		grid-template-columns: repeat(var(--icons-per-row), 0fr);
		place-items: center;
		height: 100%;
		padding: 6px;

		border-width: 9px solid;
		border-image: url('/ui/textarea-select-default.webp') 9 fill stretch;
		border-image-outset: 0;
		border-image-width: 9px;

		&:has(button:disabled) {
			filter: brightness(0.75);
		}

		&.no-background {
			border: none;
			padding: 0;
		}

		button {
			background-color: transparent;
			border: 1px solid #5a5a5a81;
			cursor: pointer;
			border-radius: 0.3rem;

			&:hover:not(:disabled) {
				filter: brightness(1.15);
				background-color: hsla(0, 0%, 100%, 0.175);
			}

			&:active:not(:disabled) {
				filter: brightness(0.9);
				background-color: hsla(0, 0%, 100%, 0.1);
			}

			&:focus-visible {
				outline: 3px solid hsl(220, 100%, 65%);
			}

			&:disabled {
				cursor: not-allowed;
				opacity: 0.6;
			}
		}
	}

	.pk-icon-grid:has(button:focus-visible):not(.no-background) {
		border-width: 9px solid;
		border-image: url('/ui/textarea-select-focus.webp') 9 fill stretch;
		border-image-outset: 0;
		border-image-width: 9px;
	}

	/* Icon Button Styles */
	button {
		width: 44px;
		height: 44px;
		border: none;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;

		img {
			width: calc(var(--icon-original-size) * 1px);
			height: calc(var(--icon-original-size) * 1px);

			object-fit: none;
			transform: scale(var(--icon-scale-factor));
			transform-origin: center;
			image-rendering: smooth;
		}
	}

	.inactive {
		opacity: 0.35;
		filter: grayscale(0.8) brightness(0.7);
	}
</style>
