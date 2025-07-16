<script lang="ts">
	import { appState } from '$lib/state/app-state.svelte'
	import PkImport from '$lib/components/toolbox/pk-import.svelte'
	import PkDexSelector from '$lib/components/toolbox/pk-dex-selector.svelte'
	import PkDefaults from '$lib/components/toolbox/pk-defaults.svelte'
	import PkToggle from '$lib/components/ui/pk-toggle.svelte'
	import { createHotkeyHandler } from '$lib/hotkey-utils'
	import PkPokedex from './pk-pokedex.svelte'

	interface PkDefaultsDialogElement {
		showDefaultsDialog: Function
	}

	interface PkPokedexDialogElement {
		showPokedexDialog: Function
	}

	let defaultsDialog: PkDefaultsDialogElement
	let pokedexDialog: PkPokedexDialogElement

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
		pokedexDialog.showPokedexDialog()
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
				<button class="pk-button" onclick={openPokedexDialog}
					><img src="/ui/tag.svg" alt="" />
					<span>Pokedex</span></button
				>
				<PkImport />
			</div>
		</div>

		<div class="separator-vertical"></div>

		<div class="pk-modes">
			<PkToggle
				icon="/ui/pen.svg"
				activeColor="hsla(0, 100%, 30%, 0.6)"
				label="Viewer Mode"
				hideLabel={true}
				checked={viewerMode}
				onUpdate={toggleViewerMode}
			/>

			<button class="pk-button" onclick={cycleBadgeDisplay}
				><img src="/ui/refresh.svg" alt="" /><span>Badge</span>
			</button>

			<button class="pk-button" onclick={openDefaultDialog}
				><img class={appState.hasModifiedDefaults() ? 'modified' : ''} src="/ui/tag.svg" alt="" />
				<span>Defaults</span></button
			>
		</div>
	</section>

	<PkDefaults bind:this={defaultsDialog} />
	<PkPokedex bind:this={pokedexDialog} />
</aside>

<style>
	.pk-toolbox {
		/* Positioning */
		position: fixed;
		top: 0;
		z-index: 5;

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
