<script>
	import { onMount } from 'svelte';

	export let data;

	let form = null;
	let submissions = [];
	let fields = [];

	onMount(() => {
		if (data) {
			form = data.form;
			submissions = data.submissions || [];
			fields = data.form.fields || [];
		}
	});

	function formatDate(date) {
		if (!date) return '';
		return new Date(date).toLocaleDateString() + ' ' + new Date(date).toLocaleTimeString();
	}

	function exportToCSV() {
		if (submissions.length === 0) return;

		// CSV header with user metadata fields
		const headers = [
			'Submission ID',
			'Submitted At',
			'User Name',
			'Email',
			'Phone',
			...fields.map((f) => f.label)
		];
		const csvRows = [headers.join(',')];

		// CSV data
		submissions.forEach((sub) => {
			const formData = sub.data.formData || sub.data; // Handle both new and old format
			const userMeta = sub.data.userMetadata || {};

			const row = [
				sub.id,
				formatDate(sub.created_at),
				userMeta.label || userMeta.avatar_name || sub.avatar_id,
				userMeta.email || '',
				userMeta.phone || '',
				...fields.map((f) => {
					const value = formData[f.id] || '';
					// Escape commas and quotes
					if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
						return `"${value.replace(/"/g, '""')}"`;
					}
					return value;
				})
			];
			csvRows.push(row.join(','));
		});

		// Download CSV
		const csvContent = csvRows.join('\n');
		const blob = new Blob([csvContent], { type: 'text/csv' });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${form.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_submissions_${Date.now()}.csv`;
		a.click();
		window.URL.revokeObjectURL(url);
	}

	function exportToJSON() {
		if (submissions.length === 0) return;

		const jsonContent = JSON.stringify(submissions, null, 2);
		const blob = new Blob([jsonContent], { type: 'application/json' });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${form.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_submissions_${Date.now()}.json`;
		a.click();
		window.URL.revokeObjectURL(url);
	}
</script>

<svelte:head>
	<title>Submissions - {form?.title || 'Form'}</title>
</svelte:head>

