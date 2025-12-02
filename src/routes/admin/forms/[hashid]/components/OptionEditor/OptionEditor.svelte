<script>
	export let field;
	export let onUpdateOption;
	export let onUpdateOptionTag;
	export let onRemoveOption;
	export let onAddOption;
</script>

<div class="form-group">
	<label>Options</label>
	<div class="options-list">
		{#each field.options as option, optIdx}
			<div class="option-row">
				<input type="text" class="option-input" value={option.value || option} oninput={(e) => { const target = e.currentTarget; if (target) onUpdateOption(field.id, optIdx, target.value); }} placeholder="Option {optIdx + 1}" />
				{#if field.hasTag}
					<input type="text" class="tag-input" id="tag-{field.id}-{optIdx}" value={option.tag || ''} oninput={(e) => { const target = e.currentTarget; if (target) onUpdateOptionTag(field.id, optIdx, target.value); }} placeholder="Tag" />
				{/if}
				<button type="button" class="btn-icon-small" onclick={() => onRemoveOption(field.id, optIdx)} disabled={field.options.length === 1} aria-label="Remove option">
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<line x1="18" y1="6" x2="6" y2="18"></line>
						<line x1="6" y1="6" x2="18" y2="18"></line>
					</svg>
				</button>
			</div>
		{/each}
		<button type="button" class="btn-add-option" onclick={() => onAddOption(field.id)}>
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<line x1="12" y1="5" x2="12" y2="19"></line>
				<line x1="5" y1="12" x2="19" y2="12"></line>
			</svg>
			Add Option
		</button>
	</div>
</div>

<style>
	@import './OptionEditor.css';
</style>

