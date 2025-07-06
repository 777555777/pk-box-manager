import { storageHandler } from '../lib/state/storage-handler.ts'
import { browser } from '$app/environment'
import { pkState } from '../lib/state/pk-state.svelte.ts'
import type { PageLoad } from './$types'
import type { ServerBoxOrder } from './pkorder/+server.ts'

export const prerender = false
export const ssr = false

export const load: PageLoad = async ({ fetch }) => {
	if (browser) {
		const selectedDexName = storageHandler.loadSelectedPokedexName()
		const response = await fetch(`/pkorder?dexname=${encodeURIComponent(selectedDexName)}`)
		const boxOrder: ServerBoxOrder[] = await response.json()

		pkState.addToBoxOrderCache(selectedDexName, boxOrder)
		pkState.initBoxOrderState(boxOrder, selectedDexName)
	}

	// Sveltekit always builds a client bundle and a server bundle.
	// The above code cannot be executed on the server due to the use of
	// Localstorage that does not exist on the server.
	// Running the above code on the server would cause the build to fail.
	return {}
}
