import Hashids from 'hashids';
import { env } from '$env/dynamic/private';

// Create hashids instance with salt from env or default
const hashids = new Hashids(env.HASHID_SALT || 'formly-salt', 10);

/**
 * Encode a numeric form ID to a hashid
 * @param {number} formId - Numeric form ID
 * @returns {string} - Encoded hashid
 */
export function encodeFormId(formId) {
	return hashids.encode(formId);
}

/**
 * Decode a hashid to a numeric form ID
 * @param {string} hashid - Encoded hashid
 * @returns {number|null} - Decoded numeric ID or null if invalid
 */
export function decodeFormId(hashid) {
	const decoded = hashids.decode(hashid);
	return decoded.length > 0 ? decoded[0] : null;
}
