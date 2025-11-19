import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

// Use process.env for server-side code (not import.meta.env which is for client-side)
const JWKS_ENDPOINT = process.env.JWKS_ENDPOINT || 'https://api.placenet.app/.well-known/jwks.json';

// Create JWKS client with caching
const client = jwksClient({
	jwksUri: JWKS_ENDPOINT,
	cache: true,
	cacheMaxAge: 600000, // 10 minutes in milliseconds
	rateLimit: true,
	jwksRequestsPerMinute: 10
});

// Helper function to get the signing key
const getKey = (header, callback) => {
	client.getSigningKey(header.kid, (err, key) => {
		if (err) {
			callback(err);
			return;
		}
		const signingKey = key.getPublicKey();
		callback(null, signingKey);
	});
};

export const getTokenPayload = async function (token) {
	if (!token || token.length === 0) {
		console.log('No token provided');
		return false;
	}

	// Sanitize token: trim whitespace and remove Bearer prefix if present
	token = token.trim();
	if (token.startsWith('Bearer ')) {
		token = token.substring(7).trim();
	}

	// Handle comma-separated tokens (take the last valid one)
	if (token.includes(',')) {
		const tokens = token.split(',').map((t) => t.trim()).filter((t) => t.length > 0);
		token = tokens[tokens.length - 1];
	}

	// Validate JWT structure (should have exactly 2 dots = 3 parts)
	const parts = token.split('.');
	if (parts.length !== 3) {
		console.error(
			`Invalid JWT structure: expected 3 parts, got ${parts.length}. Token preview: ${token.substring(0, 20)}...${token.substring(token.length - 20)}`
		);
		return false;
	}

	try {
		// Decode token first to see the header and kid
		const decoded = jwt.decode(token, { complete: true });

		// Use jwt.verify with the getKey callback to fetch the key from JWKS
		const payload = await new Promise((resolve, reject) => {
			jwt.verify(
				token,
				getKey,
				{
					clockTolerance: 60 // Allow 60 seconds clock skew
				},
				(err, decoded) => {
					if (err) {
						reject(err);
					} else {
						resolve(decoded);
					}
				}
			);
		});

		return payload;
	} catch (err) {
		console.error('JWT verification error:', err.name, err.message);

		if (err.name === 'TokenExpiredError') {
			const decoded = jwt.decode(token);
			const now = Math.floor(Date.now() / 1000);
			const exp = decoded?.exp;
			const iat = decoded?.iat;

			console.error('Token expired!');
			console.error('Server time (unix):', now);
			console.error('Token issued at (iat):', iat, iat ? new Date(iat * 1000).toISOString() : 'N/A');
			console.error('Token expires at (exp):', exp, exp ? new Date(exp * 1000).toISOString() : 'N/A');
			console.error('Difference (seconds):', exp ? now - exp : 'N/A');
		}

		if (err.name === 'JsonWebTokenError') {
			console.error('Token was signed with a different key?');
		}
		return false;
	}
};
