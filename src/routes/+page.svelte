<script lang="ts">
	import spritesheet_1 from '$lib/spritesheet_1.png'
	import spritesheet_2 from '$lib/spritesheet_2.png'

	import { pkBalls, type BallType } from './dynamic-models'

	type Coordinates = { x: number; y: number }

	function getPosition(selectedBall: BallType) {
		return pkBalls[selectedBall].position || { x: 0, y: 0 }
	}

	function setPosition(data: Coordinates) {
		return `object-position: ${data.x}px ${data.y}px;`
	}
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>

<img src={spritesheet_2} alt="" style={setPosition(getPosition('0893-zarude-dada'))} />

<style>
	:root {
		--ball-btn-size-sprite: 96px;
	}
	img {
		image-rendering: crisp-edges;
		object-fit: none;
		width: var(--ball-btn-size-sprite);
		height: var(--ball-btn-size-sprite);
		transform: scale(2.5);
	}
</style>
