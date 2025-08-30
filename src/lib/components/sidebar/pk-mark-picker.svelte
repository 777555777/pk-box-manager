<script lang="ts">
	import { Marks, type MarksType } from '$lib/models/marks-models'
	import PkIconGrid from '$lib/components/ui/base/pk-icon-grid.svelte'

	let { onUpdate = () => {}, disabled = false, selectedMarks = [] } = $props()

	function getMarkPosition(selectedMark: string) {
		return Marks[selectedMark as MarksType]?.pos || { x: 0, y: 0 }
	}

	function handleMarkUpdate(mark: MarksType) {
		onUpdate(mark)
	}

	const activeRibbons = $derived(new Set(selectedMarks))
</script>

<PkIconGrid
	data={Marks}
	getPosition={getMarkPosition}
	spriteUrl="/spritesheets/util/sm1.webp"
	itemsPerPage={30}
	iconsPerRow={6}
	{disabled}
	onUpdate={handleMarkUpdate}
	activeItems={activeRibbons}
	fixedHeight={true}
	hasBorder={true}
	--icon-original-size="48"
	--icon-target-size="44"
	--icon-scale-factor={44 / 48}
/>
