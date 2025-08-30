<script lang="ts">
	import { Balls, type BallsType } from '$lib/models/balls-models'
	import type { PokemonEditState } from '$lib/models/data-models'
	import { Marks, type MarksType } from '$lib/models/marks-models'
	import { Ribbons, type RibbonsType } from '$lib/models/ribbons-models'
	import { setCssPosition } from '$lib/spriteheet-helper'
	import { appState } from '$lib/state/app-state.svelte'
	import type { BadgeDisplayMode } from '$lib/state/storage-handler'

	let {
		pokemonState,
		badgeDisplay
	}: { pokemonState: PokemonEditState; badgeDisplay: BadgeDisplayMode } = $props()

	// Derived state for selected Pokemon's sprite data
	let appSettings = $derived(appState.getAppSettings())

	function getBallPosition(selectedBall: BallsType) {
		return Balls[selectedBall].pos || { x: 0, y: 0 }
	}

	function getRibbonPosition(selectedRibbon: RibbonsType) {
		return Ribbons[selectedRibbon].pos || { x: 0, y: 0 }
	}

	function getMarkPosition(selectedMark: MarksType) {
		return Marks[selectedMark].pos || { x: 0, y: 0 }
	}

	// Conditional badge display logic
	function shouldShowRibbonBadge(): boolean {
		// If not using conditional display, show if Pokemon has any ribbons
		if (appSettings.badgeCycleOption !== 'filter') {
			return pokemonState.ribbons.length > 0
		}

		// If using conditional display, check if Pokemon has the specified ribbon
		const requiredRibbon = appSettings.conditionalBadgeDisplay.ribbon
		return pokemonState.ribbons.includes(requiredRibbon)
	}

	function shouldShowMarkBadge(): boolean {
		// If not using conditional display, show if Pokemon has any marks
		if (appSettings.badgeCycleOption !== 'filter') {
			return pokemonState.marks.length > 0
		}

		// If using conditional display, check if Pokemon has the specified mark
		const requiredMark = appSettings.conditionalBadgeDisplay.mark
		return pokemonState.marks.includes(requiredMark)
	}
</script>

{#if badgeDisplay === 'ball' && pokemonState.ball}
	<img
		class="pk-badge"
		src={`/spritesheets/util/sb1.webp`}
		style="--original-size: 30; {setCssPosition(getBallPosition(pokemonState.ball as BallsType))}"
		alt={pokemonState.ball}
	/>
{/if}
{#if badgeDisplay === 'comment' && pokemonState.comment.length > 0}
	<img
		class="pk-badge"
		src={`/ui/text-bubble.webp`}
		style="--original-size: 30;"
		alt="Has comment"
	/>
{/if}
{#if badgeDisplay === 'ribbon' && shouldShowRibbonBadge()}
	{@const displayRibbon =
		appSettings.badgeCycleOption === 'filter'
			? appSettings.conditionalBadgeDisplay.ribbon
			: pokemonState.ribbons[0]}
	<img
		class="pk-badge"
		src={`/spritesheets/util/sr1.webp`}
		style="--original-size: 40; {setCssPosition(getRibbonPosition(displayRibbon as RibbonsType))}"
		alt={displayRibbon}
	/>
{/if}
{#if badgeDisplay === 'mark' && shouldShowMarkBadge()}
	{@const displayMark =
		appSettings.badgeCycleOption === 'filter'
			? appSettings.conditionalBadgeDisplay.mark
			: pokemonState.marks[0]}
	<img
		class="pk-badge"
		src={`/spritesheets/util/sm1.webp`}
		style="--original-size: 48; {setCssPosition(getMarkPosition(displayMark as MarksType))}"
		alt={displayMark}
	/>
{/if}

<style>
	.pk-badge {
		--target-size: 24;
		--scale-factor: calc(var(--target-size) / var(--original-size));

		width: calc(var(--original-size) * 1px);
		height: calc(var(--original-size) * 1px);
		object-fit: none;
		transform: scale(var(--scale-factor));
		transform-origin: top left;

		filter: brightness(var(--grayscale));

		position: absolute;
		inset: 0;
		top: 38px;
		left: 38px;

		image-rendering: auto;

		border-radius: 5px;
		background-color: hsla(0, 0%, 90%, 0.35);
	}

	@media (max-width: 1500px) {
		.pk-badge {
			--target-size: 20;
			top: 36px;
			left: 36px;
		}
	}

	@media (max-width: 400px) {
		.pk-badge {
			top: 32px;
			left: 32px;
		}
	}
</style>
