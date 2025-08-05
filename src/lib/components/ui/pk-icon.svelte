<script lang="ts">
	let {
		name = '',
		size = 24,
		color = 'currentColor',
		ariaLabelledby = ``
	}: { name: string; size?: number; color?: string; ariaLabelledby?: string } = $props()
</script>

<svg
	class="icon"
	style="width: {size}px; height: {size}px; min-height: {size}px; min-width: {size}px; color: {color};"
	aria-labelledby={ariaLabelledby ? ariaLabelledby : ''}
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
