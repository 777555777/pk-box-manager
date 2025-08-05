<script lang="ts">
	import PkItemSelector from '$lib/components/ui/pk-item-selector.svelte'
	import { Marks, type MarksType } from '$lib/models/marks-models'

	let {
		selectedMark,
		onUpdate,
		label = '',
		disabled = false,
		itemsPerPage = 25
	}: {
		selectedMark: MarksType
		onUpdate: (mark: MarksType) => void
		label?: string
		disabled?: boolean
		itemsPerPage?: number
	} = $props()

	function getMarkPosition(mark: string) {
		return Marks[mark as MarksType]?.pos || { x: 0, y: 0 }
	}
</script>

<PkItemSelector
	{label}
	data={Marks}
	getPosition={getMarkPosition}
	spriteUrl="/spritesheets/util/sm1.webp"
	selectedItem={selectedMark}
	{onUpdate}
	{disabled}
	{itemsPerPage}
	iconsPerRow={5}
	iconOriginalSize={48}
	iconTargetSize={34}
/>

<style>
	:global(img) {
		image-rendering: auto;
	}
</style>
