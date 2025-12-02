<script>
	import { fieldTypes, getIcon } from '../utils.js';

	export let onAddField;
	export let onTypeDragStart;
</script>

<aside class="sidebar">
	<h3>Construye tu formulario</h3>
	<p class="sidebar-hint">Empieza por los básicos y luego añade opciones o reordena.</p>
	<div class="field-types">
		{#each fieldTypes as fieldType}
			<button
				class="field-type-btn"
				onclick={() => onAddField(fieldType.value)}
				ondragstart={(event) => onTypeDragStart(fieldType.value, event)}
				draggable="true"
			>
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

