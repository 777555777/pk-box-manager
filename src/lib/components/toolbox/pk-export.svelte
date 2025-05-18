<script lang="ts">
	import { pkState } from '$lib/state/pk-state.svelte'
	import { storageHandler } from '$lib/state/storage-handler'

	function exportCurrentDex() {
		try {
			const selectedDexName = storageHandler.loadSelectedPokedexName()
			let selectedPokedex = storageHandler.loadPokedex(selectedDexName)

			// Wenn der Dex nicht exsistiert, initialisiere ihn und lade ihn erneut
			if (!selectedPokedex) {
				storageHandler.initPokedex(pkState.getCachedOrder(selectedDexName), selectedDexName)
				selectedPokedex = storageHandler.loadPokedex(selectedDexName)
			}

			const dexState = JSON.stringify(selectedPokedex, null, 2)

			if (!dexState) {
				throw new Error('Pokedex data is empty!')
			}

			// Erstelle einen Blob mit dem JSON-Inhalt
			const blob = new Blob([dexState], { type: 'application/json' })

			// Erstelle eine URL für den Blob
			const url = URL.createObjectURL(blob)

			// Erstelle ein temporäres a-Element zum Herunterladen
			const a = document.createElement('a')
			a.href = url
			a.download = selectedDexName

			// Füge das Element zum DOM hinzu, klicke es und entferne es wieder
			document.body.appendChild(a)
			a.click()
			document.body.removeChild(a)

			// Gib die URL frei
			URL.revokeObjectURL(url)
		} catch (error) {
			console.error('Error during Pokedex export!', error)
		}
	}
</script>

<button class="pk-button" onclick={exportCurrentDex}
	><img src="/ui/download.svg" alt="" />Export</button
>

<style>
	button img {
		margin-right: 0.375rem;
	}
</style>