<div class="container">
	<header>
		<div class="header-content">
			<div>
				<h1>{form?.title || 'Form'} - Submissions</h1>
				<p class="subtitle">{submissions.length} {submissions.length === 1 ? 'submission' : 'submissions'}</p>
			</div>
			<a href="/.well-known/placenet/admin?token={data.token}" class="btn btn-secondary">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<polyline points="15 18 9 12 15 6"></polyline>
					<line x1="9" y1="12" x2="21" y2="12"></line>
				</svg>
				Back to Forms
			</a>
		</div>
	</header>

	<section class="card">
		<div class="section-header">
			<h2>All Submissions</h2>
			<div class="export-buttons">
				<button class="btn btn-secondary" onclick={exportToCSV} disabled={submissions.length === 0}>
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<rect x="3" y="4" width="18" height="16" rx="2"></rect>
						<path d="M7 9h10M7 13h6M9 17h6"></path>
					</svg>
					Export CSV
				</button>
				<button class="btn btn-secondary" onclick={exportToJSON} disabled={submissions.length === 0}>
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M7 3h8l5 5v13a1 1 0 0 1-1 1H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"></path>
						<path d="M7 8h7V3"></path>
					</svg>
					Export JSON
				</button>
			</div>
		</div>

		{#if submissions.length > 0}
			<div class="submissions-list">
				{#each submissions as submission}
					{@const userMeta = submission.data.userMetadata || {}}
					{@const formData = submission.data.formData || submission.data}
					<div class="submission-card">
						<div class="submission-header">
							<div class="user-info">
								{#if userMeta.avatar_image}
									<img src={userMeta.avatar_image} alt={userMeta.label || userMeta.avatar_name} class="avatar" />
								{/if}
								<div>
									<strong>Submission #{submission.id}</strong>
									<div class="user-details">
										<span class="user-name">{userMeta.label || userMeta.avatar_name || submission.avatar_id}</span>
										{#if userMeta.email}
											<span class="meta">
												<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
													<path d="M4 4h16v16H4z"></path>
													<polyline points="4 4 12 12 20 4"></polyline>
												</svg>
												{userMeta.email}
											</span>
										{/if}
										{#if userMeta.phone}
											<span class="meta">
												<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
													<path d="M5 4h4l2 5-3 2a11 11 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"></path>
												</svg>
												{userMeta.phone}
											</span>
										{/if}
									</div>
								</div>
							</div>
							<span class="date">{formatDate(submission.created_at)}</span>
						</div>
						<div class="submission-body">
							{#each fields as field}
								<div class="response-item">
									<div class="response-label">{field.label}</div>
									<div class="response-value">
										{#if Array.isArray(formData[field.id])}
											{formData[field.id].join(', ') || '-'}
										{:else}
											{formData[field.id] || '-'}
										{/if}
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="empty-state">
				<div class="empty-icon">
					<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
						<rect x="3" y="4" width="18" height="16" rx="2"></rect>
						<path d="M7 9h10M7 13h6"></path>
						<polyline points="3 8 12 13 21 8"></polyline>
					</svg>
				</div>
				<p class="empty-title">No submissions yet</p>
				<p class="empty-hint">Recibirás las respuestas aquí en cuanto los usuarios completen el formulario.</p>
			</div>
		{/if}
	</section>
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');

	:global(body) {
		background: radial-gradient(circle at 12% 12%, rgba(59, 130, 246, 0.1), transparent 22%),
			radial-gradient(circle at 80% 0%, rgba(16, 185, 129, 0.12), transparent 18%),
			linear-gradient(180deg, #f7f9fb 0%, #eef2f7 35%, #f7f9fb 100%);
		min-height: 100vh;
		margin: 0;
		padding: 2.25rem 1rem 2.5rem;
		font-family: 'Space Grotesk', 'Inter', system-ui, -apple-system, sans-serif;
		color: #0f172a;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
	}

	header {
		margin-bottom: 1.75rem;
	}

	.header-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	h1 {
		font-size: 2rem;
		margin: 0 0 0.35rem 0;
		color: #0f172a;
	}

	.subtitle {
		font-size: 1rem;
		color: #475569;
		margin: 0;
		font-weight: 600;
	}

	.card {
		background: rgba(255, 255, 255, 0.9);
		border-radius: 18px;
		padding: 1.75rem;
		margin-bottom: 1.5rem;
		box-shadow: 0 22px 70px rgba(15, 23, 42, 0.12);
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

	.export-buttons {
		display: flex;
		gap: 0.5rem;
	}

	.btn {
		padding: 0.7rem 1.4rem;
		border: none;
		border-radius: 10px;
		cursor: pointer;
		font-size: 0.95rem;
		font-weight: 700;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		transition: all 0.2s;
		text-decoration: none;
	}

	.btn-secondary {
		background: #eef2f7;
		color: #0f172a;
	}

	.btn-secondary:hover:not(:disabled) {
		background: #e2e8f0;
		box-shadow: 0 12px 30px rgba(148, 163, 184, 0.25);
	}

	.btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		box-shadow: none;
	}

	.submissions-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.submission-card {
		background: #fff;
		border: 1px solid #e2e8f0;
		border-radius: 14px;
		padding: 1.4rem;
		transition: all 0.2s;
		box-shadow: 0 14px 40px rgba(148, 163, 184, 0.18);
	}

	.submission-card:hover {
		border-color: #cbd5e0;
		box-shadow: 0 18px 48px rgba(148, 163, 184, 0.22);
		transform: translateY(-2px);
	}

	.submission-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 1rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid #e2e8f0;
	}

	.user-info {
		display: flex;
		align-items: flex-start;
		gap: 1rem;
	}

	.avatar {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		object-fit: cover;
		border: 2px solid #e2e8f0;
	}

	.user-details {
		margin-top: 0.25rem;
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		align-items: center;
	}

	.user-name {
		font-weight: 700;
		color: #0f172a;
		font-size: 0.95rem;
	}

	.meta {
		color: #475569;
		font-size: 0.9rem;
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
	}

	.date {
		color: #475569;
		font-size: 0.9rem;
		white-space: nowrap;
	}

	.submission-body {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 0.9rem;
	}

	.response-item {
		padding: 0.85rem;
		background: #f8fafc;
		border-radius: 10px;
		border: 1px solid #e2e8f0;
	}

	.response-label {
		font-weight: 700;
		color: #0f172a;
		font-size: 0.85rem;
		margin-bottom: 0.4rem;
		text-transform: uppercase;
		letter-spacing: 0.6px;
	}

	.response-value {
		color: #0f172a;
		font-size: 1rem;
		word-wrap: break-word;
	}

	.empty-state {
		text-align: center;
		padding: 3rem 1rem;
		color: #475569;
		background: #f8fafc;
		border: 1px dashed #e2e8f0;
		border-radius: 14px;
	}

	.empty-icon {
		font-size: 4rem;
		margin-bottom: 1rem;
		opacity: 0.8;
		color: #cbd5e0;
	}

	.empty-title {
		margin: 0;
		font-weight: 700;
		color: #0f172a;
	}

	.empty-state p {
		margin: 0.4rem 0;
	}

	.empty-hint {
		font-size: 0.95rem;
		color: #475569;
	}

	@media (max-width: 768px) {
		.header-content {
			flex-direction: column;
			align-items: stretch;
			gap: 1rem;
		}

		.section-header {
			flex-direction: column;
			align-items: stretch;
			gap: 1rem;
		}

		.export-buttons {
			flex-direction: column;
		}

		.submission-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.5rem;
		}

		.submission-body {
			grid-template-columns: 1fr;
		}
	}
</style>
