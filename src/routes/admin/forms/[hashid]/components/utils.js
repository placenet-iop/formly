// Utility functions for form builder

export function normalizeOptions(options) {
	if (!options) return [];
	return options.map((opt) => {
		if (typeof opt === 'string') {
			return { value: opt, tag: '' };
		}
		return { value: opt.value || '', tag: opt.tag || '' };
	});
}

export function getIcon(iconName) {
	const icons = {
		'type': '<path d="M4 7V4h16v3M9 20h6M12 4v16"/>',
		'align-left': '<line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/>',
		'hash': '<line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>',
		'calendar': '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
		'chevron-down': '<polyline points="6 9 12 15 18 9"/>',
		'circle': '<circle cx="12" cy="12" r="10"/>',
		'check-square': '<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>'
	};
	return icons[iconName] || '';
}

export const fieldTypes = [
	{ value: 'text', label: 'Text Input', icon: 'type' },
	{ value: 'textarea', label: 'Text Area', icon: 'align-left' },
	{ value: 'number', label: 'Number', icon: 'hash' },
	{ value: 'date', label: 'Date', icon: 'calendar' },
	{ value: 'select', label: 'Dropdown', icon: 'chevron-down' },
	{ value: 'radio', label: 'Radio Buttons', icon: 'circle' },
	{ value: 'checkbox', label: 'Checkboxes', icon: 'check-square' }
];

