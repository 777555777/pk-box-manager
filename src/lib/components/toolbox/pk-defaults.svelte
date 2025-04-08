<script lang="ts">
	import PkGameSelector from '$lib/components/ui/pk-game-selector.svelte'
	import PkToggle from '$lib/components/ui/pk-toggle.svelte'
	import PkTextarea from '$lib/components/ui/pk-textarea.svelte'
	import PkBallSelector from '$lib/components/ui/pk-ball-selector.svelte'
	import { appState } from '$lib/state/app-state.svelte'
	import type { GameType } from '$lib/models/data-models'

	let dialogElement: HTMLDialogElement

	export function showDefaultsDialog() {
		dialogElement.showModal()
	}

	function closeDialog() {
		dialogElement.close()
	}

	// === Shiny Toggle ===
	function handleToggleChange(newValue: boolean) {
		appState.updateAppDefaults({ shiny: newValue })
	}

	// === Game Dropdown ===
	function handleGameChange(newValue: GameType) {
		appState.updateAppDefaults({ caughtIn: newValue })
	}

	// === Comment Textarea ===
	function handleCommentChange(newValue: string) {
		appState.updateAppDefaults({ comment: newValue })
	}

	// === Ball Selector ===
	function handleBallChange(newValue: string) {
		appState.updateAppDefaults({ ball: newValue })
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
			label="Ball"
			onUpdate={handleBallChange}
			selectedBall={appState.getAppDefaults().ball}
		/>

		<!-- Shiny -->
		<PkToggle
			icon="✨"
			label="Shiny"
			onUpdate={handleToggleChange}
			checked={appState.getAppDefaults().shiny}
		/>

		<!-- Game -->
		<PkGameSelector
			label="Caught in"
			onUpdate={handleGameChange}
			value={appState.getAppDefaults().caughtIn}
		/>

		<!-- Comment -->
		<PkTextarea
			label="Comment"
			onUpdate={handleCommentChange}
			value={appState.getAppDefaults().comment}
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
