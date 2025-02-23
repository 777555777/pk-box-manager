<script lang="ts">
	import testImage from '$lib/0227-skarmory.png'
</script>

<section class="pk-viewer">
	<img src={testImage} alt="" />
	<div class="pk-viewer-controls">
		<button>✨</button>
		<button>🖥️</button>
	</div>
</section>

<style>
	.pk-viewer {
		width: 100%;
		height: 256px;

		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: row-reverse;

		/* concept placeholder */
		background-color: hsl(160, 100%, 90%);
		border: 2px solid hsl(170, 100%, 75%);
		border-radius: 10px;
		padding: 10px;
	}

	.pk-viewer img {
		box-sizing: content-box;
		image-rendering: crisp-edges;
		width: 256px; /* Direkte Skalierung statt transform */
		height: 256px;
	}

	.pk-viewer-controls {
		background-color: red;
		position: absolute;
		top: 16px;
		right: 16px;
	}

	.pk-viewer-controls button {
		width: 32px;
		height: 32px;
	}
</style>
