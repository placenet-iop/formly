<script>
	import { onMount } from 'svelte';
	import { enhance } from '$app/forms';

	export let data;
	export let form;

	let formTitle = '';
	let formDescription = '';
	let fields = [];

	let message = '';
	let messageType = '';

	// Field type options
	const fieldTypes = [
		{ value: 'text', label: 'Text Input', icon: '📝' },
		{ value: 'textarea', label: 'Text Area', icon: '📄' },
		{ value: 'email', label: 'Email', icon: '📧' },
		{ value: 'number', label: 'Number', icon: '🔢' },
		{ value: 'tel', label: 'Phone', icon: '📞' },
		{ value: 'date', label: 'Date', icon: '📅' },
		{ value: 'select', label: 'Dropdown', icon: '🔽' },
		{ value: 'radio', label: 'Radio Buttons', icon: '◉' },
		{ value: 'checkbox', label: 'Checkboxes', icon: '☑' }
	];

	onMount(() => {
		if (data) {
			formTitle = data.form.title || '';
			formDescription = data.form.description || '';
			fields = data.form.fields || [];
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
			options: type === 'select' || type === 'radio' || type === 'checkbox' ? ['Option 1'] : []
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
				return { ...f, options: [...f.options, `Option ${f.options.length + 1}`] };
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
				newOptions[optionIndex] = value;
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
				← Back to Forms
			</a>
		</div>
	</header>

	{#if message}
		<div class="alert {messageType}">
			<span class="alert-icon">{messageType === 'success' ? '✓' : '⚠'}</span>
			<span>{message}</span>
		</div>
	{/if}

	<div class="builder-layout">
		<!-- Left Sidebar - Field Types -->
		<aside class="sidebar">
			<h3>Add Fields</h3>
			<div class="field-types">
				{#each fieldTypes as fieldType}
					<button class="field-type-btn" onclick={() => addField(fieldType.value)}>
						<span class="field-icon">{fieldType.icon}</span>
						<span>{fieldType.label}</span>
					</button>
				{/each}
			</div>
		</aside>

		<!-- Main Content - Form Editor -->
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

				<div class="card">
					<h2>Form Fields</h2>

					{#if fields.length === 0}
						<div class="empty-state">
							<div class="empty-icon">👈</div>
							<p>No fields added yet</p>
							<p class="empty-hint">Add fields from the sidebar to build your form</p>
						</div>
					{:else}
						<div class="fields-list">
							{#each fields as field, index (field.id)}
								<div class="field-editor">
									<div class="field-header">
										<span class="field-type-badge">
											{fieldTypes.find((ft) => ft.value === field.type)?.icon}
											{fieldTypes.find((ft) => ft.value === field.type)?.label}
										</span>
										<div class="field-controls">
											<button type="button" class="btn-icon" onclick={() => moveFieldUp(index)} disabled={index === 0} title="Move up">
												⬆️
											</button>
											<button type="button" class="btn-icon" onclick={() => moveFieldDown(index)} disabled={index === fields.length - 1} title="Move down">
												⬇️
											</button>
											<button type="button" class="btn-icon btn-delete" onclick={() => removeField(field.id)} title="Delete field">
												🗑️
											</button>
										</div>
									</div>

									<div class="field-body">
										<div class="form-row">
											<div class="form-group flex-1">
												<label for="label-{field.id}">Label *</label>
												<input type="text" id="label-{field.id}" bind:value={field.label} required placeholder="Field label" />
											</div>
											<div class="form-group" style="width: 150px;">
												<label for="required-{field.id}">
													<input type="checkbox" id="required-{field.id}" bind:checked={field.required} />
													Required
												</label>
											</div>
										</div>

										{#if field.type !== 'select' && field.type !== 'radio' && field.type !== 'checkbox'}
											<div class="form-group">
												<label for="placeholder-{field.id}">Placeholder</label>
												<input type="text" id="placeholder-{field.id}" bind:value={field.placeholder} placeholder="Placeholder text" />
											</div>
										{/if}

										{#if field.type === 'select' || field.type === 'radio' || field.type === 'checkbox'}
											<div class="form-group">
												<label>Options</label>
												<div class="options-list">
													{#each field.options as option, optIdx}
														<div class="option-row">
															<input type="text" value={option} oninput={(e) => updateOption(field.id, optIdx, e.target.value)} placeholder="Option {optIdx + 1}" />
															<button type="button" class="btn-icon-small" onclick={() => removeOption(field.id, optIdx)} disabled={field.options.length === 1}>
																✕
															</button>
														</div>
													{/each}
													<button type="button" class="btn-add-option" onclick={() => addOption(field.id)}>
														+ Add Option
													</button>
												</div>
											</div>
										{/if}
									</div>
								</div>
							{/each}
						</div>
					{/if}

					<input type="hidden" name="fields" value={JSON.stringify(fields)} />
				</div>

				<div class="save-section">
					<button type="submit" class="btn btn-primary btn-lg">
						💾 Save Form
					</button>
				</div>
			</form>
		</main>
	</div>
</div>

<style>
	:global(body) {
		background: #f7fafc;
		margin: 0;
		padding: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
	}

	.container {
		max-width: 1400px;
		margin: 0 auto;
		padding: 2rem 1rem;
	}

	header {
		margin-bottom: 2rem;
	}

	.header-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	h1 {
		font-size: 2rem;
		margin: 0 0 0.5rem 0;
		color: #2d3748;
	}

	.subtitle {
		font-size: 1rem;
		color: #718096;
		margin: 0;
	}

	.alert {
		background: white;
		padding: 1rem 1.25rem;
		border-radius: 8px;
		margin-bottom: 1.5rem;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		animation: slideIn 0.3s ease-out;
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.alert.success {
		background: #d4edda;
		color: #155724;
		border-left: 4px solid #28a745;
	}

	.alert.error {
		background: #f8d7da;
		color: #721c24;
		border-left: 4px solid #dc3545;
	}

	.alert-icon {
		font-size: 1.5rem;
		font-weight: bold;
	}

	.builder-layout {
		display: grid;
		grid-template-columns: 250px 1fr;
		gap: 2rem;
	}

	.sidebar {
		background: white;
		border-radius: 12px;
		padding: 1.5rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		border: 1px solid #e2e8f0;
		height: fit-content;
		position: sticky;
		top: 2rem;
	}

	h3 {
		font-size: 1.2rem;
		margin: 0 0 1rem 0;
		color: #2d3748;
	}

	.field-types {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.field-type-btn {
		background: #f7fafc;
		border: 2px solid #e2e8f0;
		border-radius: 8px;
		padding: 0.75rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		transition: all 0.2s;
		font-size: 0.9rem;
	}

	.field-type-btn:hover {
		background: white;
		border-color: #667eea;
		transform: translateX(5px);
	}

	.field-icon {
		font-size: 1.5rem;
	}

	.editor {
		flex: 1;
	}

	.card {
		background: white;
		border-radius: 12px;
		padding: 2rem;
		margin-bottom: 1.5rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		border: 1px solid #e2e8f0;
	}

	h2 {
		font-size: 1.5rem;
		margin: 0 0 1.5rem 0;
		color: #2d3748;
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	.form-row {
		display: flex;
		gap: 1rem;
		align-items: end;
	}

	.flex-1 {
		flex: 1;
	}

	label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 600;
		color: #2d3748;
		font-size: 0.95rem;
	}

	input[type='text'],
	input[type='email'],
	textarea {
		width: 100%;
		padding: 0.75rem;
		border: 2px solid #e2e8f0;
		border-radius: 8px;
		box-sizing: border-box;
		font-family: inherit;
		font-size: 0.95rem;
		transition: all 0.2s;
	}

	input[type='checkbox'] {
		margin-right: 0.5rem;
	}

	textarea {
		resize: vertical;
	}

	input:focus,
	textarea:focus {
		outline: none;
		border-color: #667eea;
		box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
	}

	.btn {
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		font-size: 1rem;
		font-weight: 600;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		transition: all 0.2s;
		text-decoration: none;
	}

	.btn-primary {
		background: #667eea;
		color: white;
	}

	.btn-primary:hover {
		background: #5568d3;
	}

	.btn-secondary {
		background: #e2e8f0;
		color: #2d3748;
	}

	.btn-secondary:hover {
		background: #cbd5e0;
	}

	.btn-lg {
		padding: 1rem 2rem;
		font-size: 1.1rem;
	}

	.empty-state {
		text-align: center;
		padding: 3rem 1rem;
		color: #718096;
	}

	.empty-icon {
		font-size: 4rem;
		margin-bottom: 1rem;
		opacity: 0.5;
	}

	.empty-state p {
		margin: 0.5rem 0;
	}

	.empty-hint {
		font-size: 0.875rem;
		opacity: 0.8;
	}

	.fields-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.field-editor {
		background: #f7fafc;
		border: 2px solid #e2e8f0;
		border-radius: 12px;
		overflow: hidden;
	}

	.field-header {
		background: #edf2f7;
		padding: 1rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-bottom: 2px solid #e2e8f0;
	}

	.field-type-badge {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-weight: 600;
		color: #2d3748;
		font-size: 0.95rem;
	}

	.field-controls {
		display: flex;
		gap: 0.5rem;
	}

	.field-body {
		padding: 1.5rem;
	}

	.btn-icon {
		background: white;
		border: 1px solid #e2e8f0;
		font-size: 1.2rem;
		cursor: pointer;
		padding: 0.4rem 0.6rem;
		border-radius: 6px;
		transition: all 0.2s;
	}

	.btn-icon:hover:not(:disabled) {
		background: #edf2f7;
		transform: scale(1.1);
	}

	.btn-icon:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.btn-icon.btn-delete:hover {
		background: #fee;
		border-color: #fc8181;
	}

	.options-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.option-row {
		display: flex;
		gap: 0.5rem;
	}

	.btn-icon-small {
		background: white;
		border: 1px solid #e2e8f0;
		font-size: 1rem;
		cursor: pointer;
		padding: 0.5rem 0.75rem;
		border-radius: 6px;
		transition: all 0.2s;
		color: #718096;
	}

	.btn-icon-small:hover:not(:disabled) {
		background: #fee;
		border-color: #fc8181;
		color: #e53e3e;
	}

	.btn-icon-small:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.btn-add-option {
		background: white;
		border: 2px dashed #cbd5e0;
		color: #667eea;
		padding: 0.75rem;
		border-radius: 6px;
		cursor: pointer;
		font-weight: 600;
		transition: all 0.2s;
	}

	.btn-add-option:hover {
		background: #f7fafc;
		border-color: #667eea;
	}

	.save-section {
		text-align: center;
		padding: 2rem 0;
	}

	@media (max-width: 968px) {
		.builder-layout {
			grid-template-columns: 1fr;
		}

		.sidebar {
			position: static;
		}

		.header-content {
			flex-direction: column;
			align-items: stretch;
			gap: 1rem;
		}
	}
</style>
