import { json } from '@sveltejs/kit';
import { getTokenPayload } from '$lib/auth';
import { prisma } from '$lib/prisma';
import { encodeFormId } from '$lib/hashid';

/**
 * GET endpoint for PlaceNet views API
 * Returns a list of active forms for the authenticated domain in the format expected by the dashboard
 * @returns {Promise<Response>} JSON array of { label: string, path: string }
 */
export async function GET({ url, request }) {
	// Try to get token from query params or headers
	let token = url.searchParams.get('token');
	if (!token) {
		token = request.headers.get('x-auth-token');
	}

	// If no token provided, return empty array (dashboard will handle it)
	if (!token) {
		return json([]);
	}

	// Get domain_id from token
	const payload = await getTokenPayload(token);
	if (!payload || !payload.domain_id) {
		// If token is invalid, return empty array
		return json([]);
	}

	const domainId = payload.domain_id;

	try {
		// Fetch all active forms for this domain
		const forms = await prisma.forms.findMany({
			where: {
				domain_id: domainId,
				is_active: true
			},
			orderBy: { updated_at: 'desc' }
		});

		// Convert forms to views format expected by dashboard
		// Dashboard expects: { label: string, path: string }
		const views = forms.map((form) => ({
			label: form.title,
			path: `/form/${encodeFormId(form.id)}`
		}));

		return json(views);
	} catch (e) {
		console.error('Error loading forms for views:', e);
		// Return empty array on error rather than failing
		return json([]);
	}
}
