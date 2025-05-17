import boxOrderNational from './order/order-national.json' with { type: 'json' }
import boxOrderNationalForms from './order/order-national-forms.json' with { type: 'json' }
import boxOrderNationalTest from './order/order-national-test.json' with { type: 'json' }
import orderTestSmall1 from './order/order-test-small-1.json' with { type: 'json' }
import orderTestSmall2 from './order/order-test-small-2.json' with { type: 'json' }
import BoxOrderBackgroundTest from './order/order-background-test.json' with { type: 'json' }

export interface BoxOrder {
	title: string
	pokemon: PokemonEntry[]
	wallpaper: string
}

export interface PokemonEntry {
	pokemonid: string
	formid: string | null
	id_national: number
}

const dexNames: Record<string, BoxOrder[]> = {
	'order-background-test.json': BoxOrderBackgroundTest,
	'order-national.json': boxOrderNational,
	'order-national-forms.json': boxOrderNationalForms,
	'order-national-test.json': boxOrderNationalTest,
	'order-test-small-1.json': orderTestSmall1,
	'order-test-small-2.json': orderTestSmall2
}

export function GET(request: Request) {
	const url = new URL(request.url)
	console.log('[SERVER] Request URL:', url.href)
	const dexName = url.searchParams.get('dexname')

	if (!dexName) {
		return new Response(JSON.stringify({ error: 'Missing file parameter' }), { status: 400 })
	}

	const selectedDex: BoxOrder[] = dexNames[dexName as keyof typeof dexNames]

	if (!selectedDex) {
		return new Response(JSON.stringify({ error: 'File not found' }), { status: 404 })
	}

	return new Response(JSON.stringify(selectedDex), {
		headers: { 'Content-Type': 'application/json' }
	})
}
