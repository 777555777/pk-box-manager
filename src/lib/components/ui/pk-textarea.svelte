<script lang="ts">
	let {
		label = '',
		onUpdate = () => {},
		value = '',
		disabled = false,
		id = crypto.randomUUID(),
		debounceTime = 750
	} = $props()
	let timer: number | undefined = undefined

	function debounce() {
		clearTimeout(timer)
		timer = setTimeout(() => {
			onUpdate(value)
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
		min-height: 96px;
		max-width: 400px;
	}
</style>
