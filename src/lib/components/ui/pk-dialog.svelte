<script lang="ts">
	import { hotkeyManager } from '$lib/state/hotkey-state.svelte'
	import type { Snippet } from 'svelte'

	type ConfirmCallback = () => void
	type DismissCallback = () => void
	type DialogSize = 'S' | 'M' | 'L'

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
		size?: DialogSize
	}

	let {
		headline = '',
		dialogContent,
		onConfirm = () => {},
		onCancel = () => {},
		cancelBtnText,
		okBtnText,
		size = 'S'
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

<dialog class="pk-ui-section dialog-size-{size}" bind:this={dialogElement}>
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
	:root {
		--dialog-size-s: 560px;
		--dialog-size-m: 680px;
		--dialog-size-l: 960px;
	}

	dialog {
		--dialog-spacing: 1rem;

		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -55%);
		overflow: visible;
		max-height: 90vh;
		max-width: 90vw;
		color: var(--ui-text-color);
		background: transparent;

		.pk-ui-section-inner {
			padding: var(--dialog-spacing);
			max-height: inherit;
		}
	}

	/* Dialog Größen */
	.dialog-size-S {
		width: var(--dialog-size-s);
		min-width: var(--dialog-size-s);
	}

	.dialog-size-M {
		width: var(--dialog-size-m);
		min-width: var(--dialog-size-m);
	}

	.dialog-size-L {
		width: var(--dialog-size-l);
		min-width: var(--dialog-size-l);
	}

	.pk-dialog-header {
		display: flex;
		align-items: center;
		justify-content: space-between;

		button {
			margin-left: 2rem;
		}
	}

	.pk-dialog-content {
		display: flex;
		flex-direction: column;
		gap: var(--dialog-spacing);
		margin-block: calc(var(--dialog-spacing) * 2);
		flex: 1;
		padding-inline: 1rem;

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

	/* Tablet - L wird zu M, M bleibt M, S bleibt S */
	@media (max-width: 1024px) {
		.dialog-size-L {
			width: 90vw;
			min-width: 90vw;
		}
	}

	/* Mobile - alle Dialoge werden schmaler */
	@media (max-width: 768px) {
		.dialog-size-S,
		.dialog-size-M,
		.dialog-size-L {
			width: 90vw;
			min-width: 90vw;
		}

		dialog {
			margin-top: -5vh;
			max-height: 95vh;
		}
	}

	/* Sehr kleine Bildschirme - S wird noch kleiner */
	@media (max-width: 520px) {
		.dialog-size-S,
		.dialog-size-M,
		.dialog-size-L {
			width: 95vw;
			min-width: 95vw;
		}

		.pk-dialog-content {
			padding-inline: 0.5rem;
		}
	}
</style>
