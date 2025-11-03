<script>
	import { onMount } from 'svelte';
	import { enhance } from '$app/forms';

	export let data; // From load function: { token, forms }
	export let form; // From action response, if any

	let forms = [];
	let showCreateModal = false;
	let newFormTitle = '';
	let newFormDescription = '';

	// For displaying messages from the action
	let message = '';
	let messageType = ''; // 'success' or 'error'

	onMount(() => {
		if (data) {
			forms = data.forms || [];
		}

		if (form) {
			if (form.message) {
				message = form.message;
				messageType = form.messageType;

				// If form was created successfully, navigate to editor
				if (form.messageType === 'success' && form.formId) {
					window.location.href = `/admin/forms/${form.formId}?token=${data.token}`;
				}
			}
		}
	});

	// Reactive statement to update component state based on props changes
	$: {
		if (data) {
			forms = data.forms || [];
		}

		if (form) {
			if (form.message) {
				message = form.message;
				messageType = form.messageType;

				if (form.messageType === 'success' && form.formId) {
					window.location.href = `/admin/forms/${form.formId}?token=${data.token}`;
				}
			}
		} else {
			message = '';
			messageType = '';
		}
	}

	function formatDate(date) {
		if (!date) return '';
		return new Date(date).toLocaleDateString() + ' ' + new Date(date).toLocaleTimeString();
	}
</script>

<svelte:head>
	<title>Forms Management</title>
</svelte:head>

