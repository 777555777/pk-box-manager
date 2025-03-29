import { pkStats, type PkStatsType } from './pk-stats.ts'

export function GET(request: Request) {
	const url = new URL(request.url)
	const identifier = url.searchParams.get('identifier')

	if (identifier && pkStats[identifier as PkStatsType]) {
		return new Response(JSON.stringify(pkStats[identifier as PkStatsType]), {
			headers: { 'Content-Type': 'application/json' }
		})
	}

	return new Response(JSON.stringify({ error: 'Pokémon not found' }), { status: 404 })
}
