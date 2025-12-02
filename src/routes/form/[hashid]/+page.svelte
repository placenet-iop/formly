<script>
	import { onMount } from 'svelte';
	import { enhance } from '$app/forms';

	export let data;
	export let form;

	let formData = null;
	let fields = [];
	let message = '';
	let messageType = '';
	let submitted = false;
	let errors = {};
	let values = {};
	let brandColor = '#2563eb';

	onMount(() => {
		try {
			const payload = JSON.parse(atob(data.token.split('.')[1]));
			brandColor = payload?.ui?.color || brandColor;
		} catch (err) {
			console.warn('No se pudo leer ui.color del token', err);
		}

		if (data) {
			formData = data.form;
			fields = data.form.fields || [];
		}

		if (form) {
			if (form.message) {
				message = form.message;
				messageType = form.messageType;
			}
			if (form.submitted) {
				submitted = true;
			}
			if (form.errors) {
				errors = form.errors;
			}
			if (form.values) {
				values = form.values;
			}
		}
	});

	$: {
		if (form) {
			if (form.message) {
				message = form.message;
				messageType = form.messageType;
			}
			if (form.submitted) {
				submitted = true;
			}
			if (form.errors) {
				errors = form.errors;
			}
			if (form.values) {
				values = form.values;
			}
		}
	}

	function getFieldValue(fieldId) {
		return values[fieldId] || '';
	}

	function hasError(fieldId) {
		return errors[fieldId] !== undefined;
	}

	function getError(fieldId) {
		return errors[fieldId] || '';
	}
</script>

<svelte:head>
	<title>{formData?.title || 'Form'}</title>
</svelte:head>

