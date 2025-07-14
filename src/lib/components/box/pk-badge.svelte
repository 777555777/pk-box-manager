<script lang="ts">
	import { Balls, type BallsType } from '$lib/models/balls-models'
	import { Marks, type MarksType } from '$lib/models/marks-models'
	import { Ribbons, type RibbonsType } from '$lib/models/ribbons-models'
	import { setCssPosition } from '$lib/spriteheet-helper'
	import { type BadgeDisplayMode, type PokemonState } from '$lib/state/storage-handler'

	let {
		pokemonState,
		badgeDisplay
	}: { pokemonState: PokemonState; badgeDisplay: BadgeDisplayMode } = $props()

	function getBallPosition(selectedBall: BallsType) {
		return Balls[selectedBall].pos || { x: 0, y: 0 }
	}

	function getRibbonPosition(selectedRibbon: RibbonsType) {
		return Ribbons[selectedRibbon].pos || { x: 0, y: 0 }
	}

	function getMarkPosition(selectedMark: MarksType) {
		return Marks[selectedMark].pos || { x: 0, y: 0 }
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
{#if badgeDisplay === 'ribbon' && pokemonState.ribbons.length > 0}
	<img
		class="pk-badge"
		src={`/spritesheets/util/sr1.webp`}
		style="--original-size: 40; {setCssPosition(
			getRibbonPosition(pokemonState.ribbons[0] as RibbonsType)
		)}"
		alt={pokemonState.ribbons[0]}
	/>
{/if}
{#if badgeDisplay === 'mark' && pokemonState.marks.length > 0}
	<img
		class="pk-badge"
		src={`/spritesheets/util/sm1.webp`}
		style="--original-size: 40; {setCssPosition(
			getMarkPosition(pokemonState.marks[0] as MarksType)
		)}"
		alt={pokemonState.marks[0]}
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
</style>
