<script lang="ts">
	import { pkState } from '$lib/state/pk-state.svelte'
	import PkDialog, { type PkDialogElement } from '../ui/pk-dialog.svelte'

	let infoDialog: PkDialogElement

	function resetCurrentPokedex() {
		infoDialog.showDialog()
	}
</script>

<button class="pk-button" onclick={resetCurrentPokedex}
	><img src="/ui/trash-alt-solid.svg" alt="" />
</button>

{#snippet infoDialogContent()}
	<div class="pk-dialog-description">
		<p>Are you sure you want to reset the currently selected Pokedex?</p>
	</div>
{/snippet}

<PkDialog
	bind:this={infoDialog}
	headline="Reset current Pokedex"
	dialogContent={infoDialogContent}
	onConfirm={() => pkState.resetCurrentPokedex()}
	onCancel={() => {}}
	okBtnText="Reset Pokedex"
	cancelBtnText="Cancel"
/>

<style>
	.pk-button {
		max-width: 44px;
		img {
			margin: 0;
		}
	}
</style>
