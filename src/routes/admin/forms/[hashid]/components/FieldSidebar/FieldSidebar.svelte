<script>
	import { fieldTypes, getIcon } from '../utils.js';

	export let onAddField;
	export let onTypeDragStart;
	export let formTitle = '';
</script>

<aside class="sidebar">
	<div class="sidebar-header">
		<h3>{formTitle || 'Construye tu formulario'}</h3>
		<button type="submit" form="form-builder" class="btn-save">
			<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
				<polyline points="17 21 17 13 7 13 7 21"></polyline>
				<polyline points="7 3 7 8 15 8"></polyline>
			</svg>
			Guardar
		</button>
	</div>
	<p class="sidebar-hint">Arrastra los campos al lienzo o haz clic para añadir.</p>
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

