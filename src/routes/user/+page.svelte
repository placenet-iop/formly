<script>
	export let data;

	const { user, forms, token } = data;
</script>

<svelte:head>
	<title>Available Forms</title>
</svelte:head>

<div class="container">
	<header>
		<h1>Available Forms</h1>
		<p class="subtitle">Welcome, {user.avatar_name} @ {user.domain_name}</p>
	</header>

	<section class="card">
		{#if forms && forms.length > 0}
			<div class="forms-grid">
				{#each forms as form}
					<a href="/form/{form.hashid}?token={token}" class="form-card">
						<div class="form-info">
							<div class="form-title">{form.title}</div>
							{#if form.description}
								<div class="form-description">{form.description}</div>
							{/if}
						</div>
						<div class="form-arrow">→</div>
					</a>
				{/each}
			</div>
		{:else}
			<div class="empty-state">
				<div class="empty-icon">📝</div>
				<p>No forms available</p>
				<p class="empty-hint">There are currently no active forms for your domain</p>
			</div>
		{/if}
	</section>
</div>

<style>
	:global(body) {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		min-height: 100vh;
		margin: 0;
		padding: 2rem 1rem;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
	}

	.container {
		max-width: 800px;
		margin: 0 auto;
	}

	header {
		text-align: center;
		margin-bottom: 2rem;
		color: white;
	}

	h1 {
		font-size: 2.5rem;
		margin: 0 0 0.5rem 0;
		font-weight: 700;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	}

	.subtitle {
		font-size: 1.1rem;
		margin: 0;
		opacity: 0.9;
	}

	.card {
		background: white;
		border-radius: 12px;
		padding: 2rem;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
	}

	.forms-grid {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.form-card {
		background: #f7fafc;
		border: 2px solid #e2e8f0;
		border-radius: 12px;
		padding: 1.5rem;
		transition: all 0.2s;
		text-decoration: none;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.form-card:hover {
		border-color: #667eea;
		background: white;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		transform: translateX(5px);
	}

	.form-info {
		flex: 1;
	}

	.form-title {
		font-weight: 600;
		color: #2d3748;
		font-size: 1.2rem;
		margin-bottom: 0.5rem;
	}

	.form-description {
		color: #718096;
		font-size: 0.95rem;
	}

	.form-arrow {
		font-size: 1.5rem;
		color: #667eea;
		transition: transform 0.2s;
	}

	.form-card:hover .form-arrow {
		transform: translateX(5px);
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
		h1 {
			font-size: 2rem;
		}

		.card {
			padding: 1.5rem;
		}
	}
</style>
