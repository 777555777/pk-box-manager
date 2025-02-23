<form>
	<div class="pk-region">
		<label for="ice-cream-choice">Caught in</label>
		<input list="ice-cream-flavors" id="ice-cream-choice" name="ice-cream-choice" />

		<datalist id="ice-cream-flavors">
			<option value="Chocolate"></option>
			<option value="Coconut"></option>
			<option value="Mint"></option>
			<option value="Strawberry"></option>
			<option value="Vanilla"></option>
		</datalist>

		<!-- The Gen will later be derived from the input data -->
		<span class="pk-gen">Gen 3</span>
	</div>

	<label for="ability">Ability</label><br />
	<input type="text" id="ability" name="ability" />

	<label for="comment">Comment</label>
	<textarea name="comment" id="comment"></textarea>
</form>

<style>
	form {
		display: flex;
		justify-content: flex-start;
		flex-direction: column;
	}
	.pk-region {
		display: flex;
		justify-content: space-between;
	}
	textarea {
		min-height: 196px;
	}
</style>
