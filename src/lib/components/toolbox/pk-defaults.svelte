<script lang="ts">
	import PkGameSelector from '$lib/components/ui/pk-game-selector.svelte'
	import PkToggle from '$lib/components/ui/pk-toggle.svelte'
	import PkTextarea from '$lib/components/ui/pk-textarea.svelte'
	import PkBallSelector from '$lib/components/ui/pk-ball-selector.svelte'
	import { appState } from '$lib/state/app-state.svelte'
	import type { GameType } from '$lib/models/data-models'

	let dialogElement: HTMLDialogElement
	let disabled = $derived(!appState.hasModifiedDefaults())

	export function showDefaultsDialog() {
		dialogElement.showModal()
	}

	function closeDialog() {
		dialogElement.close()
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

<dialog class="pk-ui-section" bind:this={dialogElement}>
	<section class="pk-ui-section-inner">
		<section class="pk-dialog-header">
			<h2>Editing defaults</h2>
			<button class="pk-button" onclick={closeDialog}><img src="ui/x-icon.webp" alt="" /></button>
		</section>

		<div class="separator"></div>

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
						<PkBallSelector
							onUpdate={updatePokeball}
							selectedBall={appState.getAppDefaults().ball}
						/>

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

		<div class="separator"></div>

		<section class="pk-dialog-footer">
			<button class="pk-button" onclick={closeDialog}>Close</button>
		</section>
	</section>
</dialog>

<style>
	dialog {
		--dialog-spacing: 1rem;
		--dialog-min-width: 680px;

		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -65%);
		overflow: visible;
		min-width: var(--dialog-min-width);
		color: var(--ui-text-color);
		background-color: transparent;
		.pk-ui-section-inner {
			padding: var(--dialog-spacing);
		}
	}

	.pk-dialog-header {
		display: flex;
		align-items: center;
		justify-content: space-between;

		.pk-button {
			max-width: 44px;
		}
	}

	.pk-dialog-content {
		display: flex;
		flex-direction: column;
		gap: var(--dialog-spacing);
		margin-block: calc(var(--dialog-spacing) * 2);

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

	.pk-dialog-footer {
		display: flex;
		justify-content: flex-end;
	}

	dialog::backdrop {
		background-color: rgba(0, 0, 0, 0.5);
	}
</style>
