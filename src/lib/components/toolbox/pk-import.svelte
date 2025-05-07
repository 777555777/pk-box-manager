<script lang="ts">
	import { appState } from '$lib/state/app-state.svelte'
	import { validateImportedDexState } from '$lib/components/toolbox/pk-import-validation'
	import { storageHandler, type DexStorage } from '$lib/state/storage-handler'
	import PkDialog, { type PkDialogElement } from '$lib/components/ui/pk-dialog.svelte'
	import { pkState } from '$lib/state/pk-state.svelte'

	let fileInput: HTMLInputElement
	let pendingImport: DexStorage | null = null

	let infoDialog: PkDialogElement
	let errorDialog: PkDialogElement

	let errorDialogText = ''

	function readImportFile(event: Event) {
		const input = event.target as HTMLInputElement
		if (!input.files || input.files.length === 0) return
		const file = input.files[0]
		const reader = new FileReader()
		reader.onload = async () => {
			try {
				const validDex = await validateImportedDexState(reader.result)

				if (
					storageHandler.loadPokedex(validDex.name) &&
					storageHandler.hasModifiedPokedex(validDex.name)
				) {
					// Local data found, override it?
					pendingImport = validDex
					infoDialog.showDialog()
				} else {
					// No local data found, write to localStorage!
					storageHandler.savePokedex(validDex.name, validDex)
					appState.setCurrentPokedexName(validDex.name)

					// Force a refresh if this is the current Dex
					if (validDex.name === appState.getCurrentPokedexName()) {
						pkState.switchPokedex(validDex.name)
					}
				}
			} catch (error) {
				console.error(error)
				errorDialogText = handleErrorMessage(error)
				errorDialog.showDialog()
			}
		}
		reader.readAsText(file)
	}

	function onConfirmInfo() {
		if (pendingImport) {
			storageHandler.savePokedex(pendingImport.name, pendingImport)
			appState.setCurrentPokedexName(pendingImport.name)

			// Force a refresh if this is the current Dex
			if (pendingImport.name === appState.getCurrentPokedexName()) {
				pkState.switchPokedex(pendingImport.name)
			}

			pendingImport = null
		}
	}

	function handleErrorMessage(error: unknown) {
		let errorMessage: string
		if (error instanceof Error) {
			errorMessage = error.message
		} else if (typeof error === 'string') {
			errorMessage = error
		} else {
			errorMessage = 'Ein unbekannter Fehler ist aufgetreten.'
		}
		return errorMessage
	}
</script>

<input
	bind:this={fileInput}
	id="input-file"
	class="input-file-btn"
	type="file"
	name="input-file"
	accept=".json"
	style="display: none;"
	onchange={readImportFile}
/>
<button class="pk-button" onclick={() => fileInput.click()}>Import</button>

{#snippet infoDialogContent()}
	<div class="pk-dialog-description">
		<p>Local data already exists for this Pokedex. Do you want to overwrite it?</p>
	</div>
{/snippet}

<PkDialog
	bind:this={infoDialog}
	headline="Overwrite local Data"
	dialogContent={infoDialogContent}
	onConfirm={onConfirmInfo}
	onCancel={() => {}}
	okBtnText="Override"
	cancelBtnText="Cancel"
/>

{#snippet errorDialogContent()}
	<div class="pk-dialog-description">
		<p>{errorDialogText}</p>
	</div>
{/snippet}

<PkDialog
	bind:this={errorDialog}
	headline="Error Parsing JSON File"
	dialogContent={errorDialogContent}
	onConfirm={() => {}}
	onCancel={() => {}}
	okBtnText="Ok"
/>

<style>
	.pk-dialog-description p {
		line-height: 1.6;
		max-width: 55ch;
		letter-spacing: 0.02em;
	}
</style>
