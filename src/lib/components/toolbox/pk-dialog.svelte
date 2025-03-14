<script lang="ts">
	interface DialogConfig {
		headline: string
		textContent: string
		cancle?: boolean
	}

	type ConfirmCallback = () => void
	type DismissCallback = () => void

	let {
		dialogConfig,
		onConfirm = () => {},
		onCancle = () => {}
	}: {
		dialogConfig: DialogConfig
		onConfirm: ConfirmCallback
		onCancle: DismissCallback
	} = $props()

	let dialogElement: HTMLDialogElement

	export function showDialog() {
		dialogElement.showModal()
	}

	function handleConfirm() {
		onConfirm()
		dialogElement.close()
	}

	function handleDismiss() {
		onCancle()
		dialogElement.close()
	}
</script>

<dialog bind:this={dialogElement}>
	<h3>{dialogConfig.headline}</h3>
	<p>{dialogConfig.textContent}</p>
	<div class="pk-dialog-actions">
		<button onclick={handleConfirm}>Ok</button>
		{#if dialogConfig.cancle}
			<button onclick={handleDismiss}>Cancel</button>
		{/if}
	</div>
</dialog>

<style>
	dialog {
		background-color: hsl(240, 100%, 90%);
		border: 2px solid hsl(250, 100%, 74%);
		border-radius: 10px;
		padding: 10px;

		margin: auto;
	}

	dialog::backdrop {
		background-color: rgba(0, 0, 0, 0.5);
	}

	.pk-dialog-actions {
		margin-top: 20px;
		display: flex;
		gap: 10px;
		justify-content: flex-end;

		button {
			padding: 0.35rem 0.25rem;
		}
	}
</style>
