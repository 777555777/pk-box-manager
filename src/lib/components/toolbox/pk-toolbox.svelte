<script lang="ts">
	import { appState } from '$lib/state/app-state.svelte'
	import { pkState } from '$lib/state/pk-state.svelte'
	import { createHotkeyHandler } from '$lib/hotkey-utils'
	import PkDefaults from '$lib/components/toolbox/pk-defaults.svelte'
	import PkToggle from '$lib/components/ui/pk-toggle.svelte'
	import PkPokedex from '$lib/components/toolbox/pk-pokedex.svelte'
	import PkAppSettings from './pk-app-settings.svelte'
	import PkBadgeButton from './pk-badge-button.svelte'
	import PkIcon from '$lib/components/ui/pk-icon.svelte'

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
	let isMobileSidebarOpen = $derived(appState.isMobileSidebarOpen())

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

<aside class="pk-toolbox pk-ui-section {isMobileSidebarOpen ? 'hide' : ''}">
	<section class="pk-ui-section-inner">
		<div class="pk-pokedex-data">
			<div class="pk-toolbox-btn-group">
				<button
					class="pk-button pk-tooltip"
					onclick={openPokedexDialog}
					data-tooltip="Open Pokedex configurations"
				>
					<PkIcon color="#fff" name={'folder-open'} size={24} />
					<span>Pokedex</span>
				</button>
			</div>
		</div>

		<div class="separator-vertical"></div>

		<div class="pk-modes">
			<PkToggle
				icon="pen"
				iconColor="#fff"
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
				<PkIcon
					color={appState.hasModifiedDefaults() ? 'var(--ui-text-active)' : '#fff'}
					name={'tag'}
					size={24}
				/>
				<span class={appState.hasModifiedDefaults() ? 'modified' : ''}>Defaults</span>
			</button>
		</div>

		<div class="separator-vertical"></div>

		<button
			class="pk-button pk-tooltip"
			onclick={openAppSettingsDialog}
			data-tooltip="Open App Settings"
		>
			<PkIcon color="#fff" name={'cog'} size={24} />
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
		transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);

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

	@media (max-width: 480px) {
		.separator-vertical {
			margin-inline: 0.5rem;
		}
		.pk-toolbox {
			position: fixed;
			left: 0;
			right: 0;
			width: 100vw;
			max-width: 100vw;
			border-radius: 20px 20px 0 0;
			box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
		}

		.hide {
			transform: translateY(calc(-1 * 90px)); /* Position hidden */
		}
	}
</style>
