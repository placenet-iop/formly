import { error, fail } from '@sveltejs/kit';
import { getTokenPayload } from '$lib/auth';
import { prisma } from '$lib/prisma';
import { encodeFormId } from '$lib/hashid';

export async function load({ url }) {
	const token = url.searchParams.get('token');

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

	const domainId = payload.domain_id;

	try {
		// Ensure domain exists
		let domain = await prisma.domains.findUnique({
			where: { domain_id: domainId }
		});

		if (!domain) {
			// Create domain if it doesn't exist
			domain = await prisma.domains.create({
				data: {
					domain_id: domainId
				}
			});
		}

		// Load all forms for this domain
		const forms = await prisma.forms.findMany({
			where: { domain_id: domainId },
			include: {
				_count: {
					select: { submissions: true }
				}
			},
			orderBy: { updated_at: 'desc' }
		});

		// Add encoded IDs to forms
		const formsWithHash = forms.map((form) => ({
			...form,
			hashid: encodeFormId(form.id),
			submissionCount: form._count.submissions
		}));

		return {
			token,
			forms: formsWithHash
		};
	} catch (e) {
		console.error('Error loading admin data:', e);
		throw error(500, { message: 'Internal Server Error' });
	}
}

export const actions = {
	createForm: async ({ request, url }) => {
		const tokenFromUrl = url.searchParams.get('token');

		const formData = await request.formData();
		const title = formData.get('title') || '';
		const description = formData.get('description') || '';

		const token = tokenFromUrl;

		if (!token) {
			return fail(401, { message: 'Unauthorized: Missing token', messageType: 'error' });
		}

		const payload = await getTokenPayload(token);

		if (!payload) {
			return fail(401, { message: 'Unauthorized: Invalid token', messageType: 'error' });
		}

		if (payload.role !== 'admin') {
			return fail(401, { message: 'Unauthorized: Admin role required', messageType: 'error' });
		}

		if (!payload.domain_id) {
			return fail(401, {
				message: 'Unauthorized: Invalid or missing domain_id in token',
				messageType: 'error'
			});
		}

		const domainId = payload.domain_id;

		if (!title) {
			return fail(400, { message: 'Form title is required', messageType: 'error' });
		}

		try {
			// Create form with empty fields array
			const form = await prisma.forms.create({
				data: {
					domain_id: domainId,
					title,
					description,
					fields: '[]'
				}
			});

			return {
				message: 'Form created successfully',
				messageType: 'success',
				formId: encodeFormId(form.id)
			};
		} catch (e) {
			console.error('Error creating form:', e);
			return fail(500, {
				message: 'Internal Server Error: Could not create form.',
				messageType: 'error'
			});
		}
	},

	deleteForm: async ({ request, url }) => {
		const tokenFromUrl = url.searchParams.get('token');
		const formData = await request.formData();
		const formId = formData.get('formId');

		const token = tokenFromUrl;

		if (!token) {
			return fail(401, { message: 'Unauthorized: Missing token', messageType: 'error' });
		}

		const payload = await getTokenPayload(token);

		if (!payload || payload.role !== 'admin' || !payload.domain_id) {
			return fail(401, { message: 'Unauthorized', messageType: 'error' });
		}

		if (!formId) {
			return fail(400, { message: 'No form ID provided', messageType: 'error' });
		}

		const domainId = payload.domain_id;

		try {
			// Verify form belongs to domain
			const form = await prisma.forms.findFirst({
				where: {
					id: parseInt(formId),
					domain_id: domainId
				}
			});

			if (!form) {
				return fail(404, { message: 'Form not found', messageType: 'error' });
			}

			// Delete form (cascade will delete submissions)
			await prisma.forms.delete({
				where: { id: parseInt(formId) }
			});

			return { message: 'Form deleted successfully', messageType: 'success' };
		} catch (e) {
			console.error('Error deleting form:', e);
			return fail(500, { message: 'Failed to delete form: ' + e.message, messageType: 'error' });
		}
	},

	duplicateForm: async ({ request, url }) => {
		const tokenFromUrl = url.searchParams.get('token');
		const formData = await request.formData();
		const formId = formData.get('formId');

		const token = tokenFromUrl;

		if (!token) {
			return fail(401, { message: 'Unauthorized: Missing token', messageType: 'error' });
		}

		const payload = await getTokenPayload(token);

		if (!payload || payload.role !== 'admin' || !payload.domain_id) {
			return fail(401, { message: 'Unauthorized', messageType: 'error' });
		}

		if (!formId) {
			return fail(400, { message: 'No form ID provided', messageType: 'error' });
		}

		const domainId = payload.domain_id;

		try {
			// Get original form
			const originalForm = await prisma.forms.findFirst({
				where: {
					id: parseInt(formId),
					domain_id: domainId
				}
			});

			if (!originalForm) {
				return fail(404, { message: 'Form not found', messageType: 'error' });
			}

			// Create duplicate
			const duplicatedForm = await prisma.forms.create({
				data: {
					domain_id: domainId,
					title: `${originalForm.title} (Copia)`,
					description: originalForm.description,
					fields: originalForm.fields,
					is_active: false
				}
			});

			return {
				message: 'Formulario duplicado exitosamente',
				messageType: 'success'
			};
		} catch (e) {
			console.error('Error duplicating form:', e);
			return fail(500, {
				message: 'Error al duplicar el formulario',
				messageType: 'error'
			});
		}
	},

	toggleActive: async ({ request, url }) => {
		const tokenFromUrl = url.searchParams.get('token');
		const formData = await request.formData();
		const formId = formData.get('formId');
		const isActive = formData.get('isActive') === 'true';

		const token = tokenFromUrl;

		if (!token) {
			return fail(401, { message: 'Unauthorized: Missing token', messageType: 'error' });
		}

		const payload = await getTokenPayload(token);

		if (!payload || payload.role !== 'admin' || !payload.domain_id) {
			return fail(401, { message: 'Unauthorized', messageType: 'error' });
		}

		if (!formId) {
			return fail(400, { message: 'No form ID provided', messageType: 'error' });
		}

		const domainId = payload.domain_id;

		try {
			// Verify form belongs to domain
			const form = await prisma.forms.findFirst({
				where: {
					id: parseInt(formId),
					domain_id: domainId
				}
			});

			if (!form) {
				return fail(404, { message: 'Form not found', messageType: 'error' });
			}

			// Toggle active status
			await prisma.forms.update({
				where: { id: parseInt(formId) },
				data: { is_active: !isActive }
			});

			return {
				message: `Form ${!isActive ? 'activated' : 'deactivated'} successfully`,
				messageType: 'success'
			};
		} catch (e) {
			console.error('Error toggling form status:', e);
			return fail(500, { message: 'Failed to update form: ' + e.message, messageType: 'error' });
		}
	}
};
