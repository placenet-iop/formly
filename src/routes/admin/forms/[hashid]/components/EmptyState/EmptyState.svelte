<script>
	export let isDraggingOver = false;
	export let onDragOver;
	export let onDrop;
	export let onDragLeave;
</script>

<div
	class="empty-state"
	class:drop-active={isDraggingOver}
	ondragover={onDragOver}
	ondrop={onDrop}
	ondragleave={onDragLeave}
>
	<svg class="empty-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
		<polyline points="7 10 12 15 17 10"></polyline>
		<line x1="12" y1="15" x2="12" y2="3"></line>
	</svg>
	<p>No fields added yet</p>
	<p class="empty-hint">Drag and drop fields here or click Add Fields</p>
</div>

<style>
	@import './EmptyState.css';
</style>

