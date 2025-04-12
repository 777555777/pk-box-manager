<script lang="ts">
	let { label, value, maxStatValue = 255, index } = $props()
</script>

<label for="stat-{index}" class="stat-label">{label}</label>

<span class="stat-value">{value}</span>

<div class="meter-border pixel-corners">
	<meter
		id="stat-{index}"
		{value}
		min="0"
		max={maxStatValue}
		low={maxStatValue * 0.2}
		high={maxStatValue * 0.4}
		optimum={maxStatValue}
		class="pixel-meter"
	></meter>
</div>

<style>
	.stat-label {
		width: 4rem;
		text-align: left;
	}

	.stat-value {
		text-align: right;
		width: 2em;
	}

	/* Anpassung des meter-Elements */

	.pixel-meter {
		box-sizing: border-box;
		display: block;

		background: transparent;
		width: 12rem;
		height: 0.75rem;
	}

	/* Make colored part as high as in Firefox */
	/* !Deprecated https://developer.mozilla.org/en-US/docs/Web/CSS/::-webkit-meter-bar */
	.pixel-meter::-webkit-meter-bar {
		background: transparent;
		height: 0.75rem;
	}

	.meter-border {
		--meter-border-pixel-size: 3px;
		width: fit-content;
		height: fit-content;
		border: var(--meter-border-pixel-size) solid rgb(35, 35, 35);
	}

	.pixel-corners {
		clip-path: polygon(
			0px calc(100% - var(--meter-border-pixel-size)),
			var(--meter-border-pixel-size) calc(100% - var(--meter-border-pixel-size)),
			var(--meter-border-pixel-size) 100%,
			calc(100% - var(--meter-border-pixel-size)) 100%,
			calc(100% - var(--meter-border-pixel-size)) calc(100% - var(--meter-border-pixel-size)),
			100% calc(100% - var(--meter-border-pixel-size)),
			100% var(--meter-border-pixel-size),
			calc(100% - var(--meter-border-pixel-size)) var(--meter-border-pixel-size),
			calc(100% - var(--meter-border-pixel-size)) 0px,
			var(--meter-border-pixel-size) 0px,
			var(--meter-border-pixel-size) var(--meter-border-pixel-size),
			0px var(--meter-border-pixel-size)
		);
	}
</style>
