<script>
	import '../app.css';
	import { onMount, onDestroy } from 'svelte';
	let { children } = $props();

	import { goto } from '$app/navigation';

	function handleMessage(event) {
		const type = event.data.type;

		if (type === 'goto') {
			goto(event.data.path);
		}
	}

	onMount(() => {
		if (typeof window !== 'undefined') {
			window.addEventListener('message', handleMessage);
		}
	});

	onDestroy(() => {
		if (typeof window !== 'undefined') {
			window.removeEventListener('message', handleMessage);
		}
	});
</script>

{@render children()}
