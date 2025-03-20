<script lang="ts">
	import { appState } from '$lib/state/app-state.svelte'
	import PkGameSelector from '$lib/components/util/pk-game-selector.svelte'
	import PkShinyToggle from '$lib/components/util/pk-shiny-toggle.svelte'
	import PkDefaultBallSelector from '$lib/components/util/pk-default-ball-selector.svelte'
	import PkCommentTextarea from '$lib/components/util/pk-comment-textarea.svelte'

	export function showDefaultsDialog() {
		dialogElement.showModal()
	}

	function closeDialog() {
		dialogElement.close()
	}

	let dialogElement: HTMLDialogElement

	function resetDefaults() {
		appState.resetAppDefaults()
	}
</script>

<dialog bind:this={dialogElement}>
	<section class="pk-defaults">
		<!-- Ball -->
		<PkDefaultBallSelector />
		<!-- Shiny -->
		<PkShinyToggle />
		<!-- Game -->
		<PkGameSelector />
		<!-- Comment -->
		<PkCommentTextarea />
	</section>
	<button onclick={resetDefaults}>Reset</button>
	<button onclick={closeDialog}>Close</button>
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

	.pk-defaults {
		margin-top: 20px;
		display: flex;
		flex-direction: column;
		align-items: start;
		gap: 10px;
	}

	button {
		padding: 0.35rem 0.25rem;
	}
</style>
