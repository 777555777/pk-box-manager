<script lang="ts">
	let { max, value } = $props()
</script>

<progress class="pk-progress" {max} {value}></progress>

<style>
	:root {
		--value-color: #61ff61;
		--value-secondary-color: #18c720;
	}

	.pk-progress {
		opacity: 0.8;
		width: 100%;
		height: 0.5rem;
		appearance: none;
		background-color: #383842;
		border: 2px solid #383842;
		border-radius: 0;
		border: none;
		box-shadow:
			0 -2px 0 #5d5d6f,
			0 2px 0 #5d5d6f;
	}

	.pk-progress::-webkit-progress-bar {
		background-color: #383842;
		border-radius: 0;
	}

	.pk-progress::-moz-progress-bar,
	.pk-progress::-webkit-progress-value {
		border-top: 2px solid var(--value-secondary-color);
		border-bottom: 2px solid var(--value-secondary-color);
		background-color: var(--value-color);
		border-radius: 0;
	}
</style>
