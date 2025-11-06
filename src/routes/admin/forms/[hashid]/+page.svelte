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

	// Field type options (personal data fields removed - captured automatically from token)
	const fieldTypes = [
		{ value: 'text', label: 'Text Input', icon: 'type' },
		{ value: 'textarea', label: 'Text Area', icon: 'align-left' },
		{ value: 'number', label: 'Number', icon: 'hash' },
		{ value: 'date', label: 'Date', icon: 'calendar' },
		{ value: 'select', label: 'Dropdown', icon: 'chevron-down' },
		{ value: 'radio', label: 'Radio Buttons', icon: 'circle' },
		{ value: 'checkbox', label: 'Checkboxes', icon: 'check-square' }
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

	function getIcon(iconName) {
		const icons = {
			'type': '<path d="M4 7V4h16v3M9 20h6M12 4v16"/>',
			'align-left': '<line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/>',
			'hash': '<line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>',
			'calendar': '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
			'chevron-down': '<polyline points="6 9 12 15 18 9"/>',
			'circle': '<circle cx="12" cy="12" r="10"/>',
			'check-square': '<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>'
		};
		return icons[iconName] || '';
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

	{#if message}
		<div class="alert {messageType}">
			<svg class="alert-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				{#if messageType === 'success'}
					<polyline points="20 6 9 17 4 12"></polyline>
				{:else}
					<circle cx="12" cy="12" r="10"></circle>
					<line x1="12" y1="8" x2="12" y2="12"></line>
					<line x1="12" y1="16" x2="12.01" y2="16"></line>
				{/if}
			</svg>
			<span>{message}</span>
		</div>
	{/if}

	<div class="builder-layout">
		<aside class="sidebar">
			<h3>Add Fields</h3>
			<div class="field-types">
				{#each fieldTypes as fieldType}
					<button class="field-type-btn" onclick={() => addField(fieldType.value)}>
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							{@html getIcon(fieldType.icon)}
						</svg>
						<span>{fieldType.label}</span>
					</button>
				{/each}
			</div>
		</aside>

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
							<svg class="empty-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
								<line x1="19" y1="12" x2="5" y2="12"></line>
								<polyline points="12 19 5 12 12 5"></polyline>
							</svg>
							<p>No fields added yet</p>
							<p class="empty-hint">Add fields from the sidebar to build your form</p>
						</div>
					{:else}
						<div class="fields-list">
							{#each fields as field, index (field.id)}
								<div class="field-editor">
									<div class="field-header">
										<span class="field-type-badge">
											<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
												{@html getIcon(fieldTypes.find((ft) => ft.value === field.type)?.icon || 'type')}
											</svg>
											{fieldTypes.find((ft) => ft.value === field.type)?.label}
										</span>
										<div class="field-controls">
											<button type="button" class="btn-icon" onclick={() => moveFieldUp(index)} disabled={index === 0} title="Move up">
												<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
													<polyline points="18 15 12 9 6 15"></polyline>
												</svg>
											</button>
											<button type="button" class="btn-icon" onclick={() => moveFieldDown(index)} disabled={index === fields.length - 1} title="Move down">
												<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
													<polyline points="6 9 12 15 18 9"></polyline>
												</svg>
											</button>
											<button type="button" class="btn-icon btn-icon-danger" onclick={() => removeField(field.id)} title="Delete field">
												<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
													<polyline points="3 6 5 6 21 6"></polyline>
													<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
												</svg>
											</button>
										</div>
									</div>

									<div class="field-body">
										<div class="form-row">
											<div class="form-group flex-1">
												<label for="label-{field.id}">Label *</label>
												<input type="text" id="label-{field.id}" bind:value={field.label} required placeholder="Field label" />
											</div>
											<div class="form-group checkbox-group">
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
																<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
																	<line x1="18" y1="6" x2="6" y2="18"></line>
																	<line x1="6" y1="6" x2="18" y2="18"></line>
																</svg>
															</button>
														</div>
													{/each}
													<button type="button" class="btn-add-option" onclick={() => addOption(field.id)}>
														<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
															<line x1="12" y1="5" x2="12" y2="19"></line>
															<line x1="5" y1="12" x2="19" y2="12"></line>
														</svg>
														Add Option
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
	:global(body) {
		background: #f8fafc;
		margin: 0;
		padding: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
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
		color: #0f172a;
		font-weight: 700;
		letter-spacing: -0.025em;
	}

	.subtitle {
		font-size: 1rem;
		color: #64748b;
		margin: 0;
		font-weight: 400;
	}

	.alert {
		background: white;
		padding: 1rem 1.25rem;
		border-radius: 10px;
		margin-bottom: 1.5rem;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		border: 1px solid #e2e8f0;
	}

	.alert.success {
		background: #f0fdf4;
		border-color: #86efac;
		color: #166534;
	}

	.alert.error {
		background: #fef2f2;
		border-color: #fca5a5;
		color: #991b1b;
	}

	.alert-icon {
		flex-shrink: 0;
	}

	.builder-layout {
		display: grid;
		grid-template-columns: 260px 1fr;
		gap: 2rem;
	}

	.sidebar {
		background: white;
		border-radius: 12px;
		padding: 1.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		border: 1px solid #e2e8f0;
		height: fit-content;
		position: sticky;
		top: 2rem;
	}

	h3 {
		font-size: 1rem;
		margin: 0 0 1rem 0;
		color: #0f172a;
		font-weight: 600;
	}

	.field-types {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.field-type-btn {
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 8px;
		padding: 0.75rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		transition: all 0.15s ease;
		font-size: 0.9375rem;
		color: #334155;
		font-weight: 500;
	}

	.field-type-btn:hover {
		background: white;
		border-color: #3b82f6;
		color: #3b82f6;
		transform: translateX(4px);
	}

	.editor {
		flex: 1;
	}

	.card {
		background: white;
		border-radius: 12px;
		padding: 2rem;
		margin-bottom: 1.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		border: 1px solid #e2e8f0;
	}

	h2 {
		font-size: 1.25rem;
		margin: 0 0 1.5rem 0;
		color: #0f172a;
		font-weight: 600;
	}

	.form-group {
		margin-bottom: 1.25rem;
	}

	.form-row {
		display: flex;
		gap: 1rem;
		align-items: end;
	}

	.flex-1 {
		flex: 1;
	}

	.checkbox-group {
		min-width: 120px;
	}

	label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 500;
		color: #334155;
		font-size: 0.9375rem;
	}

	input[type='text'],
	input[type='email'],
	textarea {
		width: 100%;
		padding: 0.625rem 0.75rem;
		border: 1px solid #e2e8f0;
		border-radius: 8px;
		box-sizing: border-box;
		font-family: inherit;
		font-size: 0.9375rem;
		transition: all 0.15s ease;
		background: white;
	}

	input[type='checkbox'] {
		margin-right: 0.5rem;
		cursor: pointer;
	}

	textarea {
		resize: vertical;
	}

	input:focus,
	textarea:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.btn {
		padding: 0.625rem 1.25rem;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		font-size: 0.9375rem;
		font-weight: 500;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		transition: all 0.15s ease;
		text-decoration: none;
	}

	.btn-primary {
		background: #3b82f6;
		color: white;
	}

	.btn-primary:hover:not(:disabled) {
		background: #2563eb;
		transform: translateY(-1px);
		box-shadow: 0 4px 6px rgba(59, 130, 246, 0.25);
	}

	.btn-secondary {
		background: #f1f5f9;
		color: #334155;
	}

	.btn-secondary:hover {
		background: #e2e8f0;
	}

	.btn-lg {
		padding: 0.875rem 1.75rem;
		font-size: 1rem;
	}

	.empty-state {
		text-align: center;
		padding: 3rem 1rem;
		color: #64748b;
	}

	.empty-icon {
		margin: 0 auto 1rem;
		color: #cbd5e0;
	}

	.empty-state p {
		margin: 0.5rem 0;
	}

	.empty-state p:first-of-type {
		font-weight: 500;
		color: #475569;
	}

	.empty-hint {
		font-size: 0.875rem;
		color: #94a3b8;
	}

	.fields-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.field-editor {
		background: #fafafa;
		border: 1px solid #e2e8f0;
		border-radius: 10px;
		overflow: hidden;
	}

	.field-header {
		background: #f8fafc;
		padding: 1rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-bottom: 1px solid #e2e8f0;
	}

	.field-type-badge {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-weight: 500;
		color: #334155;
		font-size: 0.9375rem;
	}

	.field-controls {
		display: flex;
		gap: 0.5rem;
	}

	.field-body {
		padding: 1.5rem;
		background: white;
	}

	.btn-icon {
		background: white;
		border: 1px solid #e2e8f0;
		padding: 0.375rem;
		cursor: pointer;
		border-radius: 6px;
		transition: all 0.15s ease;
		color: #64748b;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.btn-icon:hover:not(:disabled) {
		background: #f8fafc;
		border-color: #cbd5e0;
		color: #3b82f6;
	}

	.btn-icon:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.btn-icon-danger:hover {
		color: #dc2626;
		border-color: #fca5a5;
		background: #fef2f2;
	}

	.options-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.option-row {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.btn-icon-small {
		background: white;
		border: 1px solid #e2e8f0;
		cursor: pointer;
		padding: 0.5rem;
		border-radius: 6px;
		transition: all 0.15s ease;
		color: #64748b;
		display: flex;
		align-items: center;
		flex-shrink: 0;
	}

	.btn-icon-small:hover:not(:disabled) {
		background: #fef2f2;
		border-color: #fca5a5;
		color: #dc2626;
	}

	.btn-icon-small:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.btn-add-option {
		background: white;
		border: 2px dashed #cbd5e0;
		color: #3b82f6;
		padding: 0.625rem;
		border-radius: 6px;
		cursor: pointer;
		font-weight: 500;
		transition: all 0.15s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		font-size: 0.9375rem;
	}

	.btn-add-option:hover {
		background: #f8fafc;
		border-color: #3b82f6;
		border-style: solid;
	}

	.save-section {
		text-align: center;
		padding: 2rem 0 0;
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

		.btn {
			justify-content: center;
		}
	}
</style>
