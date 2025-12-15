import { redirect } from '@sveltejs/kit';

export async function load({ url }) {
	const token = url.searchParams.get('token');
	// Redirect to /user with token preserved
	throw redirect(302, `/user${token ? `?token=${token}` : ''}`);
}

