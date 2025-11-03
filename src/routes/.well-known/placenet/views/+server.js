import { json } from '@sveltejs/kit';

export async function GET() {
	return json([
		{
			id: 'admin',
			label: 'Forms',
			icon: '📝',
			url: '/.well-known/placenet/admin'
		}
	]);
}
