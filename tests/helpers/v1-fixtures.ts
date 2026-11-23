import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import type { DexSave } from '../../src/lib/models/data-models.ts'

const FIXTURE_DIR = fileURLToPath(new URL('../fixtures/v1/', import.meta.url))
const TESTDATA_DIR = fileURLToPath(new URL('../../.testdata/', import.meta.url))

export const V1_DEX_FIXTURES = [
	'national-all-tags-legacy',
	'gen1-empty-all-tags',
	'gen1-filled',
	'gen3-forms'
] as const

export type V1DexFixture = (typeof V1_DEX_FIXTURES)[number]

interface V1Session {
	dexIds: { national: string; gen1Empty: string; gen1Filled: string; gen3: string }
	localStorage: Record<string, string>
}

/** Raw string exactly as it was stored in localStorage under `dex:<id>`. */
export function readV1DexRaw(name: V1DexFixture): string {
	return readFileSync(`${FIXTURE_DIR}${name}.json`, 'utf-8')
}

/** Fresh parsed copy of a v1 dex fixture (safe to mutate). */
export function loadV1Dex(name: V1DexFixture): DexSave {
	return JSON.parse(readV1DexRaw(name))
}

export function loadV1Session(): V1Session {
	return JSON.parse(readFileSync(`${FIXTURE_DIR}session.json`, 'utf-8'))
}

export interface V1PresetResolution {
	/** Tag order as returned by v1 getAllPossibleTags(). */
	allTags: string[]
	presets: {
		presetId: string
		displayName: string
		coverImage: string
		sortOrder: number
		boxList: string[]
		availableTags: string[]
	}[]
	/** Key: "<presetId>|<comma separated tags>" for every preset × tag subset. */
	resolutions: Record<string, { boxes: string[]; firstAndLast: string[]; count: number }>
}

/** How v1 resolved every preset with every combination of tags (box titles, counts). */
export function loadV1PresetResolution(): V1PresetResolution {
	return JSON.parse(readFileSync(`${FIXTURE_DIR}preset-resolution.json`, 'utf-8'))
}

/**
 * Fills localStorage with the complete v1 session: all dex fixtures plus
 * `selectedDex`, `appSettings` and `appDefaults`.
 */
export function seedV1LocalStorage(): V1Session['dexIds'] {
	const session = loadV1Session()
	for (const name of V1_DEX_FIXTURES) {
		const raw = readV1DexRaw(name)
		localStorage.setItem(`dex:${JSON.parse(raw).id}`, raw)
	}
	for (const [key, value] of Object.entries(session.localStorage)) {
		localStorage.setItem(key, value)
	}
	return session.dexIds
}

/**
 * Real user exports from `/.testdata` (git-ignored). Empty when the folder does not exist,
 * so tests depending on it can be skipped with `describe.skipIf(realExports.length === 0)`.
 */
export function readRealExports(): { file: string; raw: string }[] {
	if (!existsSync(TESTDATA_DIR)) return []
	return readdirSync(TESTDATA_DIR)
		.filter((file) => file.endsWith('.json'))
		.map((file) => ({ file, raw: readFileSync(`${TESTDATA_DIR}${file}`, 'utf-8') }))
}
