import boxOrderNational from './order/order-national.json' with { type: 'json' }
import boxOrderNationalForms from './order/order-national-forms.json' with { type: 'json' }

export interface ServerBoxOrder {
	title: string
	pokemon: PokemonEntry[]
}

export interface PokemonEntry {
	pokemonid: string
	formid: string | null
	id_national: number
}

const dexNames: Record<string, ServerBoxOrder[]> = {
	'order-national.json': boxOrderNational,
	'order-national-forms.json': boxOrderNationalForms
}

export function GET(request: Request) {
	const url = new URL(request.url)
	// Formated german time with date: 22.05.2025, 00:22:03
	const currentTime = new Date().toLocaleString('de-DE', {
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		year: 'numeric',
		month: '2-digit',
		day: '2-digit'
	})
	console.log(`[SERVER] ${currentTime} Request URL:`, url.href)
	const dexName = url.searchParams.get('dexname')

	if (!dexName) {
		return new Response(JSON.stringify({ error: 'Missing file parameter' }), { status: 400 })
	}

	const selectedDex: ServerBoxOrder[] = dexNames[dexName as keyof typeof dexNames]

	if (!selectedDex) {
		return new Response(JSON.stringify({ error: 'File not found' }), { status: 404 })
	}

	return new Response(JSON.stringify(selectedDex), {
		headers: { 'Content-Type': 'application/json' }
	})
}
