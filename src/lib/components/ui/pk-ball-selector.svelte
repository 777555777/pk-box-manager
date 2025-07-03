<script lang="ts">
	import { Balls, type BallsType } from '$lib/models/balls-models'
	import { setCssPosition } from '$lib/spriteheet-helper'
	import { appState } from '$lib/state/app-state.svelte'

	let {
		label = '',
		onUpdate = () => {},
		selectedBall,
		disabled = false,
		id = crypto.randomUUID()
	} = $props()

	let trayRef = $state<HTMLElement | null>(null)

	// Computed property für showTray basierend auf AppState
	let showTray = $derived(appState.isDropdownOpen(id))

	function selectBall(ball: BallsType) {
		onUpdate(ball)
		appState.closeDropdown() // Dropdown schließen nach Auswahl
	}

	function getBallPosition(selectedBall: BallsType) {
		return Balls[selectedBall].pos || { x: 0, y: 0 }
	}

	function toggleSelectorTray(event: MouseEvent) {
		event.stopPropagation() // Verhindert, dass der Click Outside Handler ausgelöst wird

		if (showTray) {
			// Wenn dieses Dropdown bereits offen ist, schließe es
			appState.closeDropdown()
		} else {
			// Öffne dieses Dropdown (schließt automatisch andere)
			appState.openDropdown(id)
		}
	}

	function handleClickOutside(event: MouseEvent) {
		if (trayRef && !trayRef.contains(event.target as Node)) {
			appState.closeDropdown()
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

<div class="pk-ball-selector">
	{#if label}
		<label for={id}>{label}</label>
	{/if}
	<button {id} class="pk-button" onclick={toggleSelectorTray} {disabled}>
		<img
			src="/spritesheets/util/sb1.webp"
			style={setCssPosition(getBallPosition(selectedBall as BallsType))}
			alt={selectedBall}
		/>
	</button>
	{#if showTray}
		{@render selectorTray()}
	{/if}
</div>

{#snippet selectorTray()}
	<section class="pk-selector-tray" bind:this={trayRef}>
		{#each Object.entries(Balls) as [name, data]}
			<button onclick={() => selectBall(name as BallsType)}>
				<img src="/spritesheets/util/sb1.webp" style={setCssPosition(data.pos)} alt={name} />
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
		/* transform: scale(1.4666666666666667); */
	}

	button {
		width: 44px;
		height: 44px;
		padding: 0;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.pk-selector-tray {
		--ball-amount: 5;
		--ball-size: 44px;

		background-color: #717186;
		width: fit-content;
		padding: 6px;

		/* Positioning */
		display: grid;
		grid-template-columns: repeat(var(--ball-amount), var(--ball-size));
		place-items: center;

		/* Position below trigger Button */
		position: absolute;
		top: 100%;
		z-index: 1;

		/* ======================== */
		background-color: transparent;
		image-rendering: pixelated;
		cursor: text;

		border-width: 9px solid;
		border-image: url('/ui/textarea-select-default.webp') 9 fill stretch;
		border-image-outset: 0;
		border-image-width: 9px;

		button {
			background-color: transparent;
			border: 1px solid #5a5a5a81;
			cursor: pointer;
			border-radius: 0.3rem;

			&:hover {
				filter: brightness(1.15);
				background-color: hsla(0, 0%, 100%, 0.175);
			}

			&:active {
				filter: brightness(0.9);
				background-color: hsla(0, 0%, 100%, 0.1);
			}

			&:focus-visible {
				outline: 3px solid hsl(220, 100%, 65%);
			}
		}
	}

	.pk-ball-selector {
		position: relative;
	}
</style>
