<script lang="ts">
	import { appState } from '$lib/state/app-state.svelte'
	import PkIcon from '$lib/components/ui/pk-icon.svelte'

	export type DropdownOption = [
		string,
		{ title: string; gen: number; region: string; originMark: string | null }
	]

	interface DropdownProps {
		onUpdate: Function
		options: DropdownOption[]
		groups?: (string | number)[]
		disabled?: boolean
		hasSearch?: boolean
		iconSize?: number
		selectedOption?: DropdownOption | null
		id?: string
		labelText?: string
	}

	let {
		onUpdate = () => {},
		options,
		groups,
		disabled = false,
		hasSearch = true,
		iconSize = 24,
		selectedOption = null,
		id = crypto.randomUUID(),
		labelText
	}: DropdownProps = $props()

	let currentSelection = $derived(selectedOption)
	let searchTerm = $state('')

	// Dropdown State Management
	let trayRef = $state<HTMLElement | null>(null)
	let buttonRef = $state<HTMLElement | null>(null)
	let showTray = $derived(appState.isDropdownOpen(id))

	function toggleSelectorTray(event: MouseEvent) {
		event.preventDefault()
		event.stopPropagation()

		if (showTray) {
			appState.closeDropdown()
		} else {
			appState.openDropdown(id)
		}
	}

	function handleClickOutside(event: MouseEvent) {
		if (
			trayRef &&
			!trayRef.contains(event.target as Node) &&
			!buttonRef?.contains(event.target as Node)
		) {
			appState.closeDropdown()
		}
	}

	function selectOption(option: DropdownOption | '') {
		onUpdate(option)
		appState.closeDropdown()
	}

	$effect(() => {
		if (trayRef && showTray) {
			document.addEventListener('click', handleClickOutside)
		}

		return () => {
			document.removeEventListener('click', handleClickOutside)
		}
	})

	// Deselect-Option
	const deselectOption: DropdownOption = [
		'deselect',
		{ title: 'Select Option', gen: 0, region: '', originMark: null }
	]

	// Filter for normal options
	let filteredOptions = $derived.by(() => options.filter(matchesSearchTerm))

	// Check if Deselect-Option should be filtered
	let showDeselectOption = $derived.by(() => {
		if (!searchTerm) return true
		return matchesSearchTerm(deselectOption)
	})

	function matchesSearchTerm([key, value]: DropdownOption): boolean {
		if (value.title.toLowerCase().includes(searchTerm.toLowerCase())) return true
		if (key.toLowerCase().includes(searchTerm.toLowerCase())) return true
		if (value.region.toLowerCase().includes(searchTerm.toLowerCase())) return true
		return false
	}
</script>

