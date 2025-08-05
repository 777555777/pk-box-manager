<script lang="ts">
	let {
		name = '',
		size = 24,
		color = 'currentColor'
	}: { name: string; size: number; color: string } = $props()
</script>

<svg
	class="icon"
	style="width: {size}px; height: {size}px; min-height: {size}px; min-width: {size}px; color: {color};"
>
	<use href="/ui/icon-spritesheet.svg#{name}"></use>
</svg>

<style>
	.icon {
		fill: currentColor;
		display: inline-block;
		vertical-align: middle;
	}
</style>
