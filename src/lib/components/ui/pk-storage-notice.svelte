<script lang="ts">
	import { dexStore } from '$lib/state/app'
	import { storageStatus } from '$lib/state/storage-status.svelte'

	const DISMISSED_KEY = 'v1SkippedNoticeDismissed'

	// the skipped notice is dismissed per set of skipped saves (a new one shows again)
	let skippedKeys = $derived(storageStatus.skippedV1.map((item) => item.key).join('|'))
	let dismissedSkipped = $state(readDismissed())
	let retrying = $state(false)

	type Notice = 'memory' | 'storage-cleared' | 'save-failed' | 'v1-skipped' | null

	let notice: Notice = $derived(
		!storageStatus.persistent
			? 'memory'
			: (dexStore.persistError as { name?: string } | null)?.name === 'StorageClearedError'
				? 'storage-cleared'
				: dexStore.persistError
					? 'save-failed'
					: skippedKeys && dismissedSkipped !== skippedKeys
						? 'v1-skipped'
						: null
	)

	function readDismissed(): string | null {
		try {
			return localStorage.getItem(DISMISSED_KEY)
		} catch {
			return null
		}
	}

	function dismissSkipped() {
		dismissedSkipped = skippedKeys
		try {
			localStorage.setItem(DISMISSED_KEY, skippedKeys)
		} catch {
			// only for this session then
		}
	}

	async function retry() {
		retrying = true
		await dexStore.retrySaving()
		retrying = false
	}
</script>

{#if notice}
	<aside class="pk-storage-notice pk-ui-section" role="alert">
		<div class="pk-ui-section-inner pk-storage-notice-inner">
			{#if notice === 'memory'}
				<p>
					<strong>Your browser does not allow this site to store data.</strong>
					Changes are lost when you reload the page. Use the export in the Pokédex settings to keep them.
				</p>
			{:else if notice === 'storage-cleared'}
				<p>
					<strong>Your browser storage was cleared while the Box Manager was open.</strong>
					The current Pokédex is still on screen: export it now in the Pokédex settings, then reload the
					page and import it again.
				</p>
			{:else if notice === 'save-failed'}
				<p>
					<strong>Your latest changes could not be saved yet.</strong>
					Saving is retried automatically. If this keeps happening, export your Pokédex and reload the
					page.
				</p>
				<button class="pk-button" onclick={retry} disabled={retrying}>Try again</button>
			{:else}
				<p>
					<strong>
						{storageStatus.skippedV1.length === 1
							? '1 Pokédex'
							: `${storageStatus.skippedV1.length} Pokédexes`} from the previous version could not be
						loaded.
					</strong>
					The data is still kept in your browser and will be tried again with the next update.
				</p>
				<button class="pk-button" onclick={dismissSkipped}>OK</button>
			{/if}
		</div>
	</aside>
{/if}

<style>
	.pk-storage-notice {
		position: fixed;
		left: 50%;
		bottom: 1rem;
		transform: translateX(-50%);
		z-index: 50;
		width: min(640px, calc(100vw - 2rem));
		color: var(--ui-text-color);
	}

	.pk-storage-notice-inner {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 0.75rem 1rem;

		p {
			flex: 1;
			line-height: 1.4;
		}

		strong {
			display: block;
			color: var(--ui-text-active);
		}

		button {
			flex-shrink: 0;
		}
	}

	/* keep clear of the round mobile sidebar button */
	@media (max-width: 800px) {
		.pk-storage-notice {
			bottom: 5.5rem;
		}

		.pk-storage-notice-inner {
			flex-direction: column;
			align-items: stretch;
		}
	}
</style>