<div class="container" style={`--accent:${brandColor};`}>
	{#if submitted}
		<div class="success-screen">
			<div class="success-icon">
				<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<circle cx="12" cy="12" r="10"></circle>
					<polyline points="8 12.5 11 15.5 16 9"></polyline>
				</svg>
			</div>
			<h1>¡Respuesta enviada!</h1>
			<p class="success-message">Gracias por tu tiempo. Hemos recibido tus datos correctamente.</p>
		</div>
	{:else}
		<div class="form-wrapper">
			<header class="form-header">
				<h1>{formData?.title || 'Form'}</h1>
				{#if formData?.description}
					<p class="form-description">{formData.description}</p>
				{/if}
			</header>

			{#if message && !submitted}
				<div class="alert {messageType}">
					<div class="alert-icon">
						{#if messageType === 'success'}
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<polyline points="4 12 9 17 20 6"></polyline>
							</svg>
						{:else}
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<circle cx="12" cy="12" r="10"></circle>
								<line x1="12" y1="8" x2="12" y2="12"></line>
								<line x1="12" y1="16" x2="12.01" y2="16"></line>
							</svg>
						{/if}
					</div>
					<span>{message}</span>
				</div>
			{/if}

			<form
				method="POST"
				action="?/submit{data.token ? `&token=${data.token}` : ''}"
				use:enhance={() => {
					message = '';
					messageType = '';
					errors = {};
					return async ({ update }) => {
						await update({ reset: false });
					};
				}}
			>
				<div class="fields-container">
					{#each fields as field}
						{#if field.type === 'title'}
							<div class="display-title">
								{field.label}
							</div>
						{:else if field.type === 'description'}
							<div class="display-description">
								{field.label}
							</div>
						{:else}
							<div class="form-field" class:has-error={hasError(field.id)}>
								<label for="field-{field.id}" class="field-label">
									{field.label}
									{#if field.required}
										<span class="required">Requerido</span>
									{/if}
								</label>

								{#if field.type === 'text' || field.type === 'email' || field.type === 'number' || field.type === 'tel'}
								<input
									type={field.type}
									id="field-{field.id}"
									name="field_{field.id}"
									placeholder={field.placeholder || ''}
									required={field.required}
									value={getFieldValue(field.id)}
									class="field-input"
								/>
							{:else if field.type === 'date'}
								<input
									type="date"
									id="field-{field.id}"
									name="field_{field.id}"
									required={field.required}
									value={getFieldValue(field.id)}
									class="field-input"
								/>
							{:else if field.type === 'textarea'}
								<textarea
									id="field-{field.id}"
									name="field_{field.id}"
									placeholder={field.placeholder || ''}
									required={field.required}
									rows="5"
									class="field-input"
									value={getFieldValue(field.id)}
								></textarea>
							{:else if field.type === 'select'}
								<select
									id="field-{field.id}"
									name="field_{field.id}"
									required={field.required}
									class="field-input"
								>
									<option value="">Selecciona una opción...</option>
									{#each field.options || [] as option}
										<option value={option.value || option} selected={getFieldValue(field.id) === (option.value || option)}>
											{option.value || option}
										</option>
									{/each}
								</select>
							{:else if field.type === 'radio'}
								<div class="options-group">
									{#each field.options || [] as option, idx}
										<label class="option-label">
											<input
												type="radio"
												name="field_{field.id}"
												value={option.value || option}
												required={field.required}
												checked={getFieldValue(field.id) === (option.value || option)}
											/>
											<span>{option.value || option}</span>
										</label>
									{/each}
								</div>
							{:else if field.type === 'checkbox'}
								<div class="options-group">
									{#each field.options || [] as option, idx}
										<label class="option-label">
											<input
												type="checkbox"
												name="field_{field.id}"
												value={option.value || option}
												checked={Array.isArray(getFieldValue(field.id)) && getFieldValue(field.id).includes(option.value || option)}
											/>
											<span>{option.value || option}</span>
										</label>
									{/each}
								</div>
							{:else if field.type === 'media'}
								{#if field.mediaType === 'upload'}
									<input
										type="file"
										id="field-{field.id}"
										name="field_{field.id}"
										required={field.required}
										accept="image/*,video/*"
										class="field-input"
									/>
								{:else}
									<input
										type="url"
										id="field-{field.id}"
										name="field_{field.id}"
										placeholder={field.placeholder || 'https://youtube.com/...'}
										required={field.required}
										value={getFieldValue(field.id)}
										class="field-input"
									/>
								{/if}
							{/if}

								{#if hasError(field.id)}
									<div class="field-error">{getError(field.id)}</div>
								{/if}
							</div>
						{/if}
					{/each}
				</div>

				<div class="submit-section">
					<button type="submit" class="btn-submit">
						<span>Enviar respuesta</span>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<line x1="5" y1="12" x2="19" y2="12"></line>
							<polyline points="12 5 19 12 12 19"></polyline>
						</svg>
					</button>
				</div>
			</form>
		</div>
	{/if}
</div>

<style>
	:global(body) {
		background: #ffffff;
		min-height: 100vh;
		margin: 0;
		padding: 2rem 1rem 2.5rem;
		font-family: 'Inter', system-ui, -apple-system, sans-serif;
		color: #0f172a;
	}

	.container {
		max-width: 820px;
		margin: 0 auto;
	}

	.form-wrapper {
		background: #ffffff;
		border-radius: 16px;
		padding: 2rem 1.75rem;
		box-shadow: 0 16px 50px rgba(15, 23, 42, 0.12);
		border: 1px solid #e2e8f0;
	}

	.form-header {
		margin-bottom: 1.5rem;
	}

	.pill {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.45rem 0.85rem;
		border-radius: 999px;
		background: color-mix(in srgb, var(--accent) 12%, white);
		border: 1px solid color-mix(in srgb, var(--accent) 25%, #e2e8f0);
		color: #0f172a;
		font-weight: 700;
		font-size: 0.92rem;
	}

	h1 {
		font-size: 2.1rem;
		margin: 0.5rem 0 0.35rem;
		color: #0f172a;
		letter-spacing: -0.02em;
	}

	.form-description {
		font-size: 1rem;
		color: #475569;
		margin: 0;
		line-height: 1.6;
	}

	.alert {
		background: #ecfdf3;
		padding: 0.9rem 1rem;
		border-radius: 12px;
		margin-bottom: 1.25rem;
		display: flex;
		align-items: center;
		gap: 0.65rem;
		border: 1px solid #bbf7d0;
		color: #166534;
	}

	.alert.error {
		background: #fef2f2;
		border-color: #fecdd3;
		color: #991b1b;
	}

	.alert-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border-radius: 10px;
		background: #f8fafc;
		color: inherit;
	}

	.fields-container {
		display: flex;
		flex-direction: column;
		gap: 1.1rem;
	}

	.display-title {
		font-size: 1.5rem;
		font-weight: 700;
		color: #0f172a;
		margin: 0.75rem 0;
		letter-spacing: -0.01em;
	}

	.display-description {
		font-size: 1rem;
		color: #475569;
		line-height: 1.6;
		margin: 0.5rem 0;
	}

	.form-field {
		display: flex;
		flex-direction: column;
		padding: 0.9rem 1rem 1.05rem;
		border-radius: 12px;
		border: 1px solid #e2e8f0;
		background: #f8fafc;
	}

	.form-field.has-error {
		border-color: #ef4444;
		background: #fef2f2;
	}

	.field-label {
		font-weight: 700;
		color: #0f172a;
		margin-bottom: 0.5rem;
		font-size: 1rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.required {
		color: #b91c1c;
		font-size: 0.8rem;
		background: #fee2e2;
		padding: 0.2rem 0.45rem;
		border-radius: 999px;
		border: 1px solid #fecdd3;
	}

	.field-input {
		padding: 0.85rem 0.9rem;
		border: 1px solid #e2e8f0;
		border-radius: 10px;
		font-family: inherit;
		font-size: 1rem;
		transition: all 0.2s;
		background: #ffffff;
		color: #0f172a;
	}

	.field-input:focus {
		outline: none;
		border-color: var(--accent);
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 25%, transparent);
	}

	textarea.field-input {
		resize: vertical;
		min-height: 120px;
	}

	select.field-input {
		cursor: pointer;
	}

	.options-group {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		padding-top: 0.25rem;
	}

	.option-label {
		display: flex;
		align-items: center;
		gap: 0.65rem;
		padding: 0.7rem 0.85rem;
		background: #ffffff;
		border: 1px solid #e2e8f0;
		border-radius: 10px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.option-label:hover {
		border-color: var(--accent);
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 20%, transparent);
	}

	.option-label input {
		cursor: pointer;
		width: 1.1rem;
		height: 1.1rem;
	}

	.option-label span {
		flex: 1;
		font-size: 1rem;
		color: #0f172a;
	}

	.field-error {
		color: #b91c1c;
		font-size: 0.92rem;
		margin-top: 0.5rem;
		font-weight: 600;
	}

	.submit-section {
		margin-top: 1.75rem;
		text-align: center;
	}

	.btn-submit {
		background: var(--accent);
		color: white;
		padding: 0.95rem 1.4rem;
		border: none;
		border-radius: 12px;
		font-size: 1rem;
		font-weight: 700;
		cursor: pointer;
		box-shadow: 0 14px 40px color-mix(in srgb, var(--accent) 35%, transparent);
		transition: all 0.2s ease;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
	}

	.btn-submit:hover {
		transform: translateY(-2px);
		box-shadow: 0 18px 48px color-mix(in srgb, var(--accent) 45%, transparent);
	}

	.btn-submit:active {
		transform: translateY(0);
	}

	.success-screen {
		background: #ffffff;
		border-radius: 16px;
		padding: 3rem 2.5rem;
		box-shadow: 0 16px 60px rgba(15, 23, 42, 0.14);
		text-align: center;
		border: 1px solid #e2e8f0;
	}

	.success-icon {
		width: 96px;
		height: 96px;
		margin: 0 auto 1.25rem;
		border-radius: 50%;
		border: 1px solid color-mix(in srgb, var(--accent) 35%, transparent);
		background: color-mix(in srgb, var(--accent) 12%, white);
		display: grid;
		place-items: center;
		color: var(--accent);
	}

	.success-screen h1 {
		color: #0f172a;
		margin-bottom: 0.5rem;
	}

	.success-message {
		font-size: 1.05rem;
		color: #475569;
		line-height: 1.6;
		margin: 0;
	}

	@media (max-width: 768px) {
		:global(body) {
			padding: 1.25rem 1rem 2rem;
		}

		.form-wrapper,
		.success-screen {
			padding: 1.5rem 1.25rem;
		}

		h1 {
			font-size: 1.75rem;
		}

		.btn-submit {
			width: 100%;
			justify-content: center;
		}
	}
</style>
