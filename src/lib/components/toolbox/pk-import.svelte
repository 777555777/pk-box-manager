<script lang="ts">
	import PkDialog, { type PkDialogElement } from '$lib/components/ui/pk-dialog.svelte'
	import PkIcon from '$lib/components/ui/pk-icon.svelte'
	import { parseDexImport, type ImportedDex } from '$lib/dex/transfer'
	import { dexStore } from '$lib/state/app'

	let fileInput: HTMLInputElement
	let pendingImport: ImportedDex | null = null

	let infoDialog: PkDialogElement
	let errorDialog: PkDialogElement

	let errorDialogText = $state('')

	async function readImportFile(event: Event) {
		const input = event.target as HTMLInputElement
		const file = input.files?.[0]
		// allow importing the same file again
		input.value = ''
		if (!file) return

		try {
			pendingImport = parseDexImport(await file.text())
			if (pendingImport.report) console.info('Converted v1 import:', pendingImport.report)

			if (dexStore.hasDex(pendingImport.dex.id)) {
				// ask before overwriting the existing dex
				infoDialog.showDialog()
			} else {
				await importPending()
			}
		} catch (error) {
			console.error(error)
			errorDialogText = error instanceof Error ? error.message : String(error)
			errorDialog.showDialog()
		}
	}

	async function importPending() {
		if (!pendingImport) return
		const data = pendingImport
		pendingImport = null
		try {
			await dexStore.importDex(data)
		} catch (error) {
			console.error(error)
			errorDialogText = error instanceof Error ? error.message : String(error)
			errorDialog.showDialog()
		}
	}
</script>

<input
	bind:this={fileInput}
	id="input-file"
	class="input-file-btn"
	type="file"
	name="input-file"
	accept=".json,application/json"
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
	onConfirm={importPending}
	onCancel={() => (pendingImport = null)}
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
	headline="Import failed"
	dialogContent={errorDialogContent}
	onConfirm={() => {}}
	onCancel={() => {}}
	okBtnText="Ok"
	size="S"
/>

<style>
	.pk-dialog-description {
		pre {
			background-color: #f8f8f8;
			border: 1px solid #ddd;
			border-radius: 5px;
			padding: 1rem;
			font-family: monospace;
			line-height: 1.4;
			white-space: pre-wrap;
			word-wrap: break-word;
			overflow-x: auto;
			color: #333;
		}
	}
	.pk-dialog-description p {
		line-height: 1.6;
		max-width: 55ch;
		letter-spacing: 0.02em;
	}
</style>
