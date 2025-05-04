<script lang="ts">
	import { pkState } from '$lib/state/pk-state.svelte'
	import PkDialog from '../ui/pk-dialog.svelte'

	interface PkDialogElement {
		showDialog: Function
	}

	let infoDialog: PkDialogElement

	const infoDialogConfig = {
		headline: 'Reset current Pokedex',
		textContent: 'Are you sure you want to reset the currently selected Pokedex?',
		cancel: true
	}

	function resetCurrentPokedex() {
		infoDialog.showDialog()
	}
</script>

<button class="pk-button" onclick={resetCurrentPokedex}
	><img src="/ui/trash-alt-solid.svg" alt="" />
</button>

<PkDialog
	bind:this={infoDialog}
	dialogConfig={infoDialogConfig}
	onConfirm={() => pkState.resetCurrentPokedex()}
	onCancel={() => {}}
	okBtnText="Reset Pokedex"
/>

<style>
	.pk-button {
		max-width: 44px;
		img {
			margin: 0;
		}
	}
</style>
