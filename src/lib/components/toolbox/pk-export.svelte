<script lang="ts">
	import { storageHandler } from '$lib/state/storage-handler'

	function exportCurrentDex() {
		const selectedDexName = storageHandler.getSelectedDexName()
		const dexState = JSON.stringify(storageHandler.getDexState(selectedDexName), null, 2)

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
	}
</script>

<button onclick={exportCurrentDex}>Export</button>
