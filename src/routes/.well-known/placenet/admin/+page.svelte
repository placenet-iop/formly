<script>
	import { onMount } from 'svelte';
	import { enhance } from '$app/forms';

	export let data;
	export let form;

	let forms = [];
	let showCreateModal = false;
	let newFormTitle = '';
	let newFormDescription = '';

	let message = '';
	let messageType = '';

	onMount(() => {
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
		}
	});

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

	<section class="card">
		<div class="section-header">
			<h2>Your Forms</h2>
			<button class="btn btn-primary" onclick={() => (showCreateModal = true)}>
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<line x1="12" y1="5" x2="12" y2="19"></line>
					<line x1="5" y1="12" x2="19" y2="12"></line>
				</svg>
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
										<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
											<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
											<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
										</svg>
									</a>
									<a href="/admin/submissions/{formItem.hashid}?token={data.token}" class="btn-icon" title="View submissions">
										<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
											<line x1="18" y1="20" x2="18" y2="10"></line>
											<line x1="12" y1="20" x2="12" y2="4"></line>
											<line x1="6" y1="20" x2="6" y2="14"></line>
										</svg>
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
											<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
												{#if formItem.is_active}
													<rect x="6" y="4" width="4" height="16"></rect>
													<rect x="14" y="4" width="4" height="16"></rect>
												{:else}
													<polygon points="5 3 19 12 5 21 5 3"></polygon>
												{/if}
											</svg>
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
										<button type="submit" class="btn-icon btn-icon-danger" title="Delete form">
											<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
												<polyline points="3 6 5 6 21 6"></polyline>
												<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
											</svg>
										</button>
									</form>
								</div>
							</div>
							{#if formItem.description}
								<div class="form-description">{formItem.description}</div>
							{/if}
							
							<div class="form-meta">
								<span class="meta-item">
									<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
										<polyline points="14 2 14 8 20 8"></polyline>
									</svg>
									{formItem.submissionCount} {formItem.submissionCount === 1 ? 'submission' : 'submissions'}
								</span>
								<span class="separator">•</span>
								<span class="meta-item">
									<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<circle cx="12" cy="12" r="10"></circle>
										<polyline points="12 6 12 12 16 14"></polyline>
									</svg>
									Updated {formatDate(formItem.updated_at)}
								</span>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="empty-state">
				<svg class="empty-icon" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
					<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
					<polyline points="14 2 14 8 20 8"></polyline>
					<line x1="16" y1="13" x2="8" y2="13"></line>
					<line x1="16" y1="17" x2="8" y2="17"></line>
					<polyline points="10 9 9 9 8 9"></polyline>
				</svg>
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
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<line x1="18" y1="6" x2="6" y2="18"></line>
						<line x1="6" y1="6" x2="18" y2="18"></line>
					</svg>
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
		background: #f8fafc;
		min-height: 100vh;
		margin: 0;
		padding: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem 1rem;
	}

	header {
		margin-bottom: 2.5rem;
	}

	h1 {
		font-size: 2.25rem;
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

	.card {
		background: white;
		border-radius: 12px;
		padding: 2rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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
		color: #0f172a;
		font-weight: 600;
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

	.forms-grid {
		display: grid;
		gap: 1rem;
	}

	.form-card {
		background: #fafafa;
		border: 1px solid #e2e8f0;
		border-radius: 10px;
		padding: 1.5rem;
		transition: all 0.2s ease;
	}

	.form-card:hover {
		border-color: #cbd5e0;
		background: white;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
	}

	.form-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 0.75rem;
	}

	.form-title-section {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex: 1;
	}

	.form-title {
		font-weight: 600;
		color: #0f172a;
		font-size: 1.125rem;
	}

	.form-description {
		color: #64748b;
		margin-bottom: 1rem;
		font-size: 0.9375rem;
		line-height: 1.5;
	}

	.form-meta {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		font-size: 0.875rem;
		color: #64748b;
	}

	.meta-item {
		display: flex;
		align-items: center;
		gap: 0.375rem;
	}

	.separator {
		color: #cbd5e0;
	}

	.form-actions {
		display: flex;
		gap: 0.5rem;
	}

	.btn-icon {
		background: white;
		border: 1px solid #e2e8f0;
		padding: 0.5rem;
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.15s ease;
		color: #64748b;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.btn-icon:hover {
		background: #f8fafc;
		border-color: #cbd5e0;
		color: #3b82f6;
		transform: translateY(-1px);
	}

	.btn-icon-danger:hover {
		color: #dc2626;
		border-color: #fca5a5;
		background: #fef2f2;
	}

	.status-pill {
		padding: 0.25rem 0.625rem;
		border-radius: 6px;
		font-size: 0.75rem;
		font-weight: 500;
	}

	.status-pill.inactive {
		background: #f1f5f9;
		color: #64748b;
	}

	.empty-state {
		text-align: center;
		padding: 4rem 1rem;
		color: #64748b;
	}

	.empty-icon {
		margin: 0 auto 1.5rem;
		color: #cbd5e0;
	}

	.empty-state p {
		margin: 0.5rem 0;
		font-size: 1rem;
	}

	.empty-state p:first-of-type {
		font-weight: 500;
		color: #475569;
	}

	.empty-hint {
		font-size: 0.875rem;
		color: #94a3b8;
	}

	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(15, 23, 42, 0.5);
		backdrop-filter: blur(4px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		animation: fadeIn 0.2s ease;
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
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
		animation: slideUp 0.2s ease;
	}

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
	}

	h3 {
		font-size: 1.25rem;
		margin: 0;
		color: #0f172a;
		font-weight: 600;
	}

	.btn-close {
		background: none;
		border: none;
		cursor: pointer;
		color: #64748b;
		padding: 0.375rem;
		border-radius: 6px;
		transition: all 0.15s ease;
		display: flex;
		align-items: center;
	}

	.btn-close:hover {
		background: #f8fafc;
		color: #0f172a;
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 500;
		color: #334155;
		font-size: 0.9375rem;
	}

	input[type='text'],
	textarea {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #e2e8f0;
		border-radius: 8px;
		box-sizing: border-box;
		font-family: inherit;
		font-size: 0.9375rem;
		transition: all 0.15s ease;
		background: white;
	}

	input[type='text']:focus,
	textarea:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	textarea {
		resize: vertical;
	}

	.modal-actions {
		display: flex;
		gap: 0.75rem;
		justify-content: flex-end;
		margin-top: 2rem;
	}

	@media (max-width: 768px) {
		h1 {
			font-size: 1.875rem;
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
