import pkStats from './pk-stats.json' with { type: 'json' }

// import { pkStats, type PkStatsType } from './pk-stats.ts'

export function GET(request: Request) {
	const url = new URL(request.url)
	const all = url.searchParams.get('all')

	// Wenn 'all' Parameter gesetzt ist, gib alle Pokémon-Daten zurück
	if (all === 'true') {
		return new Response(JSON.stringify(pkStats), {
			headers: {
				'Content-Type': 'application/json'
			}
		})
	}

	return new Response(JSON.stringify({ error: 'Pokémon not found' }), { status: 404 })
}
