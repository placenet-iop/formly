<script>
	export let message = '';
	export let messageType = '';
</script>

{#if message}
	<div class="alert {messageType}">
		<svg class="alert-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			{#if messageType === 'success'}
				<polyline points="20 6 9 17 4 12"></polyline>
			{:else}
				<circle cx="12" cy="12" r="10"></circle>
				<line x1="12" y1="8" x2="12" y2="12"></line>
				<line x1="12" y1="16" x2="12.01" y2="16"></line>
			{/if}
		</svg>
	<span>{message}</span>
</div>
{/if}

<style>
	@import './Alert.css';
</style>

