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

		// CSV header
		const headers = ['Submission ID', 'Submitted At', 'User ID', ...fields.map((f) => f.label)];
		const csvRows = [headers.join(',')];

		// CSV data
		submissions.forEach((sub) => {
			const row = [
				sub.id,
				formatDate(sub.created_at),
				sub.avatar_id,
				...fields.map((f) => {
					const value = sub.data[f.id] || '';
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
				← Back to Forms
			</a>
		</div>
	</header>

	<section class="card">
		<div class="section-header">
			<h2>All Submissions</h2>
			<div class="export-buttons">
				<button class="btn btn-secondary" onclick={exportToCSV} disabled={submissions.length === 0}>
					📊 Export CSV
				</button>
				<button class="btn btn-secondary" onclick={exportToJSON} disabled={submissions.length === 0}>
					📄 Export JSON
				</button>
			</div>
		</div>

		{#if submissions.length > 0}
			<div class="submissions-list">
				{#each submissions as submission}
					<div class="submission-card">
						<div class="submission-header">
							<div>
								<strong>Submission #{submission.id}</strong>
								<span class="meta">by {submission.avatar_id}</span>
							</div>
							<span class="date">{formatDate(submission.created_at)}</span>
						</div>
						<div class="submission-body">
							{#each fields as field}
								<div class="response-item">
									<div class="response-label">{field.label}</div>
									<div class="response-value">
										{#if Array.isArray(submission.data[field.id])}
											{submission.data[field.id].join(', ') || '-'}
										{:else}
											{submission.data[field.id] || '-'}
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
				<div class="empty-icon">📭</div>
				<p>No submissions yet</p>
				<p class="empty-hint">Submissions will appear here once users fill out the form</p>
			</div>
		{/if}
	</section>
</div>

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

	.export-buttons {
		display: flex;
		gap: 0.5rem;
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

	.btn-secondary {
		background: #e2e8f0;
		color: #2d3748;
	}

	.btn-secondary:hover:not(:disabled) {
		background: #cbd5e0;
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.submissions-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.submission-card {
		background: #f7fafc;
		border: 2px solid #e2e8f0;
		border-radius: 12px;
		padding: 1.5rem;
		transition: all 0.2s;
	}

	.submission-card:hover {
		border-color: #cbd5e0;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.submission-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid #e2e8f0;
	}

	.meta {
		margin-left: 0.75rem;
		color: #718096;
		font-size: 0.9rem;
	}

	.date {
		color: #718096;
		font-size: 0.9rem;
	}

	.submission-body {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1rem;
	}

	.response-item {
		padding: 0.75rem;
		background: white;
		border-radius: 8px;
		border: 1px solid #e2e8f0;
	}

	.response-label {
		font-weight: 600;
		color: #4a5568;
		font-size: 0.85rem;
		margin-bottom: 0.5rem;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.response-value {
		color: #2d3748;
		font-size: 1rem;
		word-wrap: break-word;
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
