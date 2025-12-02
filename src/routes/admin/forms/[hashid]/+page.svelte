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
			options: type === 'select' || type === 'radio' || type === 'checkbox' ? [{ value: 'Option 1', tag: '' }] : []
		};
		fields = [...fields, newField];
	}

	function removeField(id) {
		fields = fields.filter((f) => f.id !== id);
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
		if (dragOverIndex !== index) {
			dragOverIndex = index;
		}
	}

	function handleDrop(index, event) {
		event?.stopPropagation();
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
	<header>
		<div class="header-content">
			<div class="header-left">
				<a href="/.well-known/placenet/admin?token={data.token}" class="btn btn-secondary">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<line x1="19" y1="12" x2="5" y2="12"></line>
						<polyline points="12 19 5 12 12 5"></polyline>
					</svg>
					Back to Forms
				</a>
				<h1>Form Builder</h1>
			</div>
			<button type="submit" form="form-builder" class="btn btn-primary">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
					<polyline points="17 21 17 13 7 13 7 21"></polyline>
					<polyline points="7 3 7 8 15 8"></polyline>
				</svg>
				Save Form
			</button>
		</div>
	</header>

	<Alert {message} {messageType} />

	<div class="builder-layout">
		<FieldSidebar onAddField={addField} onTypeDragStart={handleTypeDragStart} />

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
						<div
							class="fields-list"
							class:drop-target={isDraggingOver}
							ondragover={handleFieldListDragOver}
							ondrop={handleFieldListDrop}
							ondragleave={handleDragLeave}
						>
							{#each fields as field, index (field.id)}
								<FieldEditor
									{field}
									{index}
									totalFields={fields.length}
									onMoveUp={moveFieldUp}
									onMoveDown={moveFieldDown}
									onRemove={removeField}
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
							{/each}
						</div>
					{/if}

					<input type="hidden" name="fields" value={JSON.stringify(fields)} />
				</div>
			</form>
		</main>
	</div>
</div>

<style>
	@import './components/shared.css';

	header {
		margin-bottom: 2rem;
		position: sticky;
		top: 0;
		background: linear-gradient(180deg, #f7f9fb, rgba(247, 249, 251, 0.95));
		z-index: 100;
		padding: 1rem 0;
		margin-top: -1rem;
		backdrop-filter: blur(8px);
	}

	.header-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
	}

	.header-left {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.header-left h1 {
		margin: 0;
	}

	.builder-layout {
		display: grid;
		grid-template-columns: 260px 1fr;
		gap: 2rem;
	}

	.editor {
		flex: 1;
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


	@media (max-width: 968px) {
		.builder-layout {
			grid-template-columns: 1fr;
		}
	}
</style>
