<script lang="ts">
	import { pkState } from '$lib/state/pk-state.svelte'
	import { storageHandler } from '$lib/state/storage-handler'

	let {
		dexName,
		disabled = false,
		hideLabel = false,
		icon = ''
	}: {
		dexName: string
		disabled?: boolean
		hideLabel?: boolean
		icon?: string
		label?: string
		id?: string
	} = $props()

	function exportCurrentDex() {
		try {
			let selectedPokedex = storageHandler.loadPokedex(dexName)

			// Wenn der Dex nicht exsistiert, initialisiere ihn und lade ihn erneut
			if (!selectedPokedex) {
				storageHandler.initPokedex(pkState.getCachedOrder(dexName), dexName)
				selectedPokedex = storageHandler.loadPokedex(dexName)
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
			a.download = `export-${new Date().toISOString().slice(0, 10)}-${dexName}` // Dateiname für den Download

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

<button class="pk-button" onclick={exportCurrentDex} {disabled}>
	{#if icon}
		<img src={icon} alt={hideLabel ? 'Export' : ''} />
	{/if}
	{#if !hideLabel}
		<span>Export</span>
	{/if}
</button>
