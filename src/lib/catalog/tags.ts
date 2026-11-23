import type { BoxTag } from './types.ts'

/** Display name of a box tag. */
export function formatTagName(tag: BoxTag): string {
	if (tag === 'gigantamax') return 'G-Max'
	return tag.charAt(0).toUpperCase() + tag.slice(1)
}
