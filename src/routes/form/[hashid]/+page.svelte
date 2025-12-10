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

	// Typeform-style navigation
	let currentStep = 0;
	let formElement = null;
	let slideDirection = 'forward';

	// Filter out display-only fields for navigation
	$: interactiveFields = fields.filter(f => f.type !== 'title' && f.type !== 'description');
	$: totalSteps = interactiveFields.length;
	$: currentField = interactiveFields[currentStep];
	$: progress = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;
	$: isLastStep = currentStep === totalSteps - 1;

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

	function nextStep() {
		if (!validateCurrentField()) return;

		if (currentStep < totalSteps - 1) {
			slideDirection = 'forward';
			currentStep++;
		}
	}

	function prevStep() {
		if (currentStep > 0) {
			slideDirection = 'backward';
			currentStep--;
		}
	}

	function validateCurrentField() {
		if (!currentField) return true;

		const fieldId = currentField.id;
		const value = values[fieldId];

		if (currentField.required) {
			if (!value || (Array.isArray(value) && value.length === 0) || value.trim?.() === '') {
				errors[fieldId] = 'Este campo es requerido';
				errors = {...errors}; // Trigger reactivity
				return false;
			}
		}

		// Clear error if validation passes
		delete errors[fieldId];
		errors = {...errors};
		return true;
	}

	function handleFieldInput(fieldId, value) {
		values[fieldId] = value;
		values = {...values};

		// Clear error on input
		if (errors[fieldId]) {
			delete errors[fieldId];
			errors = {...errors};
		}
	}

	function handleSingleChoiceSelect(fieldId, value, fieldType) {
		handleFieldInput(fieldId, value);

		// Auto-advance for single-choice fields (radio, select)
		if (fieldType === 'radio' || fieldType === 'select') {
			setTimeout(() => {
				nextStep();
			}, 300); // Small delay for visual feedback
		}
	}

	function handleSubmit() {
		if (validateCurrentField() && formElement) {
			formElement.requestSubmit();
		}
	}
</script>

<svelte:head>
	<title>{formData?.title || 'Form'}</title>
</svelte:head>

