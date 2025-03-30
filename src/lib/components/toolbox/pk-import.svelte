<script lang="ts">
	import { appState } from '$lib/state/app-state.svelte'
	import { validateImportedDexState } from '$lib/components/toolbox/pk-import-validation'
	import { storageHandler, type DexStorage } from '$lib/state/storage-handler'
	import PkDialog from '$lib/components/ui/pk-dialog.svelte'
	import { pkState } from '$lib/state/pk-state.svelte'

	interface PkDialogElement {
		showDialog: Function
	}

	let fileInput: HTMLInputElement
	let pendingImport: DexStorage | null = null

	let infoDialog: PkDialogElement
	let errorDialog: PkDialogElement

	const infoDialogConfig = {
		headline: 'Überschreiben der Daten',
		textContent:
			'Für diesen Pokedex gibt es bereits lokale Daten, sollen diese überschrieben werden?',
		cancle: true
	}

	const errorDialogConfig = {
		headline: 'Fehler beim Parsen der JSON-Datei',
		textContent: 'mehr test und so weiter',
		cancle: false
	}

	function readImportFile(event: Event) {
		const input = event.target as HTMLInputElement
		if (!input.files || input.files.length === 0) return
		const file = input.files[0]
		const reader = new FileReader()
		reader.onload = () => {
			try {
				const validDex = validateImportedDexState(reader.result)

				if (storageHandler.loadPokemonData(validDex.name)) {
					// Local data found, override it?
					pendingImport = validDex
					infoDialog.showDialog()
				} else {
					// No local data found, write to localStorage!
					storageHandler.savePokemonData(validDex.name, validDex)
					appState.setSelectedDexName(validDex.name)

					// Force a refresh if this is the current Dex
					if (validDex.name === appState.getSelectedDexName()) {
						pkState.loadDexState(validDex.name)
					}
				}
			} catch (error) {
				console.error(error)
				errorDialogConfig.textContent = handleErrorMessage(error)
				errorDialog.showDialog()
			}
		}
		reader.readAsText(file)
	}

	function onConfirmInfo() {
		if (pendingImport) {
			storageHandler.savePokemonData(pendingImport.name, pendingImport)
			appState.setSelectedDexName(pendingImport.name)

			// Force a refresh if this is the current Dex
			if (pendingImport.name === appState.getSelectedDexName()) {
				pkState.loadDexState(pendingImport.name)
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
<label for="input-file" class="button-style">Import</label>

<PkDialog
	bind:this={infoDialog}
	dialogConfig={infoDialogConfig}
	onConfirm={onConfirmInfo}
	onCancle={() => {}}
/>

<PkDialog
	bind:this={errorDialog}
	dialogConfig={errorDialogConfig}
	onConfirm={() => {}}
	onCancle={() => {}}
/>

<style>
	.button-style {
		display: inline-block;
		padding: 8px 16px;
		background-color: #e9e9ed;
		color: rgb(0, 0, 0);
		border-radius: 4px;
		cursor: pointer;
		border: 1px solid #8f8f9d;
		text-align: center;
	}

	.button-style:hover {
		background-color: #d0d0d7;
	}

	.button-style:active {
		background-color: #b1b1b9;
	}
</style>
