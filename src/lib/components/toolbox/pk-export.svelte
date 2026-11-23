<script lang="ts">
	import { dexStore } from '$lib/state/app'
	import { createDexExport, exportFileName } from '$lib/dex/transfer'
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

	async function exportCurrentDex() {
		try {
			const { dex, entries } = await dexStore.getDexData(dexSaveId)
			const exportedAt = Date.now()
			const json = JSON.stringify(createDexExport(dex, entries, exportedAt), null, 2)

			const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }))
			const link = document.createElement('a')
			link.href = url
			link.download = exportFileName(dex, exportedAt)
			document.body.appendChild(link)
			link.click()
			document.body.removeChild(link)
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
