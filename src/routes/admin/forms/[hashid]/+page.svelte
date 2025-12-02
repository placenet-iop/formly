<script>
	import { onMount } from 'svelte';
	import { enhance } from '$app/forms';
	import { normalizeOptions } from './components/utils.js';
	import Alert from './components/Alert/Alert.svelte';
	import FieldSidebar from './components/FieldSidebar/FieldSidebar.svelte';
	import FormSettings from './components/FormSettings/FormSettings.svelte';
	import FieldEditor from './components/FieldEditor/FieldEditor.svelte';
	import EmptyState from './components/EmptyState/EmptyState.svelte';

	export let data;
	export let form;

	let formTitle = '';
	let formDescription = '';
	let fields = [];

	let message = '';
	let messageType = '';
	let dragIndex = null;
	let dragOverIndex = null;
	let paletteDragType = '';
	let isDraggingOver = false;

	onMount(() => {
		if (data) {
			formTitle = data.form.title || '';
			formDescription = data.form.description || '';
			const rawFields = data.form.fields || [];
			// Normalize options for backward compatibility
			fields = rawFields.map((field) => {
				if (field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') {
					return {
						...field,
						options: normalizeOptions(field.options),
						hasTag: field.hasTag || false
					};
				}
				return field;
			});
		}

		if (form) {
			if (form.message) {
				message = form.message;
				messageType = form.messageType;
			}
		}
	});

	$: {
		if (form) {
			if (form.message) {
				message = form.message;
				messageType = form.messageType;
			}
		}
	}

	function addField(type) {
		const newField = {
			id: Date.now().toString(),
			type,
			label: '',
			placeholder: '',
			required: false,
			hasTag: false,
			options: type === 'select' || type === 'radio' || type === 'checkbox' ? [{ value: 'Option 1', tag: '' }] : [],
			mediaType: type === 'media' ? 'upload' : undefined
		};
		fields = [...fields, newField];
	}

	function removeField(id) {
		fields = fields.filter((f) => f.id !== id);
	}

	function duplicateField(id) {
		const fieldIndex = fields.findIndex((f) => f.id === id);
		if (fieldIndex !== -1) {
			const originalField = fields[fieldIndex];
			const duplicatedField = {
				...originalField,
				id: Date.now().toString(),
				label: originalField.label ? `${originalField.label} (Copia)` : '',
				options: originalField.options ? JSON.parse(JSON.stringify(originalField.options)) : []
			};
			const newFields = [...fields];
			newFields.splice(fieldIndex + 1, 0, duplicatedField);
			fields = newFields;
		}
	}

	function moveFieldUp(index) {
		if (index > 0) {
			const newFields = [...fields];
			[newFields[index - 1], newFields[index]] = [newFields[index], newFields[index - 1]];
			fields = newFields;
		}
	}

	function moveFieldDown(index) {
		if (index < fields.length - 1) {
			const newFields = [...fields];
			[newFields[index], newFields[index + 1]] = [newFields[index + 1], newFields[index]];
			fields = newFields;
		}
	}

	function addOption(fieldId) {
		fields = fields.map((f) => {
			if (f.id === fieldId) {
				return { ...f, options: [...f.options, { value: `Option ${f.options.length + 1}`, tag: '' }] };
			}
			return f;
		});
	}

	function removeOption(fieldId, optionIndex) {
		fields = fields.map((f) => {
			if (f.id === fieldId) {
				return { ...f, options: f.options.filter((_, i) => i !== optionIndex) };
			}
			return f;
		});
	}

	function updateOption(fieldId, optionIndex, value) {
		fields = fields.map((f) => {
			if (f.id === fieldId) {
				const newOptions = [...f.options];
				newOptions[optionIndex] = { ...newOptions[optionIndex], value };
				return { ...f, options: newOptions };
			}
			return f;
		});
	}

	function updateOptionTag(fieldId, optionIndex, tag) {
		fields = fields.map((f) => {
			if (f.id === fieldId) {
				const newOptions = [...f.options];
				newOptions[optionIndex] = { ...newOptions[optionIndex], tag };
				return { ...f, options: newOptions };
			}
			return f;
		});
	}

	function handleDragStart(index) {
		dragIndex = index;
	}

	function handleDragOver(event, index) {
		event.preventDefault();
		event.stopPropagation();
		if (dragIndex !== null && dragIndex !== index) {
			dragOverIndex = index;
		} else if (paletteDragType) {
			dragOverIndex = index;
		}
	}

	function handleDrop(index, event) {
		event.preventDefault();
		event.stopPropagation();

		// Handle drop from palette (new field)
		if (paletteDragType) {
			const newField = {
				id: Date.now().toString(),
				type: paletteDragType,
				label: '',
				placeholder: '',
				required: false,
				hasTag: false,
				options: paletteDragType === 'select' || paletteDragType === 'radio' || paletteDragType === 'checkbox' ? [{ value: 'Option 1', tag: '' }] : [],
				mediaType: paletteDragType === 'media' ? 'upload' : undefined
			};
			const newFields = [...fields];
			newFields.splice(index, 0, newField);
			fields = newFields;
			paletteDragType = '';
			dragOverIndex = null;
			isDraggingOver = false;
			return;
		}

		// Handle reordering existing fields
		if (dragIndex === null || dragIndex === index) {
			dragIndex = null;
			dragOverIndex = null;
			return;
		}
		const newFields = [...fields];
		const [moved] = newFields.splice(dragIndex, 1);
		newFields.splice(index, 0, moved);
		fields = newFields;
		dragIndex = null;
		dragOverIndex = null;
	}

	function handleDragEnd() {
		dragIndex = null;
		dragOverIndex = null;
		paletteDragType = '';
	}

	function handleTypeDragStart(type, event) {
		paletteDragType = type;
		event.dataTransfer.setData('text/plain', type);
	}

	function handleFieldListDragOver(event) {
		if (event.dataTransfer?.types?.includes('text/plain')) {
			event.preventDefault();
			isDraggingOver = true;
		}
	}

	function handleFieldListDrop(event) {
		event.preventDefault();
		isDraggingOver = false;
		const type = event.dataTransfer?.getData('text/plain') || paletteDragType;
		if (type) {
			addField(type);
		}
		paletteDragType = '';
	}

	function handleDragLeave() {
		isDraggingOver = false;
	}
