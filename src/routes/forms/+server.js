import { redirect } from '@sveltejs/kit';

export async function GET({ url }) {
	const token = url.searchParams.get('token');

	if (token) {
		throw redirect(302, `/.well-known/placenet/admin?token=${token}`);
	}

	throw redirect(302, '/.well-known/placenet/admin');
}
