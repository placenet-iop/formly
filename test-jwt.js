import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

const JWKS_ENDPOINT = 'http://localhost:3003/.well-known/jwks.json';

const client = jwksClient({
	jwksUri: JWKS_ENDPOINT,
	cache: true,
	cacheMaxAge: 600000,
	rateLimit: true,
	jwksRequestsPerMinute: 10
});

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

// Test with a sample token (paste the token from your error logs)
const testToken = process.argv[2];

if (!testToken) {
	console.log('Usage: node test-jwt.js <token>');
	process.exit(1);
}

console.log('Testing JWT verification...');
console.log('JWKS Endpoint:', JWKS_ENDPOINT);

jwt.verify(testToken, getKey, { clockTolerance: 60 }, (err, decoded) => {
	if (err) {
		console.error('JWT verification FAILED:', err.message);
		process.exit(1);
	}
	console.log('JWT verification SUCCESS!');
	console.log('Decoded payload:', JSON.stringify(decoded, null, 2));
});
