<script lang="ts">
	import PkItemSelector from '$lib/components/ui/pk-item-selector.svelte'
	import { Ribbons, type RibbonsType } from '$lib/models/ribbons-models'

	let {
		selectedRibbon,
		onUpdate,
		label = '',
		disabled = false,
		itemsPerPage = 25
	}: {
		selectedRibbon: RibbonsType
		onUpdate: (ribbon: RibbonsType) => void
		label?: string
		disabled?: boolean
		itemsPerPage?: number
	} = $props()

	function getRibbonPosition(ribbon: string) {
		return Ribbons[ribbon as RibbonsType]?.pos || { x: 0, y: 0 }
	}
</script>

<PkItemSelector
	{label}
	data={Ribbons}
	getPosition={getRibbonPosition}
	spriteUrl="/spritesheets/util/sr1.webp"
	selectedItem={selectedRibbon}
	{onUpdate}
	{disabled}
	{itemsPerPage}
	iconsPerRow={5}
	iconOriginalSize={40}
	iconTargetSize={38}
/>

<style>
	:global(img) {
		image-rendering: auto;
	}
</style>
