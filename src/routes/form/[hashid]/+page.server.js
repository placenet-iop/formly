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
					submissionData[field.id] = value || '';

					if (field.required && (!value || value.trim() === '')) {
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
