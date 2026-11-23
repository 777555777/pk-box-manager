import type { HandleServerError } from '@sveltejs/kit/hooks'

// SvelteKit global error handler for logging and custom error responses
export const handleError: HandleServerError = ({ kind, error, event }) => {
	// Since SvelteKit 3 this hook also receives expected errors (e.g. 404s for unknown paths).
	// Keep SvelteKit's default status and message for those, and only log unexpected errors.
	if (kind !== 'unknown') return

	// Log error details to the server console
	console.error('[SvelteKit Error]', {
		url: event.url.href,
		method: event.request.method,
		message: error instanceof Error ? error.message : String(error),
		stack: error instanceof Error ? error.stack : undefined
	})

	// Return a generic error message for the client
	return {
		message: 'An unexpected server error occurred.'
	}
}
