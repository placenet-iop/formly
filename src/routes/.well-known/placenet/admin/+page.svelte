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
	<header class="page-header">
		<div class="brand">
			<div class="brand-mark">
				<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<rect x="3" y="4" width="18" height="16" rx="3"></rect>
					<path d="M7 9h10M7 13h6"></path>
				</svg>
			</div>
			<div>
				<h1>Formly</h1>
				<p class="subtitle">Panel de control para formularios y respuestas</p>
			</div>
		</div>
		<div class="pill-row">
			<div class="pill success">
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<polyline points="4 12 9 17 20 6"></polyline>
				</svg>
				<span>Flujo seguro</span>
			</div>
			<div class="pill">
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<circle cx="12" cy="12" r="10"></circle>
					<path d="M12 6v6l3 3"></path>
				</svg>
				<span>Tiempo real</span>
			</div>
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
	@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');

	:global(body) {
		background: radial-gradient(circle at 15% 15%, rgba(59, 130, 246, 0.1), transparent 25%),
			radial-gradient(circle at 85% 10%, rgba(16, 185, 129, 0.12), transparent 20%),
			linear-gradient(180deg, #f7f9fb 0%, #eef2f7 30%, #f7f9fb 100%);
		min-height: 100vh;
		margin: 0;
		padding: 0;
		font-family: 'Space Grotesk', 'Inter', system-ui, -apple-system, sans-serif;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2.25rem 1rem 2.5rem;
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
	}

	.brand {
		display: flex;
		align-items: center;
		gap: 0.85rem;
	}

	.brand-mark {
		width: 48px;
		height: 48px;
		border-radius: 14px;
		background: linear-gradient(135deg, #0ea5e9, #6366f1);
		display: grid;
		place-items: center;
		color: #f8fafc;
		box-shadow: 0 15px 40px rgba(99, 102, 241, 0.3);
	}

	h1 {
		font-size: 2.15rem;
		margin: 0 0 0.35rem 0;
		color: #0f172a;
		font-weight: 700;
		letter-spacing: -0.02em;
	}

	.subtitle {
		font-size: 1rem;
		color: #475569;
		margin: 0;
		font-weight: 500;
	}

	.pill-row {
		display: flex;
		gap: 0.5rem;
	}

	.pill {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		padding: 0.55rem 0.85rem;
		border-radius: 12px;
		background: #e0f2fe;
		color: #0f172a;
		font-weight: 600;
		border: 1px solid #bae6fd;
	}

	.pill.success {
		background: #dcfce7;
		border-color: #bbf7d0;
	}

	.alert {
		background: white;
		padding: 1rem 1.25rem;
		border-radius: 12px;
		margin-bottom: 1.5rem;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);
		border: 1px solid #e2e8f0;
	}

	.alert.success {
		background: #f0fdf4;
		border-color: #bbf7d0;
		color: #166534;
	}

	.alert.error {
		background: #fef2f2;
		border-color: #fecdd3;
		color: #991b1b;
	}

	.alert-icon {
		flex-shrink: 0;
	}

	.card {
		background: rgba(255, 255, 255, 0.8);
		border-radius: 18px;
		padding: 2rem;
		box-shadow: 0 24px 80px rgba(15, 23, 42, 0.12);
		border: 1px solid rgba(148, 163, 184, 0.35);
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
	}

	h2 {
		font-size: 1.45rem;
		margin: 0;
		color: #0f172a;
		font-weight: 700;
	}

	.btn {
		padding: 0.675rem 1.3rem;
		border: none;
		border-radius: 10px;
		cursor: pointer;
		font-size: 0.95rem;
		font-weight: 700;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		transition: all 0.15s ease;
		text-decoration: none;
	}

	.btn-primary {
		background: linear-gradient(135deg, #2563eb, #7c3aed);
		color: white;
		box-shadow: 0 12px 30px rgba(37, 99, 235, 0.25);
	}

	.btn-primary:hover:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: 0 16px 40px rgba(37, 99, 235, 0.3);
	}

	.btn-secondary {
		background: #eef2f7;
		color: #0f172a;
	}

	.btn-secondary:hover {
		background: #e2e8f0;
	}

	.forms-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
		gap: 1rem;
	}

	.form-card {
		background: linear-gradient(145deg, #ffffff, #f8fafc);
		border: 1px solid #e2e8f0;
		border-radius: 14px;
		padding: 1.4rem 1.2rem;
		transition: all 0.2s ease;
		box-shadow: 0 10px 30px rgba(148, 163, 184, 0.15);
	}

	.form-card:hover {
		border-color: #cbd5e0;
		transform: translateY(-3px);
		box-shadow: 0 16px 40px rgba(148, 163, 184, 0.28);
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
		font-weight: 700;
		color: #0f172a;
		font-size: 1.1rem;
	}

	.form-description {
		color: #475569;
		margin-bottom: 1rem;
		font-size: 0.95rem;
		line-height: 1.5;
	}

	.form-meta {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		font-size: 0.9rem;
		color: #475569;
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
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.15s ease;
		color: #475569;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.btn-icon:hover {
		background: #eef2f7;
		border-color: #cbd5e0;
		color: #2563eb;
		transform: translateY(-1px);
	}

	.btn-icon-danger:hover {
		color: #dc2626;
		border-color: #fecdd3;
		background: #fef2f2;
	}

	.status-pill {
		padding: 0.25rem 0.625rem;
		border-radius: 8px;
		font-size: 0.8rem;
		font-weight: 700;
		background: #f1f5f9;
		color: #475569;
	}

	.status-pill.inactive {
		background: #fef3c7;
		color: #92400e;
	}

	.empty-state {
		text-align: center;
		padding: 3.5rem 1rem;
		color: #475569;
		background: #f8fafc;
		border: 1px dashed #e2e8f0;
		border-radius: 14px;
	}

	.empty-icon {
		margin: 0 auto 1.25rem;
		color: #cbd5e0;
	}

	.empty-state p {
		margin: 0.35rem 0;
		font-size: 1rem;
	}

	.empty-state p:first-of-type {
		font-weight: 600;
		color: #0f172a;
	}

	.empty-hint {
		font-size: 0.95rem;
		color: #475569;
	}

	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(15, 23, 42, 0.35);
		backdrop-filter: blur(6px);
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
		border-radius: 16px;
		padding: 2rem;
		max-width: 520px;
		width: 92%;
		max-height: 90vh;
		overflow-y: auto;
		box-shadow: 0 24px 70px rgba(15, 23, 42, 0.35);
		animation: slideUp 0.2s ease;
		border: 1px solid #e2e8f0;
	}

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(16px);
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
		font-weight: 700;
	}

	.btn-close {
		background: none;
		border: none;
		cursor: pointer;
		color: #475569;
		padding: 0.375rem;
		border-radius: 8px;
		transition: all 0.15s ease;
		display: flex;
		align-items: center;
	}

	.btn-close:hover {
		background: #f1f5f9;
		color: #0f172a;
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 600;
		color: #0f172a;
		font-size: 0.95rem;
	}

	input[type='text'],
	textarea {
		width: 100%;
		padding: 0.8rem 0.85rem;
		border: 1px solid #e2e8f0;
		border-radius: 10px;
		box-sizing: border-box;
		font-family: inherit;
		font-size: 0.95rem;
		transition: all 0.15s ease;
		background: #f8fafc;
	}

	input[type='text']:focus,
	textarea:focus {
		outline: none;
		border-color: #6366f1;
		box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.18);
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
		.page-header {
			flex-direction: column;
			gap: 1rem;
			align-items: flex-start;
		}

		h1 {
			font-size: 1.8rem;
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
