# Spritesheets using `object-fit` and `<img>`

## Goal

The common approach to using spritesheets involves applying CSS classes with pre-calculated coordinates to control the positioning within the sheet. This typically relies on `background-image`, which does not natively support features like alt text or lazy loading that come built-in with `<img>` elements. Additionally, using `<img>` can improve semantic meaning depending on the context of the image.

The whole idea is based on an article on css-tricks: https://css-tricks.com/spriting-img/

## Applying the Idea

`object-fit: none;` and `object-position: x y;` allow us to select specific areas of an image which is the basis of this idea. The object-position values need to be pre-calculated, just like in the class-based approach. This could be stored as an object literla in a `.ts` file which would also generate typing for this object by using `keyof` and `typeof`.

```ts
// Automatically generated file!
export const Pokemon = {
	'0001-bulbasaur': {
		sheet: 'sp1',
		pos: { x: 0, y: 0 }
	},
	'0002-ivysaur': {
		sheet: 'sp1',
		pos: { x: -96, y: 0 }
	},
	'0003-venesaur': {
		sheet: 'sp1',
		pos: { x: -192, y: 0 }
	} // ...
} as const

export type PokemonType = keyof typeof Pokemon
```

To dynamically set the `object-position` on the `<img>` element, a helper function can be used:

```ts
export function setObjectPosition(pos: { x: number; y: number }) {
	return `object-position: ${pos.x}px ${pos.y}px;`
}
```

```svelte
<!-- Svelte code -->
{#each Object.entries(Pokemon) as [name, data]}
	<button>
		<img src={`/spritesheets/${data.sheet}.webp`} style={setObjectPosition(data.pos)} alt={name} />
	</button>
{/each}
```

This will render a page with each element in the pre-calculated values as a separate image, cut out from the sprite sheet.

In order to change the size of this element while maintaining the correct size, we need to know the original size of the original single image before it was added to the sprite sheet. In this example it is 96px \* 96px.

```css
img {
	width: calc(var(--original-width) * 1px);
	height: calc(var(--original-height) * 1px);

	object-fit: none;
	/* object-position: x y; is directly set on the <img> element */
}
```

If we now want to display a smaller 64px \* 64px version of this, we can use `transform: scale();`. It is important here to also use `transform-origin: top left;`, as it would otherwiese scale the image towards the center, leaving white space on all sides.

```css
img {
	width: calc(var(--original-width) * 1px);
	height: calc(var(--original-height) * 1px);

	object-fit: none;
	/* object-position: x y; is directly set on the <img> element */

	transform: scaleX(var(--scale-factor-x)) scaleY(var(--scale-factor-y));
	transform-origin: top left;
}
```

This has made the image visually smaller, but the container is still larger, to fix this we can set `width` and `height` on the parent element.

```css
div {
	max-width: calc(var(--target-width) * 1px);
	max-height: calc(var(--target-height) * 1px);
}
```

To use variables for `width`, `height` and `scale`, they must be defined without a unit, because `scale` needs a unitless value, while `width` and `height` need a length value, which can be created by multiplying by 1 length unit e.g. \*1 px.

```css
:root {
	--target-width: 64;
	--target-height: 64;
	--original-width: 96;
	--original-height: 96;
	--scale-factor-x: calc(var(--target-width) / var(--original-width));
	--scale-factor-y: calc(var(--target-height) / var(--original-height));
}
```

## Links

Plain HTML, CSS, JS Codepen demo of this: [Codepen](https://codepen.io/Stampf/pen/yyyQYZm)