</script>

<svelte:head>
	<title>Edit Form - {formTitle}</title>
</svelte:head>

<div class="container">
	<a href="/.well-known/placenet/admin?token={data.token}" class="btn-back">
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<line x1="19" y1="12" x2="5" y2="12"></line>
			<polyline points="12 19 5 12 12 5"></polyline>
		</svg>
		Back to Forms
	</a>

	<div class="builder-layout">
		<FieldSidebar
			onAddField={addField}
			onTypeDragStart={handleTypeDragStart}
			{formTitle}
		/>

		<main class="editor">
			<form
				id="form-builder"
				method="POST"
				action="?/updateForm&token={data.token}"
				use:enhance={() => {
					message = '';
					messageType = '';
					return async ({ update }) => {
						await update({ reset: false });
					};
				}}
			>
				<FormSettings bind:formTitle bind:formDescription />

				<div class="card">
					<h2>Form Fields</h2>

					{#if fields.length === 0}
						<EmptyState
							{isDraggingOver}
							onDragOver={handleFieldListDragOver}
							onDrop={handleFieldListDrop}
							onDragLeave={handleDragLeave}
						/>
					{:else}
						<div class="fields-list">
							{#each fields as field, index (field.id)}
								<div class="field-wrapper">
									{#if dragIndex !== null || paletteDragType}
										<div
											class="drop-zone"
											class:active={dragOverIndex === index}
											ondragover={(event) => handleDragOver(event, index)}
											ondrop={(event) => handleDrop(index, event)}
										>
											<span class="drop-zone-text">⬇ Drop here</span>
										</div>
									{/if}
									<FieldEditor
										{field}
										{index}
										totalFields={fields.length}
										onMoveUp={moveFieldUp}
										onMoveDown={moveFieldDown}
										onRemove={removeField}
										onDuplicate={duplicateField}
										onUpdateOption={updateOption}
										onUpdateOptionTag={updateOptionTag}
										onRemoveOption={removeOption}
										onAddOption={addOption}
										onDragStart={handleDragStart}
										onDragOver={handleDragOver}
										onDrop={handleDrop}
										onDragEnd={handleDragEnd}
										isDragging={dragIndex === index}
										isDraggedOver={dragOverIndex === index}
									/>
								</div>
							{/each}
							{#if (dragIndex !== null || paletteDragType) && fields.length > 0}
								<div
									class="drop-zone"
									class:active={dragOverIndex === fields.length}
									ondragover={(event) => handleDragOver(event, fields.length)}
									ondrop={(event) => handleDrop(fields.length, event)}
								>
									<span class="drop-zone-text">⬇ Drop at end</span>
								</div>
							{/if}
						</div>
					{/if}

					<input type="hidden" name="fields" value={JSON.stringify(fields)} />
				</div>
			</form>
		</main>
	</div>
</div>

{#if message}
	<div class="toast {messageType}">
		<svg class="toast-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			{#if messageType === 'success'}
				<polyline points="4 12 9 17 20 6"></polyline>
			{:else}
				<circle cx="12" cy="12" r="10"></circle>
				<line x1="12" y1="8" x2="12" y2="12"></line>
				<line x1="12" y1="16" x2="12.01" y2="16"></line>
			{/if}
		</svg>
		<span>{message}</span>
	</div>
{/if}

<style>
	@import './components/shared.css';

	.container {
		padding: 1.5rem 1.25rem;
		min-height: 100vh;
	}

	.builder-layout {
		display: flex;
		max-width: 100%;
		gap: 1.5rem;
	}

	.editor {
		flex: 1;
		max-width: calc(100% - 320px);
		padding-top: 3rem;
	}

	.fields-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		transition: all 0.2s ease;
	}

	.fields-list.drop-target {
		background: #eff6ff;
		border-radius: 10px;
		padding: 0.5rem;
	}

	.field-wrapper {
		display: flex;
		flex-direction: column;
	}

	.drop-zone {
		padding: 0.75rem;
		border: 2px dashed #cbd5e0;
		border-radius: 8px;
		background: #f8fafc;
		text-align: center;
		opacity: 0.6;
		transition: all 0.2s ease;
		margin: 0.25rem 0;
	}

	.drop-zone.active {
		border-color: #3b82f6;
		background: #eff6ff;
		opacity: 1;
		border-style: solid;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.drop-zone-text {
		font-size: 0.875rem;
		color: #64748b;
		font-weight: 500;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
	}

	.btn-back {
		position: fixed;
		top: 1.5rem;
		left: 1.5rem;
		z-index: 50;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.65rem 1rem;
		background: white;
		border: 1px solid #e2e8f0;
		border-radius: 8px;
		color: #334155;
		text-decoration: none;
		font-size: 0.9375rem;
		font-weight: 500;
		box-shadow: 0 2px 8px rgba(15, 23, 42, 0.1);
		transition: all 0.2s ease;
		backdrop-filter: blur(8px);
	}

	.btn-back:hover {
		background: #f8fafc;
		border-color: #cbd5e0;
		transform: translateX(-2px);
		box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);
	}

	.btn-back svg {
		flex-shrink: 0;
	}

	.toast {
		position: fixed;
		right: 1.25rem;
		top: 1.25rem;
		background: white;
		border: 1px solid #e2e8f0;
		border-left: 4px solid #2563eb;
		box-shadow: 0 14px 40px rgba(15, 23, 42, 0.18);
		padding: 0.9rem 1rem;
		border-radius: 12px;
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		z-index: 20;
		min-width: 260px;
		animation: slideIn 0.3s ease-out;
	}

	@keyframes slideIn {
		from {
			transform: translateX(100%);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}

	.toast.success {
		border-left-color: #22c55e;
	}

	.toast.error {
		border-left-color: #ef4444;
	}

	.toast .toast-icon {
		color: inherit;
	}

	@media (max-width: 968px) {
		.builder-layout {
			flex-direction: column;
		}

		.editor {
			max-width: 100%;
			padding-top: 4rem;
		}

		.btn-back {
			top: 1rem;
			left: 1rem;
			font-size: 0.875rem;
			padding: 0.5rem 0.75rem;
		}
	}
</style>
