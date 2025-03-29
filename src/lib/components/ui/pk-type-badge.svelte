<script lang="ts">
	let { type } = $props()
</script>

<div class="badge {type.toLowerCase()}"><span>{type}</span></div>

<style>
	.badge {
		background-color: var(--badge-color);
		padding: 0 4px;
		width: fit-content;
		width: calc(580px / 10);
		height: calc(228px / 10);

		color: #f8f8f8;
		text-align: center;
		text-shadow: 1px 1px 0px #807870;

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
		--badge-color-highlight: #dfdfc7;
		--badge-color-shadow: #755d4d;
	}
	.fire {
		--badge-color: #f75534;
		--badge-color-highlight: #ffd734;
		--badge-color-shadow: #96342c;
	}
	.water {
		--badge-color: #6d96f7;
		--badge-color-highlight: #9edfdf;
		--badge-color-shadow: #867d75;
	}
	.electric {
		--badge-color: #ffd734;
		--badge-color-highlight: #ffff7d;
		--badge-color-shadow: #bea63c;
	}
	.grass {
		--badge-color: #7dcf55;
		--badge-color-highlight: #c7ff65;
		--badge-color-shadow: #5d8645;
	}
	.ice {
		--badge-color: #9edfdf;
		--badge-color-highlight: #d7ffef;
		--badge-color-shadow: #9696a6;
	}
	.fighting {
		--badge-color: #96342c;
		--badge-color-highlight: #f75534;
		--badge-color-shadow: #4d453c;
	}
	.poison {
		--badge-color: #a040a0;
		--badge-color-highlight: #c7bff8;
		--badge-color-shadow: #705798;
	}
	.ground {
		--badge-color: #e7c76d;
		--badge-color-highlight: #ffff7d;
		--badge-color-shadow: #8e6d34;
	}
	.flying {
		--badge-color: #ae96f7;
		--badge-color-highlight: #c7bff8;
		--badge-color-shadow: #755d9e;
	}
	.psychic {
		--badge-color: #ff5d8e;
		--badge-color-highlight: #ffc7b6;
		--badge-color-shadow: #966565;
	}
	.bug {
		--badge-color: #aebe24;
		--badge-color-highlight: #dfe734;
		--badge-color-shadow: #7d9614;
	}
	.rock {
		--badge-color: #bea63c;
		--badge-color-highlight: #e7c76d;
		--badge-color-shadow: #8e6d34;
	}
	.ghost {
		--badge-color: #755d9e;
		--badge-color-highlight: #ae96f7;
		--badge-color-shadow: #4d3c55;
	}
	.dragon {
		--badge-color: #753cff;
		--badge-color-highlight: #bea6ff;
		--badge-color-shadow: #4d3c96;
	}
	.dark {
		--badge-color: #755d4d;
		--badge-color-highlight: #aeae7d;
		--badge-color-shadow: #4d453c;
	}
	.steel {
		--badge-color: #bebed7;
		--badge-color-highlight: #dfdfc7;
		--badge-color-shadow: #867d75;
	}
	.fairy {
		--badge-color: #ee99ac;
		--badge-color-highlight: #fcc4d0;
		--badge-color-shadow: #97636e;
	}
</style>
