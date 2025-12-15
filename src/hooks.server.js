import { error } from '@sveltejs/kit';
import { getTokenPayload } from '$lib/auth';

export const handle = async ({ event, resolve }) => {
	// Skip auth for public routes and form pages (auth happens via query params or postMessage)
	if (
		event.url.pathname === '/' ||
		event.url.pathname === '/auth' ||
		event.url.pathname === '/forms' ||
		event.url.pathname === '/.well-known/placenet/admin' ||
		event.url.pathname === '/.well-known/placenet/views' ||
		event.url.pathname.startsWith('/form/') ||
		event.url.pathname.startsWith('/admin/forms/') ||
		event.url.pathname.startsWith('/admin/submissions/')
	) {
		return await resolve(event);
	}

	// Check header first (ongoing requests), then URL query param (initial load)
	let token = event.request.headers.get('x-auth-token');

	if (!token) {
		token = event.url.searchParams.get('token');
	}

	if (!token || token.length == 0) {
		throw error(401, { message: 'Not authenticated' });
	}

	// Strip leading comma if present (workaround for duplicate headers)
	const cleanToken = token.startsWith(',') ? token.substring(1).trim() : token;

	const payload = await getTokenPayload(cleanToken);
	if (!payload) {
		throw error(401, { message: 'Invalid token' });
	}

	// Store domain info in event.locals for use in routes
	Object.assign(event.locals, {
		domain_id: payload.domain_id,
		avatar_id: payload.avatar_id || 'default',
		role: payload.role,
		domain_tags: payload.domain_tags ? payload.domain_tags : []
	});

	return await resolve(event);
};
