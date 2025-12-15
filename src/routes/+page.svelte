<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { setToken } from '$lib/authStore.svelte.js';

	let status = 'Initializing...';

	const handleMessage = async (event) => {
		const type = event.data?.type;

		if (type === 'auth' && event.data.token) {
			const token = event.data.token;
			status = 'Loading...';

			// Store token in Svelte store
			setToken(token);

			try {
				// Decode JWT to check role (without verification, just to read the payload)
				const payload = JSON.parse(atob(token.split('.')[1]));

				// Check if goto path is provided (from wapp/dashboard)
				if (event.data.goto) {
					status = 'Loading...';
					goto(`${event.data.goto}?token=${token}`);
					return;
				}

				// Redirect based on role
				if (payload.role === 'admin') {
					status = 'Loading admin panel...';
					goto(`/.well-known/placenet/admin?token=${token}`);
				} else {
					status = 'Loading forms...';
					goto(`/user?token=${token}`);
				}
			} catch (err) {
				console.error('Error navigating:', err);
				status = 'Error: Invalid token or navigation failed';
			}
		}

		if (type === 'goto') {
			goto(event.data.path);
		}
	};

	onMount(() => {
		// Set up listener BEFORE sending READY (avoid race condition)
		if (typeof window !== 'undefined') {
			window.addEventListener('message', handleMessage);
		}

		status = 'Waiting for authentication...';

		if (typeof window?.parent !== 'undefined') {
			window.parent.postMessage('READY', '*');
		}

		return () => {
			if (typeof window !== 'undefined') {
				window.removeEventListener('message', handleMessage);
			}
		};
	});
</script>

<div class="container">
	<div class="loader">
		<span>.</span>
		<span>.</span>
		<span>.</span>
	</div>
	<p class="status">{status}</p>
</div>

<style>
	.container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100vh;
		font-family: system-ui, -apple-system, sans-serif;
	}

	@keyframes blink {
		0%,
		20% {
			opacity: 0;
		}
		40% {
			opacity: 1;
		}
	}

	.loader {
		font-size: 4rem;
		display: flex;
		gap: 0.5rem;
	}

	.loader span {
		animation: blink 1.5s infinite;
	}

	.loader span:nth-child(1) {
		animation-delay: 0s;
	}

	.loader span:nth-child(2) {
		animation-delay: 0.5s;
	}

	.loader span:nth-child(3) {
		animation-delay: 1s;
	}

	.status {
		margin-top: 2rem;
		color: #6b7280;
		font-size: 1rem;
	}
</style>
