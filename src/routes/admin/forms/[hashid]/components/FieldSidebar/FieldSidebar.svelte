<script>
	import { fieldTypes, getIcon } from '../utils.js';

	export let onAddField;
</script>

<aside class="sidebar">
	<h3>Add Fields</h3>
	<div class="field-types">
		{#each fieldTypes as fieldType}
			<button class="field-type-btn" onclick={() => onAddField(fieldType.value)}>
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					{@html getIcon(fieldType.icon)}
				</svg>
				<span>{fieldType.label}</span>
			</button>
		{/each}
	</div>
</aside>

<style>
	@import './FieldSidebar.css';
</style>

