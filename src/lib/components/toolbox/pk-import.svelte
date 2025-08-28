<script lang="ts">
	import { type DexSave, type DexState } from '$lib/models/data-models'
	import PkDialog, { type PkDialogElement } from '$lib/components/ui/pk-dialog.svelte'
	import PkIcon from '$lib/components/ui/pk-icon.svelte'
	import { validateImportedDexSave } from '$lib/validation/dex-validation.ts'
	import { pkState } from '$lib/state/pk-state.svelte'
	import { storageHandler } from '$lib/state/storage-handler'

	let fileInput: HTMLInputElement
	let pendingDexSaveimport: DexSave | null = null

	let infoDialog: PkDialogElement
	let errorDialog: PkDialogElement

	let errorDialogText = ''

	function readImportFile(event: Event) {
		const input = event.target as HTMLInputElement
		if (!input.files || input.files.length === 0) return
		const file = input.files[0]
		const reader = new FileReader()
		reader.onload = () => {
			try {
				pendingDexSaveimport = validateImportedDexSave(reader.result) as DexSave

				// check if the dex already exists and warn about overwriting it
				if (storageHandler.loadPokedex(pendingDexSaveimport.id)) {
					infoDialog.showDialog()
				} else {
					// does not exist yet so it can be saved and loaded
					storageHandler.savePokedex(pendingDexSaveimport)
					pkState.switchPokedex(pendingDexSaveimport)
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
		if (pendingDexSaveimport) {
			storageHandler.savePokedex(pendingDexSaveimport)
			pkState.switchPokedex(pendingDexSaveimport)
		}
	}

	function handleErrorMessage(error: unknown) {
		console.log(error)

		let errorMessage: string
		if (error instanceof Error) {
			errorMessage = error.message
		} else if (typeof error === 'string') {
			errorMessage = error
		} else {
			errorMessage = 'An unknown error occurred.'
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
<button
	class="pk-button pk-tooltip"
	onclick={() => fileInput.click()}
	data-tooltip="Import a Pokedex from a JSON file"
>
	<PkIcon color="#fff" name={'file-import'} size={24} />
	<span>Import Dex</span>
</button>

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
	size="S"
/>

{#snippet errorDialogContent()}
	<div class="pk-dialog-description">
		<pre><code>{errorDialogText}</code></pre>
		<!-- {errorDialogText} -->
	</div>
{/snippet}

<PkDialog
	bind:this={errorDialog}
	headline="Error Parsing JSON File"
	dialogContent={errorDialogContent}
	onConfirm={() => {}}
	onCancel={() => {}}
	okBtnText="Ok"
	size="S"
/>

<style>
	.pk-dialog-description {
		pre {
			background-color: black;
			padding: 2rem 1rem;
			overflow-x: auto;
			border-radius: 5px;
			code {
				color: lime;
			}
		}
	}
	.pk-dialog-description p {
		line-height: 1.6;
		max-width: 55ch;
		letter-spacing: 0.02em;
	}
</style>
