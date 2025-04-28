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
<textarea class="pk-textarea" maxlength="196" bind:value oninput={() => debounce()} {disabled}
></textarea>

<style>
	textarea {
		min-height: 118px;
		max-width: 336px;
	}

	label {
		margin-bottom: 0.375rem;
	}
</style>
