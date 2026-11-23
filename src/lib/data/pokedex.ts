import { type DexConfig } from '../models/data-models.ts'
import { catalog } from '../catalog/catalog.ts'

/**
 * v1 view on the catalog presets (src/lib/catalog/presets.ts).
 * Kept until the app state is migrated to the v2 data model.
 */
function toV1Preset(presetId: string): DexConfig {
	const preset = catalog.getPreset(presetId)
	if (!preset) throw new Error(`Unknown preset "${presetId}"`)

	// key order matters: it defines the JSON layout of stored v1 saves
	return {
		presetId: preset.id,
		configVersion: '',
		type: 'preset',
		displayName: preset.name,
		coverImage: preset.coverImage,
		sortOrder: catalog.listPresets().findIndex((p) => p.id === presetId),
		tags: ['normal'],
		boxList: preset.boxes,
		pokemonOrder: [],
		createdAt: 0,
		updatedAt: 0
	}
}

// Exported because it is the default Pokedex
export const nationalDex: DexConfig = toV1Preset('national')

export const dexPresets = {
	nationalDex,
	gen1Dex: toV1Preset('generation-1'),
	gen2Dex: toV1Preset('generation-2'),
	gen3Dex: toV1Preset('generation-3'),
	gen4Dex: toV1Preset('generation-4'),
	gen5Dex: toV1Preset('generation-5'),
	gen6Dex: toV1Preset('generation-6')
}
