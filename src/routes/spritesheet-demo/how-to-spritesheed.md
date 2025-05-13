The common approach to using sprite sheets involves applying CSS classes with pre-calculated coordinates to control the positioning within the sheet. This typically relies on `background-image`, which does not natively support features like alt text or lazy loading that come built-in with `<img>` elements. Additionally, using `<img>` can improve accessibility and semantics depending on how the image is used.

This approach builds upon an article on [css-tricks](https://css-tricks.com/spriting-img/), and expands it by introducing scaling of the individual sprites.

> [Skip to Codepen Demo](#plain-html-css-js-demo)

`object-fit: none` and `object-position: x y` allow us to select specific areas of an image which is the basis of this idea. The object-position values need to be pre-calculated, just like in the class-based approach. This could be stored as an object literal in a `.ts` file which would also generate typing for this object by using `keyof` and `typeof`.

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
	'0003-venusaur': {
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
	<div class="container">
		<img
			src={`/spritesheets/${data.sheet}.webp`}
			style={setObjectPosition(data.pos)}
			alt={name}
			loading="lazy"
		/>
	</div>
{/each}
```

```css
.container img {
	width: calc(var(--original-width) * 1px); /* 96 * 1px */
	height: calc(var(--original-height) * 1px); /* 96 * 1px */

	object-fit: none;
	/* object-position: x y; is directly set on the <img> element */
}
```

This will render a page with each element in the pre-calculated values Object as a separate image, cut out from the sprite sheet.

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/r7uk0boc2oaaex6tpwbo.png)

In order to change the size of these elements while maintaining the correct container size, we need to know the original size of the original single image before it was added to the sprite sheet. In this example it is 96px \* 96px.

If we now want to display a smaller 64px \* 64px version of this, we can use `transform: scale()`. It is important here to also use `transform-origin: top left`, as it would otherwise scale the image towards the center, leaving unwanted spacing around the image.

```css
.container img {
	width: calc(var(--original-width) * 1px);
	height: calc(var(--original-height) * 1px);

	object-fit: none;
	/* object-position: x y; is directly set on the <img> element */

	transform: scaleX(var(--scale-factor-x)) scaleY(var(--scale-factor-y));
	transform-origin: top left;
}
```

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/chzyd1z639kdsv9pl60d.png)

This has made the images visually smaller, but the container size is still like before, to fix this we can set `width` and `height` on the parent element.

```css
.container {
	max-width: calc(var(--target-width) * 1px);
	max-height: calc(var(--target-height) * 1px);
}
```

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/84iirszzsnispd8552qk.png)

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

## Plain HTML, CSS, JS Demo

{% codepen https://codepen.io/Stampf/pen/yyyQYZm %}

## Conclusion

Benefits:

- Using sprite sheets reduces the number of HTTP requests and can therefore improve performance, particularly in HTTP/1.1 environments where request overhead is more significant.
- Sprite sheets also eliminate the "pop-in" effect of individual images, as all images are available immediately after a single request.

Downsides:

- Generating the sprite sheets and maintaining a synchronized coordinate data structure adds an extra step to the build process.
- **Handling sprite sheets introduces significantly more code complexity compared to using regular images.**
- Sprite sheets are generally less flexible than standalone images.

Alternatives:

- Depending on the style and use case, an icon font can offer a simpler and more reliable way to reduce requests.
- HTTP/2 and HTTP/3 multiplexing, combined with good caching strategies, can help mitigate the performance impact of serving many individual images.
- If sprite sheets are necessary, the traditional CSS class-based approach remains a valid and often simpler alternative.