<div class="typeform-container" style={`--accent:${brandColor};`}>
	{#if submitted}
		<!-- Success Screen -->
		<div class="success-screen slide-in">
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
		<!-- Progress Bar -->
		<div class="progress-bar">
			<div class="progress-fill" style={`width: ${progress}%; background: ${brandColor};`}></div>
		</div>

		<!-- Question Counter -->
		<div class="question-counter">
			{currentStep + 1} de {totalSteps}
		</div>

		<!-- Form Title (only show on first question) -->
		{#if currentStep === 0}
			<div class="form-intro slide-in">
				<h1 class="form-title">{formData?.title || 'Form'}</h1>
				{#if formData?.description}
					<p class="form-description">{formData.description}</p>
				{/if}
			</div>
		{/if}

		<!-- Hidden Form for Submission -->
		<form
			bind:this={formElement}
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
			class="hidden-form"
		>
			{#each interactiveFields as field}
				{#if field.type === 'checkbox'}
					{#each field.options || [] as option}
						<input
							type="checkbox"
							name="field_{field.id}"
							value={option.value || option}
							checked={Array.isArray(values[field.id]) && values[field.id].includes(option.value || option)}
							style="display:none;"
						/>
					{/each}
				{:else}
					<input
						type="hidden"
						name="field_{field.id}"
						value={values[field.id] || ''}
					/>
				{/if}
			{/each}
		</form>

		<!-- Current Question Slide -->
		{#if currentField}
			<div class="slide {slideDirection}" key={currentStep}>
				<div class="question-label">
					{currentField.label}
					{#if currentField.required}
						<span class="required-badge">*</span>
					{/if}
				</div>

				<div class="answer-area">
					<!-- Text Input Types -->
					{#if currentField.type === 'text' || currentField.type === 'email' || currentField.type === 'number' || currentField.type === 'tel'}
						<input
							type={currentField.type}
							placeholder={currentField.placeholder || 'Escribe tu respuesta...'}
							value={values[currentField.id] || ''}
							on:input={(e) => handleFieldInput(currentField.id, e.target.value)}
							class="text-input"
							autocomplete="off"
						/>

					<!-- Date Input -->
					{:else if currentField.type === 'date'}
						<input
							type="date"
							value={values[currentField.id] || ''}
							on:change={(e) => handleFieldInput(currentField.id, e.target.value)}
							class="date-input"
						/>

					<!-- Textarea -->
					{:else if currentField.type === 'textarea'}
						<textarea
							placeholder={currentField.placeholder || 'Escribe tu respuesta...'}
							value={values[currentField.id] || ''}
							on:input={(e) => handleFieldInput(currentField.id, e.target.value)}
							class="textarea-input"
							rows="5"
						></textarea>

					<!-- Select Dropdown -->
					{:else if currentField.type === 'select'}
						<div class="select-options">
							{#each currentField.options || [] as option}
								<button
									type="button"
									class="option-button"
									class:selected={values[currentField.id] === (option.value || option)}
									on:click={() => handleSingleChoiceSelect(currentField.id, option.value || option, 'select')}
								>
									<span class="option-letter">{String.fromCharCode(65 + (currentField.options.indexOf(option)))}</span>
									<span class="option-text">{option.value || option}</span>
								</button>
							{/each}
						</div>

					<!-- Radio Buttons -->
					{:else if currentField.type === 'radio'}
						<div class="radio-options">
							{#each currentField.options || [] as option}
								<button
									type="button"
									class="option-button"
									class:selected={values[currentField.id] === (option.value || option)}
									on:click={() => handleSingleChoiceSelect(currentField.id, option.value || option, 'radio')}
								>
									<span class="option-letter">{String.fromCharCode(65 + (currentField.options.indexOf(option)))}</span>
									<span class="option-text">{option.value || option}</span>
								</button>
							{/each}
						</div>

					<!-- Checkboxes (Multi-select) -->
					{:else if currentField.type === 'checkbox'}
						<div class="checkbox-options">
							{#each currentField.options || [] as option}
								{@const isChecked = Array.isArray(values[currentField.id]) && values[currentField.id].includes(option.value || option)}
								<button
									type="button"
									class="option-button checkbox-button"
									class:selected={isChecked}
									on:click={() => {
										let currentValues = Array.isArray(values[currentField.id]) ? [...values[currentField.id]] : [];
										const optionValue = option.value || option;

										if (currentValues.includes(optionValue)) {
											currentValues = currentValues.filter(v => v !== optionValue);
										} else {
											currentValues.push(optionValue);
										}

										handleFieldInput(currentField.id, currentValues);
									}}
								>
									<span class="checkbox-icon">
										{#if isChecked}
											<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
												<polyline points="4 12 9 17 20 6"></polyline>
											</svg>
										{/if}
									</span>
									<span class="option-text">{option.value || option}</span>
								</button>
							{/each}
						</div>

					<!-- Media Upload/URL -->
					{:else if currentField.type === 'media'}
						{#if currentField.mediaType === 'upload'}
							<input
								type="file"
								accept="image/*,video/*"
								on:change={(e) => handleFieldInput(currentField.id, e.target.files?.[0]?.name || '')}
								class="file-input"
							/>
						{:else}
							<input
								type="url"
								placeholder={currentField.placeholder || 'https://youtube.com/...'}
								value={values[currentField.id] || ''}
								on:input={(e) => handleFieldInput(currentField.id, e.target.value)}
								class="text-input"
							/>
						{/if}
					{/if}

					<!-- Error Message -->
					{#if hasError(currentField.id)}
						<div class="error-message">
							{getError(currentField.id)}
						</div>
					{/if}
				</div>
			</div>
		{/if}

		<!-- Navigation Buttons -->
		<div class="navigation-buttons">
			{#if currentStep > 0}
				<button type="button" class="nav-button prev-button" on:click={prevStep}>
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<polyline points="15 18 9 12 15 6"></polyline>
					</svg>
					Anterior
				</button>
			{/if}

			{#if !isLastStep}
				<button type="button" class="nav-button next-button" on:click={nextStep}>
					Siguiente
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<polyline points="9 18 15 12 9 6"></polyline>
					</svg>
				</button>
			{:else}
				<button type="button" class="nav-button submit-button" on:click={handleSubmit}>
					Enviar
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<polyline points="4 12 9 17 20 6"></polyline>
					</svg>
				</button>
			{/if}
		</div>
	{/if}
</div>

<style>
	:global(body) {
		background: #ffffff;
		min-height: 100vh;
		margin: 0;
		padding: 0;
		font-family: 'Inter', system-ui, -apple-system, sans-serif;
		color: #0f172a;
		overflow-x: hidden;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}

	/* Typeform Container */
	.typeform-container {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		padding: 1rem 1.25rem 1.5rem;
		position: relative;
	}

	/* Progress Bar */
	.progress-bar {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: 4px;
		background: #f1f5f9;
		z-index: 100;
	}

	.progress-fill {
		height: 100%;
		transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		border-radius: 0 2px 2px 0;
	}

	/* Question Counter */
	.question-counter {
		position: fixed;
		top: 1.25rem;
		right: 1.25rem;
		font-size: 0.875rem;
		font-weight: 600;
		color: #64748b;
		background: #f8fafc;
		padding: 0.5rem 0.875rem;
		border-radius: 999px;
		border: 1px solid #e2e8f0;
		z-index: 50;
	}

	/* Form Intro */
	.form-intro {
		margin-top: 3rem;
		margin-bottom: 2.5rem;
		animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.form-title {
		font-size: 2rem;
		font-weight: 800;
		color: #0f172a;
		margin: 0 0 0.75rem;
		letter-spacing: -0.03em;
		line-height: 1.2;
	}

	.form-description {
		font-size: 1.125rem;
		color: #64748b;
		line-height: 1.6;
		margin: 0;
	}

	/* Hidden Form */
	.hidden-form {
		display: none;
	}

	/* Question Slide */
	.slide {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding-top: 4rem;
		animation: slideInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.slide.backward {
		animation: slideInDown 0.5s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.question-label {
		font-size: 1.5rem;
		font-weight: 700;
		color: #0f172a;
		margin-bottom: 2rem;
		line-height: 1.4;
		letter-spacing: -0.02em;
	}

	.required-badge {
		color: #ef4444;
		font-size: 1.75rem;
		margin-left: 0.25rem;
	}

	/* Answer Area */
	.answer-area {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	/* Text Inputs */
	.text-input,
	.date-input,
	.textarea-input {
		width: 100%;
		padding: 1rem 0;
		border: none;
		border-bottom: 2px solid #e2e8f0;
		font-family: inherit;
		font-size: 1.125rem;
		color: #0f172a;
		background: transparent;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		outline: none;
	}

	.text-input:focus,
	.date-input:focus,
	.textarea-input:focus {
		border-bottom-color: var(--accent);
	}

	.text-input::placeholder,
	.textarea-input::placeholder {
		color: #94a3b8;
	}

	.textarea-input {
		resize: vertical;
		min-height: 120px;
		padding: 1rem 0;
		line-height: 1.6;
	}

	/* Option Buttons */
	.option-button {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1.125rem 1.25rem;
		background: #ffffff;
		border: 2px solid #e2e8f0;
		border-radius: 12px;
		font-family: inherit;
		font-size: 1rem;
		text-align: left;
		cursor: pointer;
		transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
		position: relative;
		overflow: hidden;
	}

	.option-button::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: var(--accent);
		opacity: 0;
		transition: opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.option-button:active {
		transform: scale(0.98);
	}

	.option-button.selected {
		border-color: var(--accent);
		background: color-mix(in srgb, var(--accent) 8%, white);
	}

	.option-button.selected::before {
		opacity: 0.05;
	}

	.option-letter {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		background: #f1f5f9;
		border-radius: 8px;
		font-weight: 700;
		font-size: 0.875rem;
		color: #64748b;
		flex-shrink: 0;
		position: relative;
		z-index: 1;
		transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.option-button.selected .option-letter {
		background: var(--accent);
		color: white;
	}

	.option-text {
		flex: 1;
		color: #0f172a;
		font-weight: 500;
		position: relative;
		z-index: 1;
	}

	/* Checkbox Options */
	.checkbox-button {
		gap: 0.875rem;
	}

	.checkbox-icon {
		width: 1.5rem;
		height: 1.5rem;
		border: 2px solid #cbd5e1;
		border-radius: 6px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		position: relative;
		z-index: 1;
		transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
		background: white;
	}

	.checkbox-button.selected .checkbox-icon {
		background: var(--accent);
		border-color: var(--accent);
		color: white;
	}

	/* File Input */
	.file-input {
		padding: 1.25rem;
		border: 2px dashed #cbd5e1;
		border-radius: 12px;
		font-family: inherit;
		font-size: 1rem;
		cursor: pointer;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.file-input:focus {
		outline: none;
		border-color: var(--accent);
		background: color-mix(in srgb, var(--accent) 5%, white);
	}

	/* Error Message */
	.error-message {
		color: #ef4444;
		font-size: 0.9375rem;
		font-weight: 600;
		padding: 0.75rem 1rem;
		background: #fef2f2;
		border-left: 3px solid #ef4444;
		border-radius: 8px;
		margin-top: 0.5rem;
		animation: shake 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	}

	/* Navigation Buttons */
	.navigation-buttons {
		display: flex;
		gap: 0.75rem;
		padding: 1.5rem 0 1rem;
		margin-top: auto;
	}

	.nav-button {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 1rem 1.5rem;
		border: none;
		border-radius: 12px;
		font-family: inherit;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
		flex: 1;
	}

	.prev-button {
		background: #f8fafc;
		color: #475569;
		border: 1px solid #e2e8f0;
		max-width: 140px;
	}

	.prev-button:active {
		background: #f1f5f9;
		transform: scale(0.98);
	}

	.next-button,
	.submit-button {
		background: var(--accent);
		color: white;
		justify-content: center;
		box-shadow: 0 4px 14px color-mix(in srgb, var(--accent) 35%, transparent);
	}

	.next-button:active,
	.submit-button:active {
		transform: scale(0.98);
		box-shadow: 0 2px 8px color-mix(in srgb, var(--accent) 30%, transparent);
	}

	/* Success Screen */
	.success-screen {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		padding: 2rem 1.5rem;
		min-height: 100vh;
	}

	.success-icon {
		width: 96px;
		height: 96px;
		margin: 0 auto 1.5rem;
		border-radius: 50%;
		border: 3px solid color-mix(in srgb, var(--accent) 30%, transparent);
		background: color-mix(in srgb, var(--accent) 10%, white);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--accent);
		animation: scaleIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	.success-screen h1 {
		font-size: 2rem;
		font-weight: 800;
		color: #0f172a;
		margin: 0 0 0.75rem;
		letter-spacing: -0.02em;
	}

	.success-message {
		font-size: 1.125rem;
		color: #64748b;
		line-height: 1.6;
		margin: 0;
	}

	/* Animations */
	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes slideInUp {
		from {
			opacity: 0;
			transform: translateY(30px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes slideInDown {
		from {
			opacity: 0;
			transform: translateY(-30px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes scaleIn {
		from {
			opacity: 0;
			transform: scale(0.5);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	@keyframes shake {
		0%, 100% { transform: translateX(0); }
		25% { transform: translateX(-8px); }
		75% { transform: translateX(8px); }
	}

	.slide-in {
		animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1);
	}
</style>
