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

	onMount(() => {
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

	// Get option value (handles both old string format and new object format)
	function getOptionValue(option) {
		if (typeof option === 'string') {
			return option;
		}
		return option?.value || '';
	}
</script>

<svelte:head>
	<title>{formData?.title || 'Form'}</title>
</svelte:head>

<div class="container">
	{#if submitted}
		<div class="success-screen">
			<div class="success-icon">✅</div>
			<h1>Thank you!</h1>
			<p class="success-message">Your response has been submitted successfully.</p>
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
					<span class="alert-icon">{messageType === 'success' ? '✓' : '⚠'}</span>
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
						<div class="form-field" class:has-error={hasError(field.id)}>
							<label for="field-{field.id}" class="field-label">
								{field.label}
								{#if field.required}
									<span class="required">*</span>
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
									<option value="">Select an option...</option>
									{#each field.options || [] as option}
										{@const optionValue = getOptionValue(option)}
										<option value={optionValue} selected={getFieldValue(field.id) === optionValue}>
											{optionValue}
										</option>
									{/each}
								</select>
							{:else if field.type === 'radio'}
								<div class="options-group">
									{#each field.options || [] as option, idx}
										{@const optionValue = getOptionValue(option)}
										<label class="option-label">
											<input
												type="radio"
												name="field_{field.id}"
												value={optionValue}
												required={field.required}
												checked={getFieldValue(field.id) === optionValue}
											/>
											<span>{optionValue}</span>
										</label>
									{/each}
								</div>
							{:else if field.type === 'checkbox'}
								<div class="options-group">
									{#each field.options || [] as option, idx}
										{@const optionValue = getOptionValue(option)}
										<label class="option-label">
											<input
												type="checkbox"
												name="field_{field.id}"
												value={optionValue}
												checked={Array.isArray(getFieldValue(field.id)) && getFieldValue(field.id).includes(optionValue)}
											/>
											<span>{optionValue}</span>
										</label>
									{/each}
								</div>
							{/if}

							{#if hasError(field.id)}
								<div class="field-error">{getError(field.id)}</div>
							{/if}
						</div>
					{/each}
				</div>

				<div class="submit-section">
					<button type="submit" class="btn-submit">
						Submit
					</button>
				</div>
			</form>
		</div>
	{/if}
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
		max-width: 700px;
		margin: 0 auto;
	}

	.form-wrapper {
		background: white;
		border-radius: 16px;
		padding: 3rem;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
	}

	.form-header {
		margin-bottom: 2rem;
		text-align: center;
	}

	h1 {
		font-size: 2.5rem;
		margin: 0 0 1rem 0;
		color: #2d3748;
	}

	.form-description {
		font-size: 1.1rem;
		color: #718096;
		margin: 0;
		line-height: 1.6;
	}

	.alert {
		background: white;
		padding: 1rem 1.25rem;
		border-radius: 12px;
		margin-bottom: 2rem;
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

	.fields-container {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.form-field {
		display: flex;
		flex-direction: column;
	}

	.form-field.has-error .field-input {
		border-color: #e53e3e;
	}

	.field-label {
		font-weight: 600;
		color: #2d3748;
		margin-bottom: 0.75rem;
		font-size: 1.1rem;
	}

	.required {
		color: #e53e3e;
		margin-left: 0.25rem;
	}

	.field-input {
		padding: 1rem;
		border: 2px solid #e2e8f0;
		border-radius: 12px;
		font-family: inherit;
		font-size: 1rem;
		transition: all 0.2s;
		background: white;
	}

	.field-input:focus {
		outline: none;
		border-color: #667eea;
		box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
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
		gap: 0.75rem;
		padding: 0.5rem 0;
	}

	.option-label {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		background: #f7fafc;
		border: 2px solid #e2e8f0;
		border-radius: 10px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.option-label:hover {
		background: white;
		border-color: #cbd5e0;
	}

	.option-label input {
		cursor: pointer;
		width: 1.2rem;
		height: 1.2rem;
	}

	.option-label span {
		flex: 1;
		font-size: 1rem;
		color: #2d3748;
	}

	.field-error {
		color: #e53e3e;
		font-size: 0.9rem;
		margin-top: 0.5rem;
		font-weight: 500;
	}

	.submit-section {
		margin-top: 3rem;
		text-align: center;
	}

	.btn-submit {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		padding: 1.25rem 4rem;
		border: none;
		border-radius: 50px;
		font-size: 1.2rem;
		font-weight: 700;
		cursor: pointer;
		box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
		transition: all 0.3s;
		text-transform: uppercase;
		letter-spacing: 1px;
	}

	.btn-submit:hover {
		transform: translateY(-2px);
		box-shadow: 0 15px 40px rgba(102, 126, 234, 0.5);
	}

	.btn-submit:active {
		transform: translateY(0);
	}

	.success-screen {
		background: white;
		border-radius: 16px;
		padding: 4rem 3rem;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
		text-align: center;
	}

	.success-icon {
		font-size: 6rem;
		margin-bottom: 1.5rem;
		animation: bounce 0.6s ease-out;
	}

	@keyframes bounce {
		0%,
		20%,
		50%,
		80%,
		100% {
			transform: translateY(0);
		}
		40% {
			transform: translateY(-30px);
		}
		60% {
			transform: translateY(-15px);
		}
	}

	.success-screen h1 {
		color: #2d3748;
		margin-bottom: 1rem;
	}

	.success-message {
		font-size: 1.2rem;
		color: #718096;
		line-height: 1.6;
	}

	@media (max-width: 768px) {
		.form-wrapper,
		.success-screen {
			padding: 2rem 1.5rem;
		}

		h1 {
			font-size: 2rem;
		}

		.btn-submit {
			padding: 1rem 3rem;
			font-size: 1rem;
			width: 100%;
		}
	}
</style>
