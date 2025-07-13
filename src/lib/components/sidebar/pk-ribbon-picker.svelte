<script lang="ts">
	import { Ribbons, type RibbonsType } from '$lib/models/ribbons-models'
	import PkIconGrid from '../ui/pk-icon-grid.svelte'

	let { onUpdate = () => {}, disabled = false } = $props()

	function getRibbonPosition(selectedRibbon: string) {
		return Ribbons[selectedRibbon as RibbonsType]?.pos || { x: 0, y: 0 }
	}

	function handleRibbonUpdate(ribbon: RibbonsType) {
		onUpdate(ribbon)
	}
</script>

<PkIconGrid
	data={Ribbons}
	getPosition={getRibbonPosition}
	spriteUrl="/spritesheets/util/sr1.webp"
	itemsPerPage={42}
	{disabled}
	onUpdate={handleRibbonUpdate}
	--icons-per-row="7"
	--icon-original-size="40"
	--icon-target-size="44"
/>
