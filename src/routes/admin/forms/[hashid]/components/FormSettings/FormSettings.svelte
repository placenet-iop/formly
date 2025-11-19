<script>
	export let formTitle = '';
	export let formDescription = '';
</script>

<div class="card">
	<h2>Form Settings</h2>
	<div class="form-group">
		<label for="title">Form Title *</label>
		<input type="text" id="title" name="title" bind:value={formTitle} required placeholder="e.g., Contact Form" />
	</div>
	<div class="form-group">
		<label for="description">Description</label>
		<textarea id="description" name="description" bind:value={formDescription} rows="3" placeholder="Optional description"></textarea>
	</div>
</div>

<style>
	@import '../shared.css';
</style>

