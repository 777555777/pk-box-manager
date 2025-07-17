<script lang="ts">
	import PkDialog, { type PkDialogElement } from '$lib/components/ui/pk-dialog.svelte'

	let appSettingsDialog: PkDialogElement

	export function showAppSettingsDialog() {
		appSettingsDialog.showDialog()
	}
</script>

<PkDialog
	bind:this={appSettingsDialog}
	headline="App settings"
	dialogContent={appSettingsDialogContent}
	onConfirm={() => {}}
	onCancel={() => {}}
	cancelBtnText="Close"
/>

{#snippet appSettingsDialogContent()}
	<section class="pk-dialog-content">
		<p>App settings will be implemented in the future.</p>
	</section>
{/snippet}
