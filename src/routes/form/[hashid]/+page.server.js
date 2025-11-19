import { error, fail } from '@sveltejs/kit';
import { getTokenPayload } from '$lib/auth';
import { prisma } from '$lib/prisma';
import { decodeFormId } from '$lib/hashid';

export async function load({ params, url }) {
	const { hashid } = params;
	const token = url.searchParams.get('token');

	const formId = decodeFormId(hashid);

	if (!formId) {
		throw error(404, { message: 'Form not found' });
	}

	try {
		const form = await prisma.forms.findUnique({
			where: { id: formId }
		});

		if (!form) {
			throw error(404, { message: 'Form not found' });
		}

		if (!form.is_active) {
			throw error(403, { message: 'This form is not currently accepting responses' });
		}

		// Parse fields JSON
		let fields = [];
		try {
			fields = JSON.parse(form.fields);
		} catch (e) {
			console.error('Error parsing form fields:', e);
			fields = [];
		}

		return {
			token,
			form: {
				id: form.id,
				title: form.title,
				description: form.description,
				fields
			}
		};
	} catch (e) {
		if (e.status) throw e;
		console.error('Error loading form:', e);
		throw error(500, { message: 'Internal Server Error' });
	}
}

export const actions = {
	submit: async ({ request, params, url }) => {
		const { hashid } = params;
		const token = url.searchParams.get('token');

		const formData = await request.formData();

		const formId = decodeFormId(hashid);

		if (!formId) {
			return fail(404, { message: 'Form not found', messageType: 'error' });
		}

		let avatarId = 'anonymous';
		let domainId = null;
		let userMetadata = {};

		// Try to get user info from token if available
		if (token) {
			const payload = await getTokenPayload(token);
			if (payload) {
				domainId = payload.domain_id;
				avatarId = payload.avatar_id || 'anonymous';

				// Capture user metadata for display in submissions
				userMetadata = {
					avatar_name: payload.avatar_name || payload.avatar_id,
					label: payload.label || payload.avatar_name || payload.avatar_id,
					avatar_image: payload.avatar_image || '',
					domain_name: payload.domain_name || payload.domain_id,
					// Capture phone and email from scopes if available
					...(payload.scopes && {
						phone: payload.scopes.phone || '',
						email: payload.scopes.email || ''
					})
				};
			}
		}

		try {
			// Load form to validate and get domain_id
			const form = await prisma.forms.findUnique({
				where: { id: formId }
			});

			if (!form) {
				return fail(404, { message: 'Form not found', messageType: 'error' });
			}

			if (!form.is_active) {
				return fail(403, { message: 'This form is not currently accepting responses', messageType: 'error' });
			}

			// Use form's domain_id if not from token
			if (!domainId) {
				domainId = form.domain_id;
			}

			// Parse fields to validate
			let fields = [];
			try {
				fields = JSON.parse(form.fields);
			} catch (e) {
				console.error('Error parsing form fields:', e);
				return fail(500, { message: 'Form configuration error', messageType: 'error' });
			}

			/**
			 * Normalize field options to handle both legacy (string) and new (object) formats
			 * Legacy format: ['Option 1', 'Option 2']
			 * New format: [{ value: 'Option 1', tag: 'tag1' }, { value: 'Option 2', tag: 'tag2' }]
			 * @param {Array<string|Object>} options - Field options in either format
			 * @returns {Array<{value: string, tag: string}>} Normalized options array
			 */
			function normalizeOptions(options) {
				if (!options) return [];
				return options.map((opt) => {
					if (typeof opt === 'string') {
						return { value: opt, tag: '' };
					}
					return { value: opt.value || '', tag: opt.tag || '' };
				});
			}

			// Validate required fields
			const submissionData = {};
			const errors = {};

			for (const field of fields) {
				const value = formData.get(`field_${field.id}`);

				// Handle checkboxes (multiple values)
				if (field.type === 'checkbox') {
					const values = formData.getAll(`field_${field.id}`);
					submissionData[field.id] = values;

					if (field.required && values.length === 0) {
						errors[field.id] = `${field.label} is required`;
					}
				} else {
					// Convert FormDataEntryValue to string (handles both string and File types)
					const stringValue = typeof value === 'string' ? value : value?.toString() || '';
					submissionData[field.id] = stringValue;

					if (field.required && (!stringValue || stringValue.trim() === '')) {
						errors[field.id] = `${field.label} is required`;
					}
				}
			}

			if (Object.keys(errors).length > 0) {
				return fail(400, {
					message: 'Please fill in all required fields',
					messageType: 'error',
					errors,
					values: submissionData
				});
			}

			// Save submission with user metadata
			await prisma.submissions.create({
				data: {
					form_id: formId,
					domain_id: domainId,
					avatar_id: avatarId,
					data: JSON.stringify({
						formData: submissionData,
						userMetadata: userMetadata
					})
				}
			});

			// Send tags to PlaceNet feedback API if token is available and fields have tags enabled
			// This allows form responses to automatically tag users in the PlaceNet system
			if (token) {
				try {
					/**
					 * Helper function to send a tag to the PlaceNet feedback API
					 * @param {string} tag - The tag key to send
					 * @param {string} fieldLabel - The field label to use as the value
					 */
					async function sendTagToAPI(tag, fieldLabel) {
						if (!tag || tag.trim() === '') {
							return;
						}

						const response = await fetch('https://api.placenet.com/feedback', {
							method: 'POST',
							headers: {
								Authorization: `Bearer ${token}`,
								'Content-Type': 'application/json'
							},
							body: JSON.stringify({
								type: 'tag',
								key: tag,
								value: fieldLabel
							})
						});

						if (!response.ok) {
							console.error(`Failed to send tag to API: key="${tag}", status=${response.status}`);
						}
					}

					// Process all fields that support tags (select, radio, checkbox)
					for (const field of fields) {
						if (
							(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') &&
							field.hasTag
						) {
							const normalizedOptions = normalizeOptions(field.options);
							const submittedValue = submissionData[field.id];

							if (submittedValue) {
								// Normalize to array: checkbox returns array, select/radio returns single value
								const valuesToProcess = Array.isArray(submittedValue) ? submittedValue : [submittedValue];

								// Send tag for each selected option that has a tag configured
								for (const val of valuesToProcess) {
									const option = normalizedOptions.find((opt) => opt.value === val);
									if (option && option.tag) {
										await sendTagToAPI(option.tag, field.label);
									}
								}
							}
						}
					}
				} catch (e) {
					// Log error but don't fail the submission - tag sending is non-critical
					console.error('Error sending tags to API:', e);
				}
			}

			return { message: 'Form submitted successfully!', messageType: 'success', submitted: true };
		} catch (e) {
			console.error('Error submitting form:', e);
			return fail(500, {
				message: 'Failed to submit form. Please try again.',
				messageType: 'error'
			});
		}
	}
};
