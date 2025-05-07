<script lang="ts">
	import PkGameSelector from '$lib/components/ui/pk-game-selector.svelte'
	import PkToggle from '$lib/components/ui/pk-toggle.svelte'
	import PkTextarea from '$lib/components/ui/pk-textarea.svelte'
	import PkBallSelector from '$lib/components/ui/pk-ball-selector.svelte'
	import { appState } from '$lib/state/app-state.svelte'
	import type { GameType } from '$lib/models/data-models'
	import PkDialog, { type PkDialogElement } from '../ui/pk-dialog.svelte'

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
	okBtnText="Ok"
/>

{#snippet defaultsDialogContent()}
	<section class="pk-dialog-content">
		<section class="pk-dialog-description">
			<p>
				Configure default values that will be automatically applied to a Pokémon when it is first
				marked as captured
			</p>
		</section>

		<button class="pk-button" onclick={resetDefaults} {disabled}>Restore defaults</button>

		<section class="pk-defaults">
			<div class="pk-input-group">
				<!-- Game -->
				<PkGameSelector
					label="Caught in"
					onUpdate={updateCaughtIn}
					value={appState.getAppDefaults().caughtIn}
				/>
				<div class="pk-btn-group">
					<!-- Ball -->
					<PkBallSelector onUpdate={updatePokeball} selectedBall={appState.getAppDefaults().ball} />

					<!-- Shiny -->
					<PkToggle
						icon="/ui/sparkle.svg"
						activeColor="hsla(125, 100%, 30%, 0.55)"
						label="Shiny"
						hideLabel={false}
						onUpdate={toggleShiny}
						checked={appState.getAppDefaults().shiny}
					/>
				</div>
			</div>

			<!-- Comment -->
			<PkTextarea
				label="Comment"
				onUpdate={updateComment}
				value={appState.getAppDefaults().comment}
				debounceTime={250}
			/>
		</section>
	</section>
{/snippet}

<style>
	.pk-dialog-content {
		display: flex;
		flex-direction: column;
		gap: var(--dialog-spacing);

		.pk-dialog-description {
			margin-bottom: 1rem;

			p {
				line-height: 1.6;
				max-width: 55ch;
				letter-spacing: 0.02em;
			}
		}

		.pk-button {
			align-self: flex-start; /* Prevent restore button from taking up full row */
		}

		.pk-defaults {
			display: flex;
			gap: 3rem;
		}

		.pk-input-group {
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			gap: 1rem;

			.pk-btn-group {
				display: flex;
				justify-content: space-between;
				align-items: center;
				gap: 1rem;
			}
		}
	}
</style>
