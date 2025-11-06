import { error } from '@sveltejs/kit';
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

	if (!payload.domain_id) {
		throw error(401, { message: 'Unauthorized: Invalid or missing domain_id in token' });
	}

	const domainId = payload.domain_id;

	try {
		// Load all active forms for this domain
		const forms = await prisma.forms.findMany({
			where: {
				domain_id: domainId,
				is_active: true
			},
			orderBy: { updated_at: 'desc' }
		});

		// Add encoded IDs to forms
		const formsWithHash = forms.map((form) => ({
			id: form.id,
			title: form.title,
			description: form.description,
			hashid: encodeFormId(form.id)
		}));

		return {
			token,
			user: {
				avatar_name: payload.avatar_name || payload.avatar_id,
				domain_name: payload.domain_name || payload.domain_id
			},
			forms: formsWithHash
		};
	} catch (e) {
		console.error('Error loading user data:', e);
		throw error(500, { message: 'Internal Server Error' });
	}
}
