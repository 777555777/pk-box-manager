<script lang="ts">
	import { appState } from '$lib/state/app-state.svelte'
	import type { GameType } from '$lib/models/data-models'
	import PkGameSelector from '$lib/components/ui/pk-game-selector.svelte'
	import PkToggle from '$lib/components/ui/pk-toggle.svelte'
	import PkTextarea from '$lib/components/ui/pk-textarea.svelte'
	import PkBallSelector from '$lib/components/ui/pk-ball-selector.svelte'

	let dialogElement: HTMLDialogElement

	export function showDefaultsDialog() {
		dialogElement.showModal()
	}

	function closeDialog() {
		dialogElement.close()
	}

	// === Shiny Toggle ===
	function handleToggleChange(newValue: boolean) {
		appState.setAppDefaults({ shiny: newValue })
	}

	// === Game Dropdown ===
	function handleGameChange(newValue: GameType) {
		appState.setAppDefaults({ caughtIn: newValue })
	}

	// === Comment Textarea ===
	function handleCommentChange(newValue: string) {
		appState.setAppDefaults({ comment: newValue })
	}

	// === Ball Selector ===
	function handleBallChange(newValue: string) {
		appState.setAppDefaults({ ball: newValue })
	}

	// === Reset Button ===
	function resetDefaults() {
		appState.resetAppDefaults()
	}
</script>

<dialog bind:this={dialogElement}>
	<section class="pk-defaults">
		<!-- Ball -->
		<PkBallSelector
			selectedBall={appState.getAppDefaults().ball}
			onChange={handleBallChange}
			label="Default Ball"
		/>

		<!-- Shiny -->
		<PkToggle
			icon="✨"
			label="Shiny"
			checked={appState.getAppDefaults().shiny}
			onChange={handleToggleChange}
		/>

		<!-- Game -->
		<PkGameSelector onChange={handleGameChange} value={appState.getAppDefaults().caughtIn} />

		<!-- Comment -->
		<PkTextarea
			value={appState.getAppDefaults().comment}
			label="Default Game"
			onInput={handleCommentChange}
			debounceTime={1250}
		/>
	</section>
	<div class="pk-default-options">
		<button onclick={resetDefaults}>Reset</button>
		<button onclick={closeDialog}>Close</button>
	</div>
</dialog>

<style>
	dialog {
		background-color: hsl(240, 100%, 90%);
		border: 2px solid hsl(250, 100%, 74%);
		border-radius: 10px;
		padding: 10px;

		margin: auto;
		min-width: 600px;
	}

	dialog::backdrop {
		background-color: rgba(0, 0, 0, 0.5);
	}

	.pk-defaults {
		margin-top: 20px;
		display: flex;
		flex-direction: column;
		align-items: start;
		gap: 10px;
	}

	button {
		padding: 0.35rem 0.25rem;
	}

	.pk-default-options {
		display: flex;
		justify-content: space-between;
	}
</style>
