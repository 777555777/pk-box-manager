<article class="pk-box">
	<header class="box-header">
		<h2>Kanto-1</h2>
	</header>
	<div class="box-grid">
		<div class="pk-slot"></div>
		<div class="pk-slot"></div>
		<!-- weitere slots -->
	</div>
</article>

<style>
	.pk-box {
		display: grid;
		grid-template-rows: auto 1fr;
		justify-items: center;
		gap: 0.75rem;
	}
	.box-header {
		width: 258px;
		height: 52px;

		text-align: center;
		line-height: 24px; /* Same as Font-size */

		/* concept placeholder */
		background-color: hsl(290, 100%, 90%);
		border: 2px solid hsl(280, 70%, 50%);
		border-radius: 10px;
		padding: 10px;
	}
	.box-grid {
		display: grid;
		grid-template-columns: repeat(6, 1fr);
		grid-template-rows: repeat(5, 1fr);
		gap: 2px;

		width: 360px;
		height: 272px;

		/* concept placeholder */
		background-color: hsl(10, 100%, 90%);
		border: 2px solid hsl(0, 70%, 50%);
		border-radius: 10px;
		padding: 10px;
	}

	.pk-slot {
		width: 48px;
		height: 48px;

		/* concept placeholder */
		background-color: hsl(60, 100%, 90%);
		border: 2px solid hsl(50, 70%, 50%);
		border-radius: 5px;
		cursor: pointer;
	}
</style>
