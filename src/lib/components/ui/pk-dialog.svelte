<script lang="ts">
	import { hotkeyManager } from '$lib/state/hotkey-state.svelte'
	import type { Snippet } from 'svelte'

	type ConfirmCallback = () => void
	type DismissCallback = () => void

	export interface PkDialogElement {
		showDialog: Function
	}

	interface PkDialog {
		headline: string
		dialogContent: Snippet
		onConfirm: ConfirmCallback
		onCancel: DismissCallback
		cancelBtnText?: string | undefined
		okBtnText?: string | undefined
	}

	let {
		headline = '',
		dialogContent,
		onConfirm = () => {},
		onCancel = () => {},
		cancelBtnText,
		okBtnText
	}: PkDialog = $props()

	let dialogElement: HTMLDialogElement

	export function showDialog() {
		hotkeyManager.disableAll()
		dialogElement.showModal()
	}

	function handleConfirm() {
		onConfirm()
		dialogElement.close()
		hotkeyManager.enableAll()
	}

	function handleDismiss() {
		onCancel()
		dialogElement.close()
		hotkeyManager.enableAll()
	}
</script>

<dialog class="pk-ui-section" bind:this={dialogElement}>
	<section class="pk-ui-section-inner">
		<section class="pk-dialog-header">
			<h2>{headline}</h2>
			<button class="pk-button" onclick={handleDismiss}><img src="ui/x-icon.svg" alt="" /></button>
		</section>

		<div class="separator"></div>

		<section class="pk-dialog-content">
			{#if dialogContent}
				{@render dialogContent()}
			{:else}
				<div class="pk-dialog-description">
					<p>WARNING: Dialog content not provided.</p>
				</div>
			{/if}
		</section>

		<div class="separator"></div>

		<section class="pk-dialog-footer">
			{#if okBtnText}
				<button class="pk-button" onclick={handleConfirm}><span>{okBtnText}</span></button>
			{/if}
			{#if cancelBtnText}
				<button class="pk-button" onclick={handleDismiss}><span>{cancelBtnText}</span></button>
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
		transform: translate(-50%, -55%);
		overflow: visible;
		min-width: var(--dialog-min-width);
		max-height: 90vh;
		max-width: 90vw;
		color: var(--ui-text-color);
		background: transparent;

		.pk-ui-section-inner {
			padding: var(--dialog-spacing);
			max-height: inherit;
		}
	}

	.pk-dialog-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.pk-dialog-content {
		display: flex;
		flex-direction: column;
		gap: var(--dialog-spacing);
		margin-block: calc(var(--dialog-spacing) * 2);
		flex: 1;

		.pk-dialog-description p {
			background-color: red;
			color: white;
			line-height: 1.6;
			max-width: 55ch;
			letter-spacing: 0.02em;
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

	/* Responsive Anpassungen für kleinere Bildschirme */
	@media (max-height: 800px) {
		dialog {
			margin-top: -5vh;
			max-height: 95vh;
		}
	}

	@media (max-width: 768px) {
		dialog {
			--dialog-min-width: 90vw;
			margin-top: -5vh;
			max-height: 90vh;
		}
	}
</style>
