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
</script>

<svelte:head>
	<title>Edit Form - {formTitle}</title>
</svelte:head>

<div class="container">
	<header>
		<div class="header-content">
			<div>
				<h1>Form Builder</h1>
				<p class="subtitle">Design your form</p>
			</div>
			<a href="/.well-known/placenet/admin?token={data.token}" class="btn btn-secondary">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<line x1="19" y1="12" x2="5" y2="12"></line>
					<polyline points="12 19 5 12 12 5"></polyline>
				</svg>
				Back to Forms
			</a>
		</div>
	</header>

	<Alert {message} {messageType} />

	<div class="builder-layout">
		<FieldSidebar onAddField={addField} />

		<main class="editor">
			<form
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
						<EmptyState />
					{:else}
						<div class="fields-list">
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
								/>
							{/each}
						</div>
					{/if}

					<input type="hidden" name="fields" value={JSON.stringify(fields)} />
				</div>

				<div class="save-section">
					<button type="submit" class="btn btn-primary btn-lg">
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
							<polyline points="17 21 17 13 7 13 7 21"></polyline>
							<polyline points="7 3 7 8 15 8"></polyline>
						</svg>
						Save Form
					</button>
				</div>
			</form>
		</main>
	</div>
</div>

<style>
	@import './components/shared.css';

	header {
		margin-bottom: 2rem;
	}

	.header-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
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
	}

	.save-section {
		text-align: center;
		padding: 2rem 0 0;
	}

	@media (max-width: 968px) {
		.builder-layout {
			grid-template-columns: 1fr;
		}
	}
</style>
