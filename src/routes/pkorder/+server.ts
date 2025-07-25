import boxOrderNational from './order/national-dex.json' with { type: 'json' }
import boxOrderNationalForms from './order/national-dex-forms.json' with { type: 'json' }
import boxOrderGeneration1 from './order/generation-1.json' with { type: 'json' }
import boxOrderGeneration1Forms from './order/generation-1-forms.json' with { type: 'json' }
import boxOrderGeneration2 from './order/generation-2.json' with { type: 'json' }
import boxOrderGeneration2Forms from './order/generation-2-forms.json' with { type: 'json' }
import boxOrderGeneration3 from './order/generation-3.json' with { type: 'json' }
import boxOrderGeneration3Forms from './order/generation-3-forms.json' with { type: 'json' }
import boxOrderGeneration4 from './order/generation-4.json' with { type: 'json' }
import boxOrderGeneration4Forms from './order/generation-4-forms.json' with { type: 'json' }
import boxOrderGeneration5 from './order/generation-5.json' with { type: 'json' }
import boxOrderGeneration5Forms from './order/generation-5-forms.json' with { type: 'json' }
import boxOrderGeneration6 from './order/generation-6.json' with { type: 'json' }
import boxOrderGeneration6Forms from './order/generation-6-forms.json' with { type: 'json' }

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
	'national-dex.json': boxOrderNational,
	'national-dex-forms.json': boxOrderNationalForms,
	'generation-1.json': boxOrderGeneration1,
	'generation-1-forms.json': boxOrderGeneration1Forms,
	'generation-2.json': boxOrderGeneration2,
	'generation-2-forms.json': boxOrderGeneration2Forms,
	'generation-3.json': boxOrderGeneration3,
	'generation-3-forms.json': boxOrderGeneration3Forms,
	'generation-4.json': boxOrderGeneration4,
	'generation-4-forms.json': boxOrderGeneration4Forms,
	'generation-5.json': boxOrderGeneration5,
	'generation-5-forms.json': boxOrderGeneration5Forms,
	'generation-6.json': boxOrderGeneration6,
	'generation-6-forms.json': boxOrderGeneration6Forms
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
