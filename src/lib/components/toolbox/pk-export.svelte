<script lang="ts">
	import { storageHandler } from '$lib/state/storage-handler'
	import PkIcon from '$lib/components/ui/pk-icon.svelte'

	let {
		dexSaveId,
		disabled = false,
		hideLabel = false
	}: {
		dexSaveId: string
		disabled?: boolean
		hideLabel?: boolean
		icon?: string
		label?: string
	} = $props()

	function exportCurrentDex() {
		try {
			let selectedPokedex = storageHandler.loadPokedex(dexSaveId)

			const selectedDexSave = JSON.stringify(selectedPokedex, null, 2)

			if (!selectedDexSave) {
				throw new Error('Pokedex data is empty!')
			}

			// Erstelle einen Blob mit dem JSON-Inhalt
			const blob = new Blob([selectedDexSave], { type: 'application/json' })

			// Erstelle eine URL für den Blob
			const url = URL.createObjectURL(blob)

			// Erstelle ein temporäres a-Element zum Herunterladen
			const a = document.createElement('a')
			a.href = url
			a.download = `export-${new Date().toISOString().slice(0, 10)}-${dexSaveId}` // Dateiname für den Download

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

<button
	class="pk-button pk-tooltip"
	data-tooltip={hideLabel ? 'Export Pokedex' : ''}
	onclick={exportCurrentDex}
	{disabled}
>
	<PkIcon color="#fff" name="download" size={24} />

	{#if !hideLabel}
		<span>Export</span>
	{/if}
</button>
