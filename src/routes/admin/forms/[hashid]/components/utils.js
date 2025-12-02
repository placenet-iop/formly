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
		'chevron-down': '<polyline points="6 9 12 15 18 9"/>',
		'circle': '<circle cx="12" cy="12" r="10"/>',
		'check-square': '<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
		'image': '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>'
	};
	return icons[iconName] || '';
}

export const fieldTypes = [
	{ value: 'select', label: 'Dropdown', icon: 'chevron-down' },
	{ value: 'radio', label: 'Radio Buttons', icon: 'circle' },
	{ value: 'checkbox', label: 'Checkboxes', icon: 'check-square' },
	{ value: 'media', label: 'Media (Image/Video/Embed)', icon: 'image' }
];

