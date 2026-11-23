import type { V1MigrationInfo } from '../storage/repository.ts'

/** What the start sequence found out about the storage (shown by pk-storage-notice). */
export const storageStatus: {
	/** False when IndexedDB is unavailable and changes only live in memory. */
	persistent: boolean
	/** v1 saves that could not be migrated (still kept in localStorage). */
	skippedV1: V1MigrationInfo['skipped']
} = $state({ persistent: true, skippedV1: [] })
