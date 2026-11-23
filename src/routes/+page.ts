import { startApp } from '$lib/state/app'

export const prerender = false
export const ssr = false

export async function load() {
	await startApp()
}
