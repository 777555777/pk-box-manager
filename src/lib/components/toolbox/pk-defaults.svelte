<script lang="ts">
	import PkToggle from '$lib/components/ui/pk-toggle.svelte'
	import PkTextarea from '$lib/components/ui/pk-textarea.svelte'
	import PkBallSelector from '$lib/components/ui/pk-ball-selector.svelte'
	import { appState } from '$lib/state/app-state.svelte'
	import type { GameType } from '$lib/models/data-models'
	import { Game, Generations } from '$lib/models/data-models'
	import PkDialog, { type PkDialogElement } from '../ui/pk-dialog.svelte'
	import { type BallsType } from '$lib/models/balls-models'
	import PkIcon from '$lib/components/ui/pk-icon.svelte'
	import PkDropdown from '../ui/pk-dropdown.svelte'

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
	function updateCaughtIn(selectedOption: any) {
		if (selectedOption) {
			const [key, value] = selectedOption
			console.log('12312313!!: ', selectedOption)
			console.log('12312313!!: ', key)
			console.log('12312313!!: ', value)

			console.log([key, Game[key as GameType]])

			appState.updateAppDefaults({ caughtIn: key })
		} else {
			// Deselect case - set to default or null
			appState.updateAppDefaults({ caughtIn: undefined })
		}
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
			Set default values for new Pokémon that will be applied when a Pokémon is marked as captured
			for the first time.
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
					icon="sparkles-solid"
					iconColor="#fff"
					activeColor="hsla(125, 100%, 30%, 0.55)"
					hideLabel={true}
					onUpdate={toggleShiny}
					checked={appState.getAppDefaults().shiny}
				/>

				<button class="pk-button" onclick={resetDefaults} {disabled}>
					<PkIcon color="#fff" name={'reset'} size={24} /><span>Reset defaults</span>
				</button>
			</div>

			<!-- Game -->
			<PkDropdown
				onUpdate={updateCaughtIn}
				options={Object.entries(Game)}
				groups={Generations.slice()}
				selectedOption={(() => {
					const caughtIn = appState.getAppDefaults().caughtIn as GameType
					return caughtIn && Game[caughtIn] ? [caughtIn, Game[caughtIn]] : null
				})()}
				--dropdown-max-height={280}
				labelText="Caught in"
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
			padding-inline: 0.25rem;
		}
	}
</style>
