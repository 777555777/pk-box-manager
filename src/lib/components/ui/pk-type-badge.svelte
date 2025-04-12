<script lang="ts">
	let { type } = $props()
</script>

<div class="badge {type.toLowerCase()}"><span>{type}</span></div>

<style>
	.badge {
		/* Derive highlight and shadow color from base */
		--badge-color-shadow: hsl(from var(--badge-color) h s 30);
		--badge-color-highlight: hsl(from var(--badge-color) h calc(s * 1.5) min(l * 1.4, 90));

		background-color: var(--badge-color);
		width: fit-content;
		width: calc(580px / 10);
		height: calc(228px / 10);

		color: #f8f8f8;
		text-align: center;
		text-shadow: 1px 1px 0px #807870;

		margin: 4px 2px; /* Fix element sizing with box-shadow */
		box-shadow:
			0px 2px var(--badge-color),
			0px -2px var(--badge-color),
			2px 0px var(--badge-color),
			-2px 0px var(--badge-color),
			0px 4px var(--badge-color-shadow),
			2px 2px var(--badge-color-shadow),
			-2px 2px var(--badge-color-shadow),
			2px -2px var(--badge-color-highlight),
			-2px -2px var(--badge-color-highlight),
			0px -4px var(--badge-color-highlight);
	}

	.normal {
		--badge-color: #aeae7d;
	}
	.fire {
		--badge-color: #f75534;
	}
	.water {
		--badge-color: #6d96f7;
	}
	.electric {
		--badge-color: #ffd734;
	}
	.grass {
		--badge-color: #7dcf55;
	}
	.ice {
		--badge-color: #9edfdf;
	}
	.fighting {
		--badge-color: #96342c;
	}
	.poison {
		--badge-color: #a040a0;
	}
	.ground {
		--badge-color: #e7c76d;
	}
	.flying {
		--badge-color: #ae96f7;
	}
	.psychic {
		--badge-color: #ff5d8e;
	}
	.bug {
		--badge-color: #aebe24;
	}
	.rock {
		--badge-color: #bea63c;
	}
	.ghost {
		--badge-color: #755d9e;
	}
	.dragon {
		--badge-color: #753cff;
	}
	.dark {
		--badge-color: #755d4d;
	}
	.steel {
		--badge-color: #bebed7;
	}
	.fairy {
		--badge-color: #ee99ac;
	}
</style>
