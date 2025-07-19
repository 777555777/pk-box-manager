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
		<section>
			<h3>User Preferences</h3>
			<!-- radio input for language selector english and german -->
			<fieldset>
				<legend>Application language:</legend>
				<div class="pk-radio-group">
					<label>
						<input type="radio" name="language" value="en" checked />
						English<span style="font-size: 3rem">🇩🇪</span>
					</label>
					<label>
						<input type="radio" name="language" value="de" />
						German<span style="font-size: 3rem">🇬🇧</span>
					</label>
				</div>
			</fieldset>

			<fieldset>
				<legend>Box Sprites:</legend>
				<div class="pk-radio-group">
					<label>
						<input type="radio" name="box-sprites" value="default" checked />
						Original sized
					</label>
					<label>
						<input type="radio" name="box-sprites" value="custom" />
						Scaled to fit
					</label>
					<label>
						<input type="radio" name="box-sprites" value="classic" />
						Classic Box Sprites
					</label>
				</div>
			</fieldset>

			<fieldset>
				<legend>Application Font:</legend>
				<div class="pk-radio-group">
					<label>
						<input type="radio" name="font" value="pixel" checked />
						Pixel Font
					</label>
					<label>
						<input type="radio" name="font" value="system" />
						System Font
					</label>
				</div>
			</fieldset>

			<fieldset>
				<legend>Badge Cycle options:</legend>
				<div class="pk-radio-group">
					<label>
						<input type="radio" name="badge-cycle" value="default" checked />
						Default
					</label>
					<label>
						<input type="radio" name="badge-cycle" value="icons" />
						Conditional Icons
					</label>
					<p>
						Only displays the Badge icon for Ribbons and Marks when the here selected Ribbon or Mark
						is marked as completed
					</p>
					<div class="pk-badge-cycle-icon-options">
						<!-- placeholder for ribbon picker -->
						<button>pick ribbon</button>
						<!-- placeholder for mark picker -->
						<button>pick mark</button>
					</div>
				</div>
			</fieldset>

			<!-- Reset User Preferences -->
			<button>Reset User Preferences</button>

			<hr />
			<!-- ====================================================== -->
			<h3>Application Hotkeys</h3>
			<!-- legend that displays the hotkeys that the app provides. make use of the kbd element for hotkeys! -->
			<dl class="pk-hotkey-legend">
				<dt>
					<kbd>Q</kbd>
				</dt>
				<dd>Reset selected Pokemon</dd>
				<dt>
					<kbd>B</kbd>
				</dt>
				<dd>Cycle the badge display mode</dd>
				<dt>
					<kbd>V</kbd>
				</dt>
				<dd>Toggle viewermode enabled / disabled</dd>
			</dl>
		</section>
	</section>
{/snippet}
