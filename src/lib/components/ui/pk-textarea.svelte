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

<div class="pk-comment">
	<label for={id}>{label}</label>
	<textarea
		{id}
		class="pk-textarea"
		maxlength="196"
		bind:value
		oninput={() => debounce()}
		{disabled}
	></textarea>
</div>

<style>
	textarea {
		min-height: 118px;
	}

	.pk-comment {
		display: flex;
		flex-direction: column;
		width: 100%;
	}

	label {
		margin-bottom: 0.375rem;
	}
</style>
