<script>
	import { fieldTypes, getIcon } from '../utils.js';
	import OptionEditor from '../OptionEditor/OptionEditor.svelte';

	export let field;
	export let index = 0;
	export let totalFields = 0;
	export let onMoveUp;
	export let onMoveDown;
	export let onRemove;
	export let onDuplicate;
	export let onUpdateOption;
	export let onUpdateOptionTag;
	export let onRemoveOption;
	export let onAddOption;
	export let onDragStart;
	export let onDragOver;
	export let onDrop;
	export let onDragEnd;
	export let isDragging = false;
	export let isDraggedOver = false;

	function handleRemove() {
		if (confirm(`¿Eliminar el campo "${field.label || 'Sin título'}"?`)) {
			onRemove(field.id);
		}
	}

	function handleDuplicate() {
		onDuplicate(field.id);
	}
</script>

<div
	class="field-editor"
	class:dragging={isDragging}
	class:drag-over={isDraggedOver}
	draggable="true"
	ondragstart={() => onDragStart(index)}
	ondragover={(event) => onDragOver(event, index)}
	ondrop={(event) => onDrop(index, event)}
	ondragend={onDragEnd}
>
	<div class="field-header">
		<span class="field-type-badge">
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				{@html getIcon(fieldTypes.find((ft) => ft.value === field.type)?.icon || 'type')}
			</svg>
			{fieldTypes.find((ft) => ft.value === field.type)?.label}
		</span>
		<div class="field-controls">
			<button type="button" class="btn-icon" onclick={() => onMoveUp(index)} disabled={index === 0} title="Mover arriba">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<polyline points="18 15 12 9 6 15"></polyline>
				</svg>
			</button>
			<button type="button" class="btn-icon" onclick={() => onMoveDown(index)} disabled={index === totalFields - 1} title="Mover abajo">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<polyline points="6 9 12 15 18 9"></polyline>
				</svg>
			</button>
			<button type="button" class="btn-icon" onclick={handleDuplicate} title="Duplicar campo">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
					<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
				</svg>
			</button>
			<button type="button" class="btn-icon btn-icon-danger" onclick={handleRemove} title="Eliminar campo">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<polyline points="3 6 5 6 21 6"></polyline>
					<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
				</svg>
			</button>
		</div>
	</div>

	<div class="field-body">
		{#if field.type === 'title'}
			<div class="form-group">
				<label for="label-{field.id}">Title Text *</label>
				<input type="text" id="label-{field.id}" bind:value={field.label} required placeholder="Enter title text to display" />
			</div>
		{:else if field.type === 'description'}
			<div class="form-group">
				<label for="label-{field.id}">Description Text *</label>
				<textarea id="label-{field.id}" bind:value={field.label} required placeholder="Enter description text to display" rows="3"></textarea>
			</div>
		{:else}
			<div class="form-row">
				<div class="form-group flex-1">
					<label for="label-{field.id}">Label *</label>
					<input type="text" id="label-{field.id}" bind:value={field.label} required placeholder="Field label" />
				</div>
				<div class="checkbox-column">
					<div class="form-group checkbox-group checkbox-item">
						<label for="required-{field.id}">
							<input type="checkbox" id="required-{field.id}" bind:checked={field.required} />
							Required
						</label>
					</div>
					{#if field.type === 'select' || field.type === 'radio' || field.type === 'checkbox'}
						<div class="form-group checkbox-group checkbox-item">
							<label for="hasTag-{field.id}">
								<input type="checkbox" id="hasTag-{field.id}" bind:checked={field.hasTag} />
								Add tag
							</label>
						</div>
					{/if}
				</div>
			</div>
		{/if}

		{#if field.type === 'textarea'}
			<div class="form-group">
				<label for="placeholder-{field.id}">Placeholder</label>
				<input type="text" id="placeholder-{field.id}" bind:value={field.placeholder} placeholder="Texto de ejemplo para el usuario..." />
			</div>
		{/if}

		{#if field.type === 'media'}
			<div class="form-group">
				<label>Media Type</label>
				<div class="media-options">
					<label class="radio-inline">
						<input type="radio" bind:group={field.mediaType} value="upload" />
						Upload File
					</label>
					<label class="radio-inline">
						<input type="radio" bind:group={field.mediaType} value="embed" />
						Embed URL
					</label>
				</div>
			</div>
			{#if field.mediaType === 'embed'}
				<div class="form-group">
					<label for="placeholder-{field.id}">Placeholder URL</label>
					<input type="text" id="placeholder-{field.id}" bind:value={field.placeholder} placeholder="https://youtube.com/..." />
				</div>
			{/if}
		{/if}

		{#if field.type === 'select' || field.type === 'radio' || field.type === 'checkbox'}
			<OptionEditor
				{field}
				{onUpdateOption}
				{onUpdateOptionTag}
				{onRemoveOption}
				{onAddOption}
			/>
		{/if}
	</div>
</div>

<style>
	@import './FieldEditor.css';
</style>

