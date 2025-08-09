import { pkStats, type PkStatsType } from './pk-stats.ts'

export function GET(request: Request) {
	const url = new URL(request.url)
	const identifier = url.searchParams.get('identifier')
	const all = url.searchParams.get('all')

	// Wenn 'all' Parameter gesetzt ist, gib alle Pokémon-Daten zurück
	if (all === 'true') {
		return new Response(JSON.stringify(pkStats), {
			headers: {
				'Content-Type': 'application/json'
				// 'Cache-Control': 'public, max-age=86400'
			}
		})
	}

	// Einzelne Pokémon-Abfrage (bestehende Funktionalität)
	if (identifier && pkStats[identifier as PkStatsType]) {
		return new Response(JSON.stringify(pkStats[identifier as PkStatsType]), {
			headers: { 'Content-Type': 'application/json' }
		})
	}

	return new Response(JSON.stringify({ error: 'Pokémon not found' }), { status: 404 })
}
