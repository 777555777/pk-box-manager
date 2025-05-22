// SvelteKit global error handler for logging and custom error responses
import type { HandleServerError } from '@sveltejs/kit'

export const handleError: HandleServerError = ({ error, event }) => {
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
