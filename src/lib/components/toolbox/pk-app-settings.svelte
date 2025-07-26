<script lang="ts">
	import PkDialog, { type PkDialogElement } from '$lib/components/ui/pk-dialog.svelte'
	import { setCssPosition } from '$lib/spriteheet-helper'
	import { appState } from '$lib/state/app-state.svelte'
	import PkMarkSelector from '../ui/pk-mark-selector.svelte'
	import PkRadioGroup from '../ui/pk-radio-group.svelte'
	import PkRibbonSelector from '../ui/pk-ribbon-selector.svelte'
	import { type RibbonsType } from '$lib/models/ribbons-models'
	import { type MarksType } from '$lib/models/marks-models'

	let appSettingsDialog: PkDialogElement

	// Local state variables that will be bound to the UI
	let settings = $derived(appState.getAppSettings())

	// Update functions to save changes to app state
	function updateLanguage(newLanguage: string) {
		appState.updateAppSettings({ language: newLanguage as 'en' | 'de' })
	}

	function updateBoxSprites(newBoxSprites: string) {
		appState.updateAppSettings({ boxSprites: newBoxSprites as 'default' | 'scaled' | 'classic' })
	}

	function updateFont(newFont: string) {
		appState.updateAppSettings({ font: newFont as 'pixel' | 'system' })
	}

	function updateBadgeCycleOption(newOption: string) {
		appState.updateAppSettings({ badgeCycleOption: newOption as 'default' | 'filter' })
	}

	// === Ribbon Condition ===
	function updateRibbonCondition(newRibbonCondition: string) {
		appState.updateAppSettings({
			conditionalBadgeDisplay: {
				...settings.conditionalBadgeDisplay,
				ribbon: newRibbonCondition as RibbonsType
			}
		})
	}

	// === Mark Condition ===
	function updateMarkCondition(newMarkCondition: string) {
		appState.updateAppSettings({
			conditionalBadgeDisplay: {
				...settings.conditionalBadgeDisplay,
				mark: newMarkCondition as MarksType
			}
		})
	}

	export function showAppSettingsDialog() {
		appSettingsDialog.showDialog()
	}

	const badgeCycleConfig = [
		{ tabId: 'default', label: 'Default' },
		{ tabId: 'filter', label: 'Filter' }
	]

	const fontConfig = [
		{ tabId: 'pixel', label: 'Pixel' },
		{ tabId: 'system', label: 'System' }
	]

	const boxSpriteConfig = [
		{ tabId: 'default', label: 'Default' },
		{ tabId: 'scaled', label: 'Scaled' },
		{ tabId: 'classic', label: 'Classic' }
	]

	const appLanguageConfig = [
		{ tabId: 'en', label: 'English' },
		{ tabId: 'de', label: 'German' }
	]

	// Reactive statement to update CSS variable when font changes
	$effect(() => {
		const fontValue = settings.font === 'pixel' ? "'vt323regular'" : 'var(--system-fonts)'
		document.documentElement.style.setProperty('--primary-font-family', fontValue)
	})
</script>

<PkDialog
	bind:this={appSettingsDialog}
	headline="Settings"
	dialogContent={appSettingsDialogContent}
	onConfirm={() => {}}
	onCancel={() => {}}
	cancelBtnText="Close"
	size="L"
/>