<div>
	{#if labelText}
		<p class="pk-dropdown-label">{labelText}</p>
	{/if}

	<div class="pk-dropdown">
		<button
			bind:this={buttonRef}
			{disabled}
			class="dropdown-toggle"
			type="button"
			onclick={toggleSelectorTray}
		>
			<span>
				{Array.isArray(currentSelection) ? currentSelection[1].title : 'Select Option'}
			</span>

			<div class="extra-info">
				{#if currentSelection && currentSelection[1].region}
					<span class="text-small">{currentSelection[1].region}</span>
				{/if}
				{#if currentSelection && currentSelection[1].originMark}
					<img
						width={iconSize}
						height={iconSize}
						src="/origin-marks/{currentSelection[1].originMark}.webp"
						alt={currentSelection[1].originMark}
					/>
				{/if}
				<span class="dropdown-arrow" class:open={showTray}></span>
			</div>
		</button>

		{#if showTray}
			<!-- Dropdown content -->
			<div bind:this={trayRef} class="dropdown-content">
				<!-- filter dropdown options by search -->
				{#if hasSearch}
					<div class="search-container">
						<label for="games" class="sr-only">Filter dropdown options</label>
						<input id="games" name="games" bind:value={searchTerm} placeholder="Filter..." />
						{#if searchTerm}
							<button
								type="button"
								class="clear-input-button"
								onclick={(event) => {
									event.stopPropagation()
									searchTerm = ''
								}}
								title="Clear search"
							>
								<PkIcon name="close" size={18} />
							</button>
						{/if}
					</div>
				{/if}

				{#if groups && groups.length > 0 && options.length > 0}
					<!-- Display Deselect-Option if it should be filtered -->
					{#if showDeselectOption}
						<ul class="group-list">
							<li class="option-group">
								<ul class="option-list">
									{@render renderDeselectOption()}
								</ul>
							</li>
						</ul>
					{/if}

					<!-- If Groups and Options are provided => render grouped Options -->
					{#each groups as group}
						{@const groupOptions = filteredOptions.filter(([key, value]) => value.gen === group)}
						<ul class="group-list">
							{#if groupOptions.length > 0}
								<li class="option-group">
									<h4>Generation {group}</h4>
									<ul class="option-list">
										{@render iterateOptions(groupOptions)}
									</ul>
								</li>
							{/if}
						</ul>
					{/each}
				{:else}
					<!-- Display Deselect-Option if it should be filtered -->
					{#if showDeselectOption}
						{@render renderDeselectOption()}
					{/if}

					<!-- If no Groups are provided => render only Options -->
					{@render iterateOptions(filteredOptions)}
				{/if}
			</div>
		{/if}
	</div>
</div>

{#snippet iterateOptions(optionsToRender: DropdownOption[])}
	{#each optionsToRender as [key, value]}
		<li>
			<button onclick={() => selectOption([key, value])}>
				<span>{value.title}</span>
				<div class="extra-info">
					{#if value.region}
						<span class="text-small">{value.region}</span>
					{/if}
					{#if value.originMark}
						<img
							width={iconSize}
							height={iconSize}
							src="/origin-marks/{value.originMark}.webp"
							alt={value.originMark}
						/>
					{/if}
				</div>
			</button>
		</li>
	{/each}
{/snippet}

{#snippet renderDeselectOption()}
	<li>
		<button onclick={() => selectOption('')}>
			<span>Deselect</span>
		</button>
	</li>
{/snippet}

<style>
	button {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		color: var(--ui-text-color);
		cursor: pointer;
		padding-inline: 1rem;
		border: none;

		.extra-info {
			display: flex;
			align-items: center;
			gap: 0.5rem;
		}
	}
	.pk-dropdown-label {
		margin-bottom: 0.375rem;
	}
	.pk-dropdown {
		position: relative;
		display: inline-block;
		width: 100%;
		height: var(--ui-form-element-height);
		color: var(--ui-text-color);
		cursor: pointer;

		.dropdown-toggle {
			background-color: transparent;
			image-rendering: pixelated;

			border-width: 9px solid;
			border-image: url('/ui/textarea-select-default.webp') 9 fill round;
			border-image-outset: 0;
			border-image-width: 9px;
			&:focus-visible {
				border-image-source: url('/ui/textarea-select-focus.webp');
			}

			.extra-info {
				color: var(--ui-text-disabled);

				.dropdown-arrow {
					margin-left: 0.5rem;
					content: url('/ui/select-caret.webp');
					display: inline-block;

					&.open {
						transform-origin: center;
						transform: rotate(90deg);
					}
				}
			}
		}

		&:has(.dropdown-toggle:hover) .dropdown-toggle {
			filter: brightness(1.15);
		}

		&:has(.dropdown-toggle:active) .dropdown-toggle {
			filter: brightness(0.9);
		}

		&:has(button:disabled) {
			filter: brightness(0.75);
			pointer-events: none;
			cursor: not-allowed;
			color: var(--ui-text-disabled);
		}
	}

	.dropdown-toggle:focus-visible {
		outline: none;
	}

	/* ======================================================= */

	.dropdown-content {
		background-color: var(--ui-section-background-color);

		max-height: calc(var(--dropdown-max-height, 540) * 1px);
		overflow-y: auto;
		position: absolute;
		top: calc(100% - 3px);
		left: 0;
		width: 100%;
		z-index: 20;

		/* Pixeliger UI-Border wie andere Elemente */
		/* border-width: 9px; */
		border-style: solid;
		border-color: transparent;
		border-image: url('/ui/textarea-select-default.webp') 9 fill round;
		border-image-outset: 0;
		border-image-width: 9px;

		image-rendering: pixelated;

		/* Schatten für bessere Tiefe */
		border-radius: 9px;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);

		/* Scrollbar styling */
		scrollbar-width: thin;
		scrollbar-color: #5d5d6f transparent;

		&:focus-visible {
			outline: none;
			border-image-source: url('/ui/textarea-select-focus.webp');
		}

		/* Search container styling */
		.search-container {
			position: relative;
			margin: 0.5rem;
			display: flex;
			align-items: center;
		}

		input {
			width: 100%;
			padding: 0.5rem 2.5rem 0.5rem 0.75rem; /* Platz für Button rechts */
			background-color: rgba(0, 0, 0, 0.2);
			border: 2px solid #5d5d6f;
			border-radius: 4px;
			color: var(--ui-text-color);

			&:focus {
				outline: none;
				border-color: var(--ui-text-active);
				background-color: rgba(0, 0, 0, 0.3);
			}

			&::placeholder {
				color: var(--ui-text-disabled);
			}
		}

		.clear-input-button {
			position: absolute;
			right: 0.25rem;
			top: 50%;
			transform: translateY(-50%);
			width: 2rem;
			height: 2rem;
			padding: 0;
			background-color: transparent;
			border: 1px solid #5d5d6f;
			border-radius: 3px;
			color: var(--ui-text-disabled);
			cursor: pointer;
			place-content: center;

			&:hover {
				background-color: rgba(255, 178, 103, 0.15);
				border-color: var(--ui-text-active);
				color: var(--ui-text-active);
			}

			&:active {
				background-color: rgba(255, 178, 103, 0.25);
				transform: translateY(-50%) translateY(1px);
			}
		}

		li {
			list-style: none;

			button {
				width: 100%;
				padding: 0.6rem 1rem;
				background-color: transparent;
				border: none;
				color: var(--ui-text-color);
				cursor: pointer;
				text-align: left;

				/* Flexbox für Option-Layout */
				display: flex;
				align-items: center;
				justify-content: space-between;
				gap: 1rem;

				/* Hover-Effekt mit pixeligem Stil */
				&:hover {
					background-color: rgba(255, 178, 103, 0.15);
					border-left: 3px solid var(--ui-text-active);
					padding-left: calc(1rem - 3px);
				}

				&:active {
					background-color: rgba(255, 178, 103, 0.25);
					transform: translateY(1px);
				}

				.extra-info {
					display: flex;
					align-items: center;
					gap: 0.5rem;
					opacity: 0.8;

					.text-small {
						font-size: 0.85em;
						color: var(--ui-text-disabled);
					}
				}
			}
		}

		h4 {
			padding: 0.6rem 1rem;
			font-weight: bold;
			letter-spacing: 0.05em;
			cursor: default;
			background-color: rgba(0, 0, 0, 0.2);

			/* Pixeliger Text-Schatten */
			text-shadow:
				1px 1px 0 rgba(0, 0, 0, 0.8),
				0px 1px 0 rgba(0, 0, 0, 0.8),
				1px 0 0 rgba(0, 0, 0, 0.8);
		}
	}
</style>
