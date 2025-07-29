<script lang="ts">
	import PkGameSelector from '$lib/components/ui/pk-game-selector.svelte'
	import PkToggle from '$lib/components/ui/pk-toggle.svelte'
	import PkTextarea from '$lib/components/ui/pk-textarea.svelte'
	import PkBallSelector from '$lib/components/ui/pk-ball-selector.svelte'
	import { appState } from '$lib/state/app-state.svelte'
	import type { GameType } from '$lib/models/data-models'
	import PkDialog, { type PkDialogElement } from '../ui/pk-dialog.svelte'
	import { type BallsType } from '$lib/models/balls-models'

	let defaultsDialog: PkDialogElement

	let disabled = $derived(!appState.hasModifiedDefaults())

	export function showDefaultsDialog() {
		defaultsDialog.showDialog()
	}

	// === Shiny Toggle ===
	function toggleShiny(newValue: boolean) {
		appState.updateAppDefaults({ shiny: newValue })
	}

	// === Game Dropdown ===
	function updateCaughtIn(newValue: GameType) {
		appState.updateAppDefaults({ caughtIn: newValue })
	}

	// === Comment Textarea ===
	function updateComment(newValue: string) {
		appState.updateAppDefaults({ comment: newValue })
	}

	// === Ball Selector ===
	function updatePokeball(newValue: string) {
		appState.updateAppDefaults({ ball: newValue })
	}

	// === Reset Button ===
	function resetDefaults() {
		appState.resetAppDefaults()
	}
</script>

<PkDialog
	bind:this={defaultsDialog}
	headline="Editing defaults"
	dialogContent={defaultsDialogContent}
	onConfirm={() => {}}
	onCancel={() => {}}
	okBtnText="Close"
	size="M"
/>
{#snippet defaultsDialogContent()}
	<section class="pk-dialog-section">
		<p class="pk-paragraph">
			This menu allows you to set default values for new Pokémon. These defaults will be applied
			when you mark a Pokémon as captured for the first time.
		</p>

		<fieldset class="pk-fieldset pk-defaults">
			<legend>Default Settings</legend>
			<div class="pk-btn-group">
				<!-- Ball -->
				<PkBallSelector
					onUpdate={updatePokeball}
					selectedBall={appState.getAppDefaults().ball as BallsType}
				/>

				<!-- Shiny -->
				<PkToggle
					icon="/ui/sparkles-solid.svg"
					activeColor="hsla(125, 100%, 30%, 0.55)"
					hideLabel={true}
					onUpdate={toggleShiny}
					checked={appState.getAppDefaults().shiny}
				/>

				<button class="pk-button" onclick={resetDefaults} {disabled}>
					<img src="/ui/reset.svg" alt="" /><span>Reset defaults</span>
				</button>
			</div>

			<!-- Game -->
			<PkGameSelector
				label="Caught in"
				onUpdate={updateCaughtIn}
				value={appState.getAppDefaults().caughtIn}
			/>

			<!-- Comment -->
			<PkTextarea
				label="Comment"
				onUpdate={updateComment}
				value={appState.getAppDefaults().comment}
				debounceTime={250}
			/>
		</fieldset>
	</section>
{/snippet}

<style>
	.pk-dialog-section {
		display: flex;
		flex-direction: column;
		gap: var(--dialog-spacing);

		p {
			margin-bottom: 1rem;
		}

		.pk-defaults {
			display: flex;
			flex-direction: column;
			gap: var(--dialog-spacing);

			.pk-btn-group {
				display: flex;
				gap: var(--dialog-spacing);
			}

			/* Reset Button an das Ende */
			.pk-button:last-child {
				margin-left: auto; /* Schiebt den Button nach rechts */
			}
		}
	}

	@media (max-width: 600px) {
		.pk-button {
			max-width: 44px;

			span {
				display: none;
			}
		}
	}

	@media (max-width: 460px) {
		.pk-dialog-section {
			height: 98vh;
			padding-inline: 1rem;
		}
	}
</style>
