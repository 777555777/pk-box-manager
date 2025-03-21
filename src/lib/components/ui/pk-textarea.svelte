<script lang="ts">
	let {
		label = '',
		disabled = false,
		id = crypto.randomUUID(),
		value = '',
		onInput = () => {},
		debounceTime = 750
	} = $props()
	let timer: number | undefined = undefined

	function debounce() {
		clearTimeout(timer)
		timer = setTimeout(() => {
			onInput(value)
			clearTimeout(timer)
		}, debounceTime)
	}

	$effect(() => {
		return () => {
			clearInterval(timer)
		}
	})
</script>

<label for={id}>{label}</label>
<textarea {id} bind:value oninput={() => debounce()} {disabled}></textarea>

<style>
	textarea {
		min-height: 196px;
		max-width: 400px;
	}
</style>
