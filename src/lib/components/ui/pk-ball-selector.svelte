<script lang="ts">
	import PkItemSelector from '$lib/components/ui/pk-item-selector.svelte'
	import { Balls, type BallsType } from '$lib/models/balls-models'

	let {
		selectedBall,
		onUpdate,
		label = '',
		disabled = false,
		itemsPerPage = 40
	}: {
		selectedBall: BallsType
		onUpdate: (ball: BallsType) => void
		label?: string
		disabled?: boolean
		itemsPerPage?: number
	} = $props()

	function getBallPosition(ball: string) {
		return Balls[ball as BallsType]?.pos || { x: 0, y: 0 }
	}
</script>

<PkItemSelector
	{label}
	data={Balls}
	getPosition={getBallPosition}
	spriteUrl="/spritesheets/util/sb1.webp"
	selectedItem={selectedBall}
	{onUpdate}
	{disabled}
	{itemsPerPage}
	iconsPerRow={5}
	iconOriginalSize={30}
	iconTargetSize={48}
/>
