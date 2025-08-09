<script lang="ts">
	import { appState } from '$lib/state/app-state.svelte'
	import { Balls, type BallsType } from '$lib/models/balls-models'
	import { Marks, type MarksType } from '$lib/models/marks-models'
	import { Ribbons, type RibbonsType } from '$lib/models/ribbons-models'
	import { setCssPosition } from '$lib/spriteheet-helper'
	import PkIcon from '$lib/components/ui/pk-icon.svelte'

	let badgeDisplay = $derived(appState.getAppSettings().badgeDisplay)

	function cycleBadgeDisplay(event: MouseEvent) {
		event.preventDefault()
		event.stopPropagation()
		appState.cycleBadgeDisplayMode()
	}

	function getBallPosition(ballKey: BallsType = '01-poke-ball') {
		return Balls[ballKey].pos || { x: 0, y: 0 }
	}

	function getRibbonPosition(ribbonKey: RibbonsType = '042-cool-ribbon-master-sinnoh') {
		return Ribbons[ribbonKey].pos || { x: 0, y: 0 }
	}

	function getMarkPosition(markKey: MarksType = 'lunchtime-mark') {
		return Marks[markKey].pos || { x: 0, y: 0 }
	}
</script>

<button
	class="pk-button pk-tooltip pk-badge-cycle-button"
	onclick={(event) => cycleBadgeDisplay(event)}
	data-tooltip="Cycle through Box Badges (B)"
>
	<div class="pk-badge-options">
		<!-- Off state -->
		{#if badgeDisplay === false}
			<div class="badge-icon-container">
				<PkIcon color="#fff" name={'refresh'} size={24} />
			</div>
		{/if}

		<!-- Ball badge -->
		{#if badgeDisplay === 'ball'}
			<div class="badge-icon-container">
				<img
					class="pk-badge-icon"
					src="/spritesheets/util/sb1.webp"
					style="--original-size: 30; --target-size: 32; {setCssPosition(getBallPosition())}"
					alt="Ball Badge"
				/>
			</div>
		{/if}

		<!-- Comment badge -->
		{#if badgeDisplay === 'comment'}
			<div class="badge-icon-container">
				<img
					class="pk-badge-icon"
					src="/ui/text-bubble.webp"
					style="--original-size: 30;"
					alt="Comment Badge"
				/>
			</div>
		{/if}

		<!-- Ribbon badge -->
		{#if badgeDisplay === 'ribbon'}
			<div class="badge-icon-container">
				<img
					class="pk-badge-icon"
					src="/spritesheets/util/sr1.webp"
					style="--original-size: 40; {setCssPosition(getRibbonPosition())}"
					alt="Ribbon Badge"
				/>
			</div>
		{/if}

		<!-- Mark badge -->
		{#if badgeDisplay === 'mark'}
			<div class="badge-icon-container">
				<img
					class="pk-badge-icon"
					src="/spritesheets/util/sm1.webp"
					style="--original-size: 48; {setCssPosition(getMarkPosition())}"
					alt="Mark Badge"
				/>
			</div>
		{/if}
	</div>
	<span>Badge</span>
</button>

<style>
	.pk-badge-cycle-button {
		position: relative;
		display: flex;
		justify-content: space-between;

		span {
			margin-left: 0.5rem;
		}
	}

	.pk-badge-options {
		display: flex;
		gap: 2px;
		align-items: center;
		justify-content: center;
	}

	.badge-icon-container {
		width: 32px;
		height: 32px;

		display: grid;
		place-content: center;
		filter: grayscale(1);
	}

	.pk-badge-icon {
		--target-size: 28;
		--scale-factor: calc(var(--target-size) / var(--original-size));

		width: calc(var(--original-size) * 1px);
		height: calc(var(--original-size) * 1px);
		object-fit: none;
		transform: scale(var(--scale-factor));
		transform-origin: center;

		image-rendering: auto;
	}

	@media (max-width: 1350px) {
		.pk-button {
			max-width: 44px;

			display: flex;
			justify-content: center;
			align-items: center;

			span {
				display: none;
			}
		}
	}
</style>
