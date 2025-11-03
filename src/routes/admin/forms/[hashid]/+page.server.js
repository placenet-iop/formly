import { error, fail, redirect } from '@sveltejs/kit';
import { getTokenPayload } from '$lib/auth';
import { prisma } from '$lib/prisma';
import { decodeFormId } from '$lib/hashid';

export async function load({ params, url }) {
	const token = url.searchParams.get('token');
	const { hashid } = params;

	if (!token) {
		throw error(401, { message: 'Unauthorized: Missing token' });
	}

	const payload = await getTokenPayload(token);

	if (!payload) {
		throw error(401, { message: 'Unauthorized: Invalid token' });
	}

	if (payload.role !== 'admin') {
		throw error(401, { message: 'Unauthorized: Admin role required' });
	}

	if (!payload.domain_id) {
		throw error(401, { message: 'Unauthorized: Invalid or missing domain_id in token' });
	}

	const formId = decodeFormId(hashid);

	if (!formId) {
		throw error(404, { message: 'Form not found' });
	}

	const domainId = payload.domain_id;

	try {
		const form = await prisma.forms.findFirst({
			where: {
				id: formId,
				domain_id: domainId
			}
		});

		if (!form) {
			throw error(404, { message: 'Form not found' });
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
				...form,
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
	updateForm: async ({ request, params, url }) => {
		const tokenFromUrl = url.searchParams.get('token');
		const { hashid } = params;

		const formData = await request.formData();
		const title = formData.get('title') || '';
		const description = formData.get('description') || '';
		const fieldsJson = formData.get('fields') || '[]';

		const token = tokenFromUrl;

		if (!token) {
			return fail(401, { message: 'Unauthorized: Missing token', messageType: 'error' });
		}

		const payload = await getTokenPayload(token);

		if (!payload || payload.role !== 'admin' || !payload.domain_id) {
			return fail(401, { message: 'Unauthorized', messageType: 'error' });
		}

		const formId = decodeFormId(hashid);

		if (!formId) {
			return fail(404, { message: 'Form not found', messageType: 'error' });
		}

		const domainId = payload.domain_id;

		// Validate fields JSON
		let fields = [];
		try {
			fields = JSON.parse(fieldsJson);
		} catch (e) {
			return fail(400, { message: 'Invalid fields data', messageType: 'error' });
		}

		try {
			// Verify form belongs to domain
			const form = await prisma.forms.findFirst({
				where: {
					id: formId,
					domain_id: domainId
				}
			});

			if (!form) {
				return fail(404, { message: 'Form not found', messageType: 'error' });
			}

			// Update form
			await prisma.forms.update({
				where: { id: formId },
				data: {
					title,
					description,
					fields: fieldsJson
				}
			});

			return { message: 'Form saved successfully', messageType: 'success' };
		} catch (e) {
			console.error('Error updating form:', e);
			return fail(500, {
				message: 'Internal Server Error: Could not update form.',
				messageType: 'error'
			});
		}
	}
};
