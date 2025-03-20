<script lang="ts">
	import { appState } from '../../state/app-state.svelte'

	let localComment = $state(appState.getAppDefaults().comment)

	function saveComment() {
		appState.setAppDefaults({ comment: localComment })
	}
</script>

<label for="comment">Comment</label>
<textarea name="comment" id="comment" bind:value={localComment}></textarea>

<div class="button-group">
	<button type="button" onclick={saveComment}> Save comment </button>
</div>
