<script>
	import { onMount } from 'svelte';

	export let data;

	const { user, forms, token } = data;

	let brandColor = '#2563eb';

	onMount(() => {
		try {
			const payload = JSON.parse(atob(token.split('.')[1]));
			brandColor = payload?.ui?.color || brandColor;
		} catch (err) {
			console.warn('No se pudo leer ui.color del token', err);
		}
	});
</script>

<svelte:head>
	<title>Formularios disponibles</title>
</svelte:head>

<div class="page" style={`--accent:${brandColor};`}>
	<header class="header">
		<div>
			<p class="eyebrow">{user.avatar_name} · {user.domain_name}</p>
			<h1>Formularios activos</h1>
			<p class="subtitle">Selecciona y completa en pocos clics.</p>
		</div>
		<div class="pill">
			<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<polyline points="4 12 9 17 20 6"></polyline>
			</svg>
			<span>{forms?.length || 0} disponibles</span>
		</div>
	</header>

	<section class="panel">
		{#if forms && forms.length > 0}
			<div class="forms">
				{#each forms as form}
					<a href="/form/{form.hashid}?token={token}" class="form-card">
						<div>
							<div class="form-title">{form.title}</div>
							{#if form.description}
								<div class="form-desc">{form.description}</div>
							{/if}
						</div>
						<div class="cta">
							<span>Rellenar</span>
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<polyline points="9 18 15 12 9 6"></polyline>
							</svg>
						</div>
					</a>
				{/each}
			</div>
		{:else}
			<div class="empty">
				<div class="icon">
					<svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
						<rect x="3" y="4" width="18" height="16" rx="2"></rect>
						<path d="M7 9h10M7 13h6"></path>
						<polyline points="3 8 12 13 21 8"></polyline>
					</svg>
				</div>
				<p class="empty-title">Sin formularios activos</p>
				<p class="empty-sub">Cuando haya uno disponible aparecerá aquí.</p>
			</div>
		{/if}
	</section>
</div>

<style>
	:global(body) {
		background: #ffffff;
		margin: 0;
		padding: 1.5rem 1rem 2rem;
		font-family: 'Inter', system-ui, -apple-system, sans-serif;
		color: #0f172a;
	}

	.page {
		max-width: 900px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
	}

	.eyebrow {
		margin: 0;
		font-weight: 600;
		color: #475569;
		font-size: 0.95rem;
	}

	h1 {
		margin: 0.25rem 0 0.35rem;
		font-size: 2rem;
		letter-spacing: -0.02em;
	}

	.subtitle {
		margin: 0;
		color: #64748b;
	}

	.pill {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		padding: 0.55rem 0.9rem;
		border-radius: 10px;
		background: color-mix(in srgb, var(--accent) 15%, white);
		color: #0f172a;
		font-weight: 700;
		border: 1px solid color-mix(in srgb, var(--accent) 35%, #e2e8f0);
		white-space: nowrap;
	}

	.panel {
		background: #ffffff;
		border: 1px solid #e2e8f0;
		border-radius: 14px;
		padding: 1rem;
		box-shadow: 0 14px 40px rgba(15, 23, 42, 0.08);
	}

	.forms {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.form-card {
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		padding: 0.9rem 1rem;
		text-decoration: none;
		color: inherit;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.75rem;
		transition: border-color 0.15s ease, box-shadow 0.2s ease, transform 0.15s ease;
	}

	.form-card:hover {
		border-color: var(--accent);
		box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
		transform: translateY(-2px);
	}

	.form-title {
		font-weight: 700;
		font-size: 1.05rem;
		margin-bottom: 0.15rem;
	}

	.form-desc {
		color: #475569;
		font-size: 0.95rem;
	}

	.cta {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.5rem 0.8rem;
		border-radius: 10px;
		background: var(--accent);
		color: #fff;
		font-weight: 700;
		border: 1px solid var(--accent);
	}

	.empty {
		text-align: center;
		padding: 2.5rem 1rem;
		color: #475569;
	}

	.icon {
		display: grid;
		place-items: center;
		width: 72px;
		height: 72px;
		border-radius: 50%;
		border: 1px solid #e2e8f0;
		margin: 0 auto 1rem;
		background: #f8fafc;
	}

	.empty-title {
		margin: 0;
		font-weight: 700;
		color: #0f172a;
	}

	.empty-sub {
		margin: 0.35rem 0 0;
		color: #64748b;
	}

	@media (max-width: 768px) {
		.header {
			flex-direction: column;
		}

		h1 {
			font-size: 1.7rem;
		}
	}
</style>
