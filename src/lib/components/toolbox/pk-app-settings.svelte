<script lang="ts">
	import PkDialog, { type PkDialogElement } from '$lib/components/ui/pk-dialog.svelte'
	import { setCssPosition } from '$lib/spriteheet-helper'
	import PkRadioGroup from '../ui/pk-radio-group.svelte'

	let appSettingsDialog: PkDialogElement

	export function showAppSettingsDialog() {
		appSettingsDialog.showDialog()
	}

	let currentBadgeCycle = $state('default')
	const badgeCycleConfig = [
		{ tabId: 'default', label: 'Default' },
		{ tabId: 'conditional', label: 'Conditional' }
	]

	let currentFont = $state('pixel-font')
	const fontConfig = [
		{ tabId: 'pixel-font', label: 'Pixel Font' },
		{ tabId: 'system-font', label: 'System Font' }
	]

	let currentBoxSprites = $state('original')
	const boxSpriteConfig = [
		{ tabId: 'original', label: 'Original' },
		{ tabId: 'scaled', label: 'Scaled' },
		{ tabId: 'classic', label: 'Classic' }
	]

	let currentAppLanguage = $state('en')
	const appLanguageConfig = [
		{ tabId: 'en', label: 'English' },
		{ tabId: 'de', label: 'German' }
	]

	// Reactive statement to update CSS variable when font changes
	$effect(() => {
		const fontValue = currentFont === 'pixel-font' ? "'vt323regular'" : 'var(--system-fonts)'
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
/>

{#snippet appSettingsDialogContent()}
	<section class="pk-dialog-content">
		<section class="pk-preferences-section">
			<h3>Preferences</h3>
			<!-- radio input for language selector english and german -->
			<fieldset class="pk-language-options" disabled>
				<legend>Language</legend>
				<div class="pk-radio-group">
					<PkRadioGroup bind:currentOption={currentAppLanguage} optionConfig={appLanguageConfig} />
				</div>
			</fieldset>

			<fieldset class="pk-box-sprite-options" disabled>
				<legend>Box Sprites</legend>
				<div class="pk-box-sprite-content">
					<PkRadioGroup bind:currentOption={currentBoxSprites} optionConfig={boxSpriteConfig} />
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

			<fieldset class="pk-font-options">
				<legend>Font</legend>
				<div class="pk-font-content">
					<PkRadioGroup bind:currentOption={currentFont} optionConfig={fontConfig} />
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

			<fieldset class="pk-badge-cycle-options">
				<legend>Badge Cycle options:</legend>
				<div class="pk-badge-content">
					<div class="pk-badge-element">
						<PkRadioGroup bind:currentOption={currentBadgeCycle} optionConfig={badgeCycleConfig} />
						<p class="text-small">
							Only displays the Badge icon for Ribbons and Marks when the here configured Ribbon or
							Mark is marked as completed
						</p>
					</div>

					<div class="pk-badge-cycle-pickers">
						<!-- placeholder for ribbon picker -->
						<button class="pk-button" disabled={currentBadgeCycle !== 'conditional'}>R</button>
						<!-- placeholder for mark picker -->
						<button class="pk-button" disabled={currentBadgeCycle !== 'conditional'}>M</button>
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
	.pk-dialog-content {
		display: flex;
		flex-direction: column;
		gap: 1rem;

		fieldset {
			border: 2px solid #57808e;
			border-radius: 5px;
			padding: 0.5rem 1rem;

			legend {
				margin-bottom: 0.5rem;
				padding-inline: 0.5rem;
			}

			:global(.pk-tab-group) {
				margin: 0;
			}
		}
		.separator {
			background-color: rgba(0, 0, 0, 0.1);
		}

		.pk-preferences-section {
			display: flex;
			flex-direction: column;
			gap: 1rem;
		}
	}

	/* Sprite Styles */
	.pk-box-sprite-content {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		gap: 5rem;

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
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		gap: 5rem;

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
		display: flex;
		justify-content: space-between;
		gap: 5rem;

		p {
			max-width: 30em;
		}

		.pk-badge-element {
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			gap: 1rem;
		}

		.pk-badge-cycle-pickers {
			display: flex;
			gap: 1rem;
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
