import { error } from '@sveltejs/kit';
import { getTokenPayload } from '$lib/auth';
import { prisma } from '$lib/prisma';
import { decodeFormId, encodeFormId } from '$lib/hashid';

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
			},
			include: {
				submissions: {
					orderBy: { created_at: 'desc' }
				}
			}
		});

		if (!form) {
			throw error(404, { message: 'Form not found' });
		}

		// Parse fields and submission data
		let fields = [];
		try {
			fields = JSON.parse(form.fields);
		} catch (e) {
			console.error('Error parsing form fields:', e);
			fields = [];
		}

		const submissions = form.submissions.map((sub) => {
			let data = {};
			try {
				data = JSON.parse(sub.data);
			} catch (e) {
				console.error('Error parsing submission data:', e);
			}
			return {
				...sub,
				data
			};
		});

		return {
			token,
			form: {
				...form,
				hashid: encodeFormId(form.id),
				fields
			},
			submissions
		};
	} catch (e) {
		if (e.status) throw e;
		console.error('Error loading submissions:', e);
		throw error(500, { message: 'Internal Server Error' });
	}
}
