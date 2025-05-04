<script lang="ts">
	interface DialogConfig {
		headline: string
		textContent: string
		cancel?: boolean
	}

	type ConfirmCallback = () => void
	type DismissCallback = () => void

	let {
		dialogConfig,
		onConfirm = () => {},
		onCancel = () => {},
		cancelBtnText = 'Cancel',
		okBtnText = 'Ok'
	}: {
		dialogConfig: DialogConfig
		onConfirm: ConfirmCallback
		onCancel: DismissCallback
		cancelBtnText?: string
		okBtnText?: string
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
		onCancel()
		dialogElement.close()
	}
</script>

<dialog class="pk-ui-section" bind:this={dialogElement}>
	<section class="pk-ui-section-inner">
		<section class="pk-dialog-header">
			<h2>{dialogConfig.headline}</h2>
			<button class="pk-button" onclick={handleDismiss}><img src="ui/x-icon.webp" alt="" /></button>
		</section>

		<div class="separator"></div>

		<section class="pk-dialog-content">
			<section class="pk-dialog-description">
				<p>{dialogConfig.textContent}</p>
			</section>
		</section>

		<div class="separator"></div>

		<section class="pk-dialog-footer">
			<button class="pk-button" onclick={handleConfirm}>{okBtnText}</button>

			{#if dialogConfig.cancel}
				<button class="pk-button" onclick={handleDismiss}>{cancelBtnText}</button>
			{/if}
		</section>
	</section>
</dialog>

<style>
	dialog {
		--dialog-spacing: 1rem;
		--dialog-min-width: 680px;

		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -65%);
		overflow: visible;
		min-width: var(--dialog-min-width);
		color: var(--ui-text-color);
		.pk-ui-section-inner {
			padding: var(--dialog-spacing);
		}
	}

	.pk-dialog-header {
		display: flex;
		align-items: center;
		justify-content: space-between;

		.pk-button {
			max-width: 44px;
		}
	}

	.pk-dialog-content {
		display: flex;
		flex-direction: column;
		gap: var(--dialog-spacing);
		margin-block: calc(var(--dialog-spacing) * 2);

		.pk-dialog-description {
			/* margin-bottom: 1rem; */

			p {
				line-height: 1.6;
				max-width: 55ch;
				letter-spacing: 0.02em;
			}
		}
	}

	.pk-dialog-footer {
		display: flex;
		justify-content: flex-end;

		.pk-button:nth-child(2) {
			margin-left: 1rem;
		}
	}

	dialog::backdrop {
		background-color: rgba(0, 0, 0, 0.5);
	}
</style>
