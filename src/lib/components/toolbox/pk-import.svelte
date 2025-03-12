<script lang="ts">
	import { validateImportedDexState } from '$lib/state/import-validation'
	import { storageHandler, type DexStorage } from '$lib/state/storage-handler'

	let fileInput: HTMLInputElement
	let dialogElement: HTMLDialogElement
	let pendingImport: DexStorage | null = null

	function readImportFile(event: Event) {
		const input = event.target as HTMLInputElement
		if (!input.files || input.files.length === 0) return
		const file = input.files[0]
		const reader = new FileReader()
		reader.onload = () => {
			try {
				const jsonData = JSON.parse(reader.result as string)
				const validDex = validateImportedDexState(jsonData)

				if (storageHandler.loadPokemonData(validDex.name)) {
					// Local data found, override it?
					pendingImport = validDex
					dialogElement.showModal()
				} else {
					// No local data found, write to localStorage!
					storageHandler.savePokemonData(validDex.name, validDex)
				}
			} catch (error) {
				console.error('Fehler beim Parsen der JSON-Datei:', error)
				alert(error)
			}
		}
		reader.readAsText(file)
	}

	function confirmOverwrite() {
		if (pendingImport) {
			storageHandler.savePokemonData(pendingImport.name, pendingImport)
			pendingImport = null
		}
		dialogElement.close()
	}

	function cancelImport() {
		pendingImport = null
		dialogElement.close()
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

<dialog bind:this={dialogElement}>
	<h2>Daten überschreiben?</h2>
	<p>
		Es existieren bereits lokale Daten für den importierten {pendingImport?.displayName || ''} Pokedex.
		Beim Importieren werden die aktuellen Daten überschrieben.
	</p>

	<div class="dialog-buttons">
		<button onclick={cancelImport}>Abbrechen</button>
		<button onclick={confirmOverwrite} class="confirm-btn">Überschreiben</button>
	</div>
</dialog>

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

		width: 4rem;
		padding: 0.35rem 0.25rem;
	}

	.button-style:hover {
		background-color: #d0d0d7;
	}

	.button-style:active {
		background-color: #b1b1b9;
	}

	dialog {
		background-color: hsl(25, 100%, 90%);
		border: 2px solid hsl(35, 100%, 74%);
		border-radius: 10px;
		padding: 10px;

		margin: auto;
	}

	dialog::backdrop {
		background-color: rgba(0, 0, 0, 0.5);
	}

	.dialog-buttons {
		margin-top: 20px;
		display: flex;
		gap: 10px;
		justify-content: flex-end;

		button {
			padding: 0.35rem 0.25rem;
		}
	}
</style>
