import { type PokemonEntry } from '$lib/models/data-models'

type selectedPokemonState = {
	entry: PokemonEntry
	// caught: boolean
}

export const selectedPokemon: selectedPokemonState = $state({
	entry: { pokemonid: 'null', formid: null, id_national: 0 }
	// caught: false
})