{#snippet appSettingsDialogContent()}
	<section class="pk-dialog-section">
		<section class="pk-preferences-section">
			<h3>Preferences</h3>
			<fieldset class="pk-fieldset pk-language-options" disabled>
				<legend>Language</legend>
				<div class="pk-settings-content pk-radio-group">
					<PkRadioGroup
						bind:currentOption={settings.language}
						optionConfig={appLanguageConfig}
						onUpdate={updateLanguage}
					/>
				</div>
			</fieldset>

			<fieldset class="pk-fieldset pk-box-sprite-options" disabled>
				<legend>Box Sprites</legend>
				<div class="pk-settings-content pk-box-sprite-content">
					<PkRadioGroup
						bind:currentOption={settings.boxSprites}
						optionConfig={boxSpriteConfig}
						onUpdate={updateBoxSprites}
					/>
					<div class="example">
						<div class="example-element">
							<div class="pk-demo-slot">
								<img
									src={`/spritesheets/pokemon/sp1.webp`}
									alt="original sized sprite example"
									style={setCssPosition({ x: -96, y: 0 })}
								/>
							</div>
							<small>Original</small>
						</div>

						<div class="example-element">
							<div class="pk-demo-slot">
								<img
									src={`/spritesheets/pokemon/sp1.webp`}
									alt="scaled sprite example"
									style={setCssPosition({ x: -96, y: 0 })}
								/>
							</div>
							<small>Scaled</small>
						</div>

						<div class="example-element">
							<div class="pk-demo-slot">
								<img
									src={`/spritesheets/pokemon/sp1.webp`}
									alt="classic box sprite example"
									style={setCssPosition({ x: -96, y: 0 })}
								/>
							</div>
							<small>Classic</small>
						</div>
					</div>
				</div>
			</fieldset>

			<fieldset class="pk-fieldset pk-font-options">
				<legend>Font</legend>
				<div class="pk-settings-content pk-font-content">
					<PkRadioGroup
						bind:currentOption={settings.font}
						optionConfig={fontConfig}
						onUpdate={updateFont}
					/>
					<div class="example">
						<div class="pixel-font-example">
							<p>0001 Bulbasaur</p>
							<small>Pixel Font</small>
						</div>
						<div class="system-font-example">
							<p>0001 Bulbasaur</p>
							<small>System Font</small>
						</div>
					</div>
				</div>
			</fieldset>

			<fieldset class="pk-fieldset pk-badge-cycle-options">
				<legend>Badge Cycle options:</legend>
				<div class="pk-settings-content pk-badge-content">
					<div class="pk-badge-element">
						<PkRadioGroup
							bind:currentOption={settings.badgeCycleOption}
							optionConfig={badgeCycleConfig}
							onUpdate={updateBadgeCycleOption}
						/>
						<p class="pk-paragraph text-small">
							Only displays the Badge icon for Ribbons and Marks when the here configured Ribbon or
							Mark is marked as completed
						</p>
					</div>

					<div class="pk-badge-cycle-pickers">
						<PkRibbonSelector
							disabled={settings.badgeCycleOption !== 'filter'}
							onUpdate={updateRibbonCondition}
							selectedRibbon={settings.conditionalBadgeDisplay.ribbon}
						/>
						<PkMarkSelector
							disabled={settings.badgeCycleOption !== 'filter'}
							onUpdate={updateMarkCondition}
							selectedMark={settings.conditionalBadgeDisplay.mark}
						/>
					</div>
				</div>
			</fieldset>
		</section>

		<!-- ====================================================== -->
		<div class="separator"></div>
		<!-- ====================================================== -->

		<section class="pk-hotkey-section">
			<h3>Hotkeys</h3>
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

<style>
	.pk-dialog-section {
		display: flex;
		flex-direction: column;
		gap: 1rem;

		.separator {
			background-color: rgba(0, 0, 0, 0.1);
		}
	}

	.pk-preferences-section {
		display: flex;
		flex-direction: column;
		gap: 1rem;

		.pk-settings-content {
			display: flex;
			flex-direction: row;
			justify-content: space-between;
			gap: 3rem;
		}

		/* Sprite Styles */
		.pk-box-sprite-content {
			.example {
				display: flex;
				gap: 1rem;
				text-align: center;

				.pk-demo-slot {
					--target-size: 64;
					--original-size: 96;
					--scale-factor: calc(var(--target-size) / var(--original-size));

					width: calc(var(--target-size) * 1px);
					height: calc(var(--target-size) * 1px);
					/* cursor: pointer; */

					position: relative;
					overflow: hidden;

					border: none;
					background-color: #82829a;
					outline: 2px solid hsl(0, 0%, 40%, 0.2);
					outline-offset: -2px;
					border-radius: 5px;

					img {
						width: calc(var(--original-size) * 1px);
						height: calc(var(--original-size) * 1px);
						object-fit: none;
						transform: scale(var(--scale-factor));
						transform-origin: top left;

						image-rendering: auto;
						filter: brightness(var(--grayscale));
					}
				}

				@media (max-width: 1500px) {
					.pk-demo-slot {
						--target-size: 58;
					}
				}
			}
		}

		/* Font Styles */
		.pk-font-content {
			.example {
				display: flex;
				gap: 1rem;
				text-align: center;
				.pixel-font-example {
					font-family: 'vt323regular';
				}

				.system-font-example {
					font-family: var(--system-fonts);
				}

				p {
					background-color: #717186;
					padding: 0.5rem;
					border-radius: 5px;
				}
			}
		}

		/* Badge Styles */
		.pk-badge-content {
			.pk-badge-cycle-pickers {
				display: flex;
				gap: 1rem;
			}

			p {
				margin-top: 1rem;
				max-width: 30em;
			}
		}
	}

	/* TODO: Dropdown menus are cut off / cause the container to grow in the Y axis at the moment */
	@media (max-width: 730px) {
		.pk-preferences-section {
			max-height: 30rem;
			padding-inline: 2rem;
			padding-bottom: 1.5rem;

			overflow-y: scroll;
			scrollbar-color: #444450 #717186;
			mask: var(--scroll-indicator-gradient);
		}

		.pk-preferences-section .pk-settings-content {
			flex-direction: column;
			align-items: center;
			gap: 1rem;

			.pk-badge-element {
				text-align: center;
				justify-content: center;
				align-items: center;
			}
		}
	}

	@media (max-width: 520px) {
		.pk-preferences-section {
			padding-inline: 1rem;
		}
	}

	/* ==================================== */
	/* Hotkey Styles */
	.pk-hotkey-section {
		h3 {
			margin-bottom: 1rem;
		}

		.pk-hotkey-legend {
			display: grid;
			grid-template-columns: auto 1fr;
			align-items: center;
			gap: 1rem;

			kbd {
				/* <kbd> style from: https://dylanatsmith.com/wrote/styling-the-kbd-element */
				--kbd-color-background: #f3f4f6;
				--kbd-color-border: #343434;
				--kbd-color-text: #1f2937;

				background-color: var(--kbd-color-background);
				color: var(--kbd-color-text);

				border-radius: 0.25rem;
				border: 1px solid var(--kbd-color-border);
				box-shadow: 0 2px 0 1px var(--kbd-color-border);

				cursor: default;
				line-height: 1;

				min-width: 0.75rem;
				display: inline-block;
				text-align: center;

				padding: 4px 8px;

				position: relative;
				top: -1px;

				&:hover {
					box-shadow: 0 1px 0 0.5px var(--kbd-color-border);
					top: 1px;
				}
			}
		}
	}
</style>
