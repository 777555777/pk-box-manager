<script lang="ts">
	type Option = [string, { title: string; gen: number; region: string; originMark: string | null }]

	interface DropdownProps {
		onUpdate: Function
		options: Option[]
		groups?: (string | number)[]
		disabled?: boolean
		hasSearch?: boolean
		iconSize?: number
		selectedOption?: Option | null
	}

	let {
		onUpdate = () => {},
		options,
		groups,
		disabled = false,
		hasSearch = true,
		iconSize = 24,
		selectedOption = null
	}: DropdownProps = $props()

	let isOpen = $state(false)
	let currentSelection = $derived(selectedOption)

	let searchTerm = $state('')

	// Deselect-Option erstellen
	const deselectOption: Option = [
		'deselect',
		{ title: 'Select Option', gen: 0, region: '', originMark: null }
	]

	// Filterfunktion für normale Optionen
	let filteredOptions = $derived.by(() => options.filter(matchesSearchTerm))

	// Prüfen ob Deselect-Option gefiltert werden soll
	let showDeselectOption = $derived.by(() => {
		if (!searchTerm) return true
		return matchesSearchTerm(deselectOption)
	})

	function matchesSearchTerm([key, value]: Option): boolean {
		if (value.title.toLowerCase().includes(searchTerm.toLowerCase())) return true
		if (key.toLowerCase().includes(searchTerm.toLowerCase())) return true
		if (value.region.toLowerCase().includes(searchTerm.toLowerCase())) return true
		return false
	}

	function selectOption(option: Option | null) {
		currentSelection = option
		isOpen = false
		onUpdate(option)
	}
</script>

<div class="pk-dropdown">
	<button {disabled} class="dropdown-toggle" type="button" onclick={() => (isOpen = !isOpen)}>
		<span>
			{Array.isArray(currentSelection) ? currentSelection[1].title : 'Select Option'}
		</span>

		<div class="extra-info">
			{#if currentSelection && currentSelection[1].region}
				<span>{currentSelection[1].region}</span>
			{/if}
			{#if currentSelection && currentSelection[1].originMark}
				<img
					width={iconSize}
					height={iconSize}
					src="/origin-marks/{currentSelection[1].originMark}.webp"
					alt={currentSelection[1].originMark}
				/>
			{/if}
			<!-- <span class="dropdown-arrow"></span> -->
		</div>
	</button>

	{#if isOpen}
		<!-- Dropdown content -->
		<div class="dropdown-content">
			<!-- filter dropdown options by search -->
			{#if hasSearch}
				<label for="games">Filter</label>
				<input id="games" name="games" bind:value={searchTerm} />
			{/if}

			{#if groups && groups.length > 0 && options.length > 0}
				<!-- Deselect-Option anzeigen wenn sie gefiltert werden soll -->
				{#if showDeselectOption}
					<ul class="group-list">
						<li class="option-group">
							<ul class="option-list">
								{@render renderDeselectOption()}
							</ul>
						</li>
					</ul>
				{/if}

				<!-- If Groups and Options are provieded => render grouped Options -->
				{#each groups as group}
					{@const groupOptions = filteredOptions.filter(([key, value]) => value.gen === group)}
					<ul class="group-list">
						{#if groupOptions.length > 0}
							<li class="option-group">
								<h4>Test {group}</h4>
								<ul class="option-list">
									{@render iterateOptions(groupOptions)}
								</ul>
							</li>
						{/if}
					</ul>
				{/each}
			{:else}
				<!-- Deselect-Option anzeigen wenn sie gefiltert werden soll -->
				{#if showDeselectOption}
					{@render renderDeselectOption()}
				{/if}

				<!-- If no Groups are provieded => render only Options -->
				{@render iterateOptions(filteredOptions)}
			{/if}
		</div>
	{/if}
</div>

{#snippet iterateOptions(testOptions: Option[])}
	{#each testOptions as [key, value]}
		<li>
			<button onclick={() => selectOption([key, value])}>
				<span>{value.title}</span>
				<div class="extra-info">
					{#if value.region}
						<span>{value.region}</span>
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
		<button onclick={() => selectOption(null)}>
			<span>Deselect</span>
		</button>
	</li>
{/snippet}

<style>
	.pk-dropdown {
		position: relative; /* wichtig, damit absolute Positionierung vom Content relativ zur Dropdown-Hülle gilt */
		display: inline-block; /* oder block, je nach Layout */
		/* width: max-content; oder eine feste Breite, falls nötig */
		background-color: blueviolet;
	}

	.dropdown-content {
		background-color: bisque;
		max-height: 180px;
		overflow-y: scroll;
		position: absolute;
		top: 100%; /* direkt unter dem Button */
		left: 0;
		width: 100%; /* macht den Content so breit wie der .pk-dropdown Container */
		z-index: 20;
	}

	li {
		list-style: none;
	}

	button {
		width: 100%;
		height: 2rem;
		padding-inline: 0.5rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		background-color: rgb(128, 128, 128);
		gap: 3rem;
		cursor: pointer;

		border: none;
		margin-block: 0.25rem;

		.extra-info {
			display: flex;
			align-items: center;
			gap: 0.5rem;
		}
	}
</style>
