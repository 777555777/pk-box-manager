<script lang="ts">
	import { appState } from '$lib/state/app-state.svelte'
	import { pkState } from '$lib/state/pk-state.svelte'
	import { createHotkeyHandler } from '$lib/hotkey-utils'
	import PkDefaults from '$lib/components/toolbox/pk-defaults.svelte'
	import PkToggle from '$lib/components/ui/pk-toggle.svelte'
	import PkPokedex from '$lib/components/toolbox/pk-pokedex.svelte'
	import PkAppSettings from './pk-app-settings.svelte'
	import PkBadgeButton from './pk-badge-button.svelte'

	interface PkDefaultsDialogElement {
		showDefaultsDialog: Function
	}

	interface PkPokedexDialogElement {
		showPokedexDialog: Function
	}

	interface PkAppSettingsDialogElement {
		showAppSettingsDialog: Function
	}

	let defaultsDialog: PkDefaultsDialogElement
	let pokedexDialog: PkPokedexDialogElement
	let appSettingsDialog: PkAppSettingsDialogElement

	let viewerMode = $derived(appState.isViewerModeEnabled())

	function toggleViewerMode() {
		appState.toggleViewerMode()
	}

	function cycleBadgeDisplay() {
		appState.cycleBadgeDisplayMode()
	}

	function openDefaultDialog() {
		defaultsDialog.showDefaultsDialog()
	}

	function openPokedexDialog() {
		pkState.loadAllPokedexes()
		pokedexDialog.showPokedexDialog()
	}

	function openAppSettingsDialog() {
		appSettingsDialog.showAppSettingsDialog()
	}

	const hotkeyHandlerBadge = createHotkeyHandler('KeyB', cycleBadgeDisplay)
	const hotkeyHandlerViewerMode = createHotkeyHandler('KeyV', toggleViewerMode)

	// Update it whenever the state manager's selection changes
	$effect(() => {
		document.addEventListener('keydown', hotkeyHandlerBadge)
		document.addEventListener('keydown', hotkeyHandlerViewerMode)
		return () => {
			document.removeEventListener('keydown', hotkeyHandlerBadge)
			document.removeEventListener('keydown', hotkeyHandlerViewerMode)
		}
	})
</script>

<aside class="pk-toolbox pk-ui-section">
	<section class="pk-ui-section-inner">
		<div class="pk-pokedex-data">
			<div class="pk-toolbox-btn-group">
				<button
					class="pk-button pk-tooltip"
					onclick={openPokedexDialog}
					data-tooltip="Open Pokedex configurations"
				>
					<img src="/ui/folder-open.svg" alt="" />
					<span>Pokedex</span></button
				>
			</div>
		</div>

		<div class="separator-vertical"></div>

		<div class="pk-modes">
			<PkToggle
				icon="/ui/pen.svg"
				activeColor="hsla(0, 100%, 30%, 0.6)"
				label="Viewer Mode"
				hideLabel={true}
				tooltip="Toggle Viewer Mode (V)"
				checked={viewerMode}
				onUpdate={toggleViewerMode}
			/>

			<PkBadgeButton />

			<button
				class="pk-button pk-tooltip"
				onclick={openDefaultDialog}
				data-tooltip="Open edit defaults"
			>
				<img class={appState.hasModifiedDefaults() ? 'modified' : ''} src="/ui/tag.svg" alt="" />
				<span class={appState.hasModifiedDefaults() ? 'modified' : ''}>Defaults</span>
			</button>
		</div>

		<div class="separator-vertical"></div>

		<button
			class="pk-button pk-tooltip"
			onclick={openAppSettingsDialog}
			data-tooltip="Open App Settings"
		>
			<img src="/ui/cog.svg" alt="" />
			<span>Settings</span>
		</button>
	</section>

	<PkAppSettings bind:this={appSettingsDialog} />
	<PkDefaults bind:this={defaultsDialog} />
	<PkPokedex bind:this={pokedexDialog} />
</aside>

<style>
	.pk-toolbox {
		/* Positioning */
		position: fixed;
		top: 0;
		z-index: 30;

		/* Adjust top offset correctly */
		transform: translateY(calc(-1 * 18px));

		.pk-ui-section-inner {
			display: flex;
			justify-content: space-around;
			padding: 0.5rem;
		}
	}

	.pk-pokedex-data {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
	}

	.pk-modes {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
	}

	.pk-toolbox-btn-group {
		display: flex;
		gap: 1rem;
	}

	.modified {
		filter: brightness(0) saturate(100%) invert(77%) sepia(49%) saturate(728%) hue-rotate(320deg)
			brightness(105%) contrast(105%);
	}

	@media (max-width: 1350px) {
		.pk-button {
			max-width: 44px;

			span {
				display: none;
			}
		}
	}
</style>