<div class="container">
	<header>
		<h1>Formly</h1>
		<p class="subtitle">Manage your forms and submissions</p>
	</header>

	{#if message}
		<div class="alert {messageType}">
			<span class="alert-icon">{messageType === 'success' ? '✓' : '⚠'}</span>
			<span>{message}</span>
		</div>
	{/if}

	<section class="card">
		<div class="section-header">
			<h2>Your Forms</h2>
			<button class="btn btn-primary" onclick={() => (showCreateModal = true)}>
				<span>➕</span>
				<span>Create New Form</span>
			</button>
		</div>

		{#if forms && forms.length > 0}
			<div class="forms-grid">
				{#each forms as formItem}
					<div class="form-card">
						<div class="form-info">
							<div class="form-header">
								<div class="form-title-section">
									<div class="form-title">{formItem.title}</div>
									{#if !formItem.is_active}
										<span class="status-pill inactive">Inactive</span>
									{/if}
								</div>
								<div class="form-actions">
									<a href="/admin/forms/{formItem.hashid}?token={data.token}" class="btn-icon" title="Edit form">
										✏️
									</a>
									<a href="/admin/submissions/{formItem.hashid}?token={data.token}" class="btn-icon" title="View submissions">
										📊
									</a>
									<form
										method="POST"
										action="?/toggleActive&token={data.token}"
										use:enhance={() => {
											message = '';
											messageType = '';
											return async ({ update }) => {
												await update();
											};
										}}
										style="display: inline;"
									>
										<input type="hidden" name="formId" value={formItem.id} />
										<input type="hidden" name="isActive" value={formItem.is_active} />
										<button type="submit" class="btn-icon" title={formItem.is_active ? 'Deactivate' : 'Activate'}>
											{formItem.is_active ? '⏸️' : '▶️'}
										</button>
									</form>
									<form
										method="POST"
										action="?/deleteForm&token={data.token}"
										use:enhance={({ cancel }) => {
											if (!confirm(`Are you sure you want to delete "${formItem.title}"? This will also delete all submissions.`)) {
												cancel();
												return;
											}
											message = '';
											messageType = '';
											return async ({ update }) => {
												await update();
											};
										}}
										style="display: inline;"
									>
										<input type="hidden" name="formId" value={formItem.id} />
										<button type="submit" class="btn-icon" title="Delete form">
											🗑️
										</button>
									</form>
								</div>
							</div>
							{#if formItem.description}
								<div class="form-description">{formItem.description}</div>
							{/if}
							<div class="form-meta">
								<span>{formItem.submissionCount} {formItem.submissionCount === 1 ? 'submission' : 'submissions'}</span>
								<span class="separator">•</span>
								<span>Updated {formatDate(formItem.updated_at)}</span>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="empty-state">
				<div class="empty-icon">📝</div>
				<p>No forms created yet</p>
				<p class="empty-hint">Create your first form to start collecting responses</p>
			</div>
		{/if}
	</section>
</div>

{#if showCreateModal}
	<div class="modal-overlay" onclick={() => (showCreateModal = false)}>
		<div class="modal" onclick={(e) => e.stopPropagation()}>
			<div class="modal-header">
				<h3>Create New Form</h3>
				<button class="btn-close" onclick={() => (showCreateModal = false)}>
					✕
				</button>
			</div>
			<form
				method="POST"
				action="?/createForm&token={data.token}"
				use:enhance={() => {
					message = '';
					messageType = '';
					return async ({ update }) => {
						await update({ reset: false });
						showCreateModal = false;
					};
				}}
			>
				<div class="form-group">
					<label for="title">Form Title *</label>
					<input type="text" id="title" name="title" bind:value={newFormTitle} required placeholder="e.g., Contact Form" />
				</div>
				<div class="form-group">
					<label for="description">Description</label>
					<textarea id="description" name="description" bind:value={newFormDescription} rows="3" placeholder="Optional description"></textarea>
				</div>
				<div class="modal-actions">
					<button type="button" class="btn btn-secondary" onclick={() => (showCreateModal = false)}>
						Cancel
					</button>
					<button type="submit" class="btn btn-primary">
						Create Form
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<style>
	:global(body) {
		background: #fefdfc;
		min-height: 100vh;
		margin: 0;
		padding: 2rem 1rem;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
	}

	header {
		text-align: center;
		margin-bottom: 2rem;
		color: #2d3748;
	}

	h1 {
		font-size: 2.5rem;
		margin: 0 0 0.5rem 0;
		font-weight: 700;
	}

	.subtitle {
		font-size: 1.1rem;
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

	.card {
		background: white;
		border-radius: 12px;
		padding: 2rem;
		margin-bottom: 1.5rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		border: 1px solid #e2e8f0;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
	}

	h2 {
		font-size: 1.5rem;
		margin: 0;
		color: #2d3748;
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

	.btn-primary:hover:not(:disabled) {
		background: #5568d3;
	}

	.btn-secondary {
		background: #e2e8f0;
		color: #2d3748;
	}

	.btn-secondary:hover {
		background: #cbd5e0;
	}

	.forms-grid {
		display: grid;
		gap: 1rem;
	}

	.form-card {
		background: #f7fafc;
		border: 2px solid #e2e8f0;
		border-radius: 12px;
		padding: 1.5rem;
		transition: all 0.2s;
	}

	.form-card:hover {
		border-color: #cbd5e0;
		background: white;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	}

	.form-info {
		flex: 1;
	}

	.form-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 0.5rem;
	}

	.form-title-section {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex: 1;
	}

	.form-title {
		font-weight: 600;
		color: #2d3748;
		font-size: 1.2rem;
	}

	.form-description {
		color: #718096;
		margin-bottom: 0.75rem;
		font-size: 0.95rem;
	}

	.form-meta {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		color: #718096;
	}

	.separator {
		color: #cbd5e0;
	}

	.form-actions {
		display: flex;
		gap: 0.5rem;
	}

	.btn-icon {
		background: none;
		border: none;
		font-size: 1.5rem;
		cursor: pointer;
		padding: 0.5rem;
		border-radius: 8px;
		transition: all 0.2s;
		text-decoration: none;
	}

	.btn-icon:hover {
		background: #edf2f7;
		transform: scale(1.1);
	}

	.status-pill {
		padding: 0.25rem 0.6rem;
		border-radius: 12px;
		font-size: 0.75rem;
		font-weight: 600;
	}

	.status-pill.inactive {
		background: #e2e8f0;
		color: #718096;
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

	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.modal {
		background: white;
		border-radius: 12px;
		padding: 2rem;
		max-width: 500px;
		width: 90%;
		max-height: 90vh;
		overflow-y: auto;
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
	}

	h3 {
		font-size: 1.5rem;
		margin: 0;
		color: #2d3748;
	}

	.btn-close {
		background: none;
		border: none;
		font-size: 1.5rem;
		cursor: pointer;
		color: #718096;
		padding: 0.5rem;
		border-radius: 8px;
		transition: all 0.2s;
	}

	.btn-close:hover {
		background: #f7fafc;
		color: #2d3748;
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 600;
		color: #2d3748;
		font-size: 0.95rem;
	}

	input[type='text'],
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

	textarea {
		resize: vertical;
	}

	input[type='text']:focus,
	textarea:focus {
		outline: none;
		border-color: #667eea;
		box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
	}

	.modal-actions {
		display: flex;
		gap: 1rem;
		justify-content: flex-end;
		margin-top: 2rem;
	}

	@media (max-width: 768px) {
		h1 {
			font-size: 2rem;
		}

		.card {
			padding: 1.5rem;
		}

		.section-header {
			flex-direction: column;
			align-items: stretch;
			gap: 1rem;
		}

		.form-header {
			flex-direction: column;
			gap: 1rem;
		}

		.form-actions {
			justify-content: flex-start;
		}

		.modal-actions {
			flex-direction: column-reverse;
		}

		.btn {
			width: 100%;
			justify-content: center;
		}
	}
</style>
