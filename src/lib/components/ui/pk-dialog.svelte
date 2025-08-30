<script lang="ts">
	import { hotkeyManager } from '$lib/state/hotkey-state.svelte'
	import type { Snippet } from 'svelte'
	import PkIcon from '$lib/components/ui/pk-icon.svelte'

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

	function handleCancel() {
		// Wird aufgerufen wenn ESC gedrückt wird
		onCancel()
		hotkeyManager.enableAll()
	}
</script>

<dialog class="pk-ui-section dialog-size-{size}" bind:this={dialogElement} oncancel={handleCancel}>
	<section class="pk-ui-section-inner">
		<section class="pk-dialog-header">
			<h2>{headline}</h2>
			<button class="pk-button" onclick={handleDismiss}>
				<PkIcon color="#fff" name={'close'} size={24} />
			</button>
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
		transform: translate(-50%, -50%);
		overflow: visible;
		max-height: 95vh;
		max-width: 90vw;
		color: var(--ui-text-color);
		background: transparent;

		/* Nur anwenden wenn der Dialog geöffnet ist */
		&[open] {
			display: flex;
			flex-direction: column;
		}

		.pk-ui-section-inner {
			padding: var(--dialog-spacing);
			height: 100%;
			display: flex;
			flex-direction: column;
			overflow: hidden;
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
		flex-shrink: 0; /* Header soll nicht schrumpfen */

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
		min-height: 0; /* Wichtig für Flexbox-Scrolling */
		overflow-y: auto;

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
		flex-shrink: 0; /* Footer soll nicht schrumpfen */
		justify-content: flex-end;
		z-index: 2;

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
			max-height: 95vh;
		}
	}

	/* Sehr kleine Bildschirme - S wird noch kleiner */
	@media (max-width: 520px) {
		.dialog-size-S,
		.dialog-size-M,
		.dialog-size-L {
			width: 95dvw;
			min-width: 95dvw;
			max-width: 95dvw;
		}

		.pk-dialog-content {
			padding-inline: 0.5rem;
			margin-block: calc(var(--dialog-spacing) * 1);
		}
	}

	/* Vollbild-Modus für sehr kleine Bildschirme */
	@media (max-width: 460px) {
		.dialog-size-S,
		.dialog-size-M,
		.dialog-size-L {
			width: 100dvw;
			min-width: 100dvw;
			max-width: 100dvw;
			max-height: 100dvh;
			top: 0;
			left: 0;
			transform: none; /* Entfernt die Zentrierung */
		}

		.pk-dialog-content {
			padding-inline: 0.25rem;
		}
	}
</style>
