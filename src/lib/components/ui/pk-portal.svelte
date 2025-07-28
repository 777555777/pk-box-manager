<script lang="ts">
	let {
		show = false,
		trigger = null as HTMLElement | null,
		children,
		onClickOutside = () => {}
	}: {
		show: boolean
		trigger: HTMLElement | null
		children: any
		onClickOutside?: (event: MouseEvent) => void
	} = $props()

	let portalElement = $state<HTMLElement | null>(null)

	function handleClickOutside(event: MouseEvent) {
		if (
			portalElement &&
			!portalElement.contains(event.target as Node) &&
			trigger &&
			!trigger.contains(event.target as Node)
		) {
			onClickOutside(event)
		}
	}

	$effect(() => {
		if (show && trigger && portalElement) {
			document.addEventListener('click', handleClickOutside)
		}

		return () => {
			document.removeEventListener('click', handleClickOutside)
		}
	})
</script>

{#if show}
	<div bind:this={portalElement} class="pk-portal" style="position: fixed; z-index: 1000;">
		{@render children()}
	</div>
{/if}

<style>
	.pk-portal {
		position: absolute;
		z-index: 30;
	}
</style>
