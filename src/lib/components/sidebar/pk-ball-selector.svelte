<script lang="ts">
	import { Balls, type BallsType } from '$lib/models/balls-models'

	type Coordinates = { x: number; y: number }

	let { selectedBall = $bindable() }: { selectedBall: BallsType } = $props()
	let showTray = $state(false)
	let trayRef = $state<HTMLElement | null>(null)

	function setPosition(data: Coordinates) {
		return `object-position: ${data.x}px ${data.y}px;`
	}

	function getBallPosition(selectedBall: BallsType) {
		return Balls[selectedBall].position || { x: 0, y: 0 }
	}

	function selectBall(ball: BallsType) {
		selectedBall = ball
		showTray = false
	}

	function toggleSelectorTray(event: MouseEvent) {
		event.stopPropagation() // Verhindert, dass der Click Outside Handler ausgelöst wird
		showTray = !showTray
	}

	function handleClickOutside(event: MouseEvent) {
		if (trayRef && !trayRef.contains(event.target as Node)) {
			showTray = false
		}
	}

	$effect(() => {
		if (showTray) {
			// Fügt den Event Listener hinzu wenn das Tray sichtbar ist
			document.addEventListener('click', handleClickOutside)
		}

		return () => {
			// Cleanup: Entfernt den Event Listener
			document.removeEventListener('click', handleClickOutside)
		}
	})
</script>

<button class="pk-ball-container" onclick={toggleSelectorTray}>
	<img
		src="/spritesheets/spritesheet-balls-1.webp"
		style={setPosition(getBallPosition(selectedBall))}
		alt={selectedBall}
	/>
</button>
{#if showTray}
	{@render selectorTray()}
{/if}

{#snippet selectorTray()}
	<section class="selector-tray" bind:this={trayRef}>
		{#each Object.entries(Balls) as [name, data]}
			<button onclick={() => selectBall(name as BallsType)}>
				<img
					src="/spritesheets/spritesheet-balls-1.webp"
					style={setPosition(data.position)}
					alt={name}
				/>
			</button>
		{/each}
	</section>
{/snippet}

<style>
	:root {
		--ball-btn-size-sprite: 30px;
	}
	img {
		image-rendering: pixelated;
		object-fit: none;
		width: var(--ball-btn-size-sprite);
		height: var(--ball-btn-size-sprite);
		transform: scale(1.6);
	}

	button {
		width: 48px;
		height: 48px;
		padding: 0;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.selector-tray {
		display: grid;
		grid-template-columns: repeat(auto-fit, 48px);
		justify-content: center;

		background-color: rgb(235, 235, 235);
		padding: 8px 0;
		max-width: 240px;
	}
</style>
