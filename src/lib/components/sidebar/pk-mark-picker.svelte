<script lang="ts">
	import { Marks, type MarksType } from '$lib/models/marks-models'
	import PkIconGrid from '../ui/pk-icon-grid.svelte'

	let { onUpdate = () => {}, disabled = false } = $props()

	function getMarkPosition(selectedMark: string) {
		return Marks[selectedMark as MarksType]?.pos || { x: 0, y: 0 }
	}

	function handleMarkUpdate(Mark: MarksType) {
		onUpdate(Mark)
	}
</script>

<PkIconGrid
	data={Marks}
	getPosition={getMarkPosition}
	spriteUrl="/spritesheets/util/sm1.webp"
	itemsPerPage={42}
	{disabled}
	onUpdate={handleMarkUpdate}
	--icons-per-row="7"
	--icon-original-size="40"
	--icon-target-size="44"
/>
