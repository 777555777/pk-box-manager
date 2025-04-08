<script lang="ts">
	let { label, value, maxStatValue = 255, index } = $props()
</script>

<label for="stat-{index}" class="stat-label">{label}</label>
<meter
	id="stat-{index}"
	{value}
	min="0"
	max={maxStatValue}
	low={maxStatValue * 0.2}
	high={maxStatValue * 0.4}
	optimum={maxStatValue}
	class="stat-meter pixel-corners"
></meter>
<span class="stat-value">{value}</span>

<style>
	.stat-label {
		width: 60px;
		text-align: left;
		margin-right: 8px;
		font-weight: bold;
	}

	.stat-meter {
		flex-grow: 1;
		height: 20px;
	}

	.stat-value {
		width: 40px;
		text-align: right;
	}

	/* Anpassung des meter-Elements */
	meter {
		overflow: hidden;
	}

	.pixel-corners {
		--pixel-size: 2px;
		clip-path: polygon(
			0px calc(100% - var(--pixel-size)),
			var(--pixel-size) calc(100% - var(--pixel-size)),
			var(--pixel-size) 100%,
			calc(100% - var(--pixel-size)) 100%,
			calc(100% - var(--pixel-size)) calc(100% - var(--pixel-size)),
			100% calc(100% - var(--pixel-size)),
			100% var(--pixel-size),
			calc(100% - var(--pixel-size)) var(--pixel-size),
			calc(100% - var(--pixel-size)) 0px,
			var(--pixel-size) 0px,
			var(--pixel-size) var(--pixel-size),
			0px var(--pixel-size)
		);
	}
</style>
