let authToken = $state('');

export function setToken(token) {
	authToken = token;
}

export function getToken() {
	return authToken;
}
