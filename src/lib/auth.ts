import { env, requireEnv } from './env';

// ---------------------------------------------------------------------------
// Single-admin authentication.
//
// There is exactly one account. Its username/password live in env vars
// (ADMIN_USERNAME / ADMIN_PASSWORD). On successful login we hand the browser a
// cookie containing a signed token; every request re-verifies the signature so
// no server-side session store is needed.
// ---------------------------------------------------------------------------

export const SESSION_COOKIE = 'diary_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

export interface SessionUser {
	username: string;
}

const encoder = new TextEncoder();

function base64url(bytes: Uint8Array): string {
	let bin = '';
	for (const b of bytes) bin += String.fromCharCode(b);
	return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64url(s: string): Uint8Array {
	const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
	const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4));
	const bin = atob(b64 + pad);
	const out = new Uint8Array(bin.length);
	for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
	return out;
}

/** Constant-time comparison to avoid leaking the secret via timing. */
function timingSafeEqual(a: string, b: string): boolean {
	const ab = encoder.encode(a);
	const bb = encoder.encode(b);
	// Compare against a fixed-length digest so lengths don't short-circuit.
	if (ab.length !== bb.length) {
		// Still walk to keep timing roughly constant.
		let diff = 1;
		for (let i = 0; i < Math.max(ab.length, bb.length); i++) {
			diff |= (ab[i] ?? 0) ^ (bb[i] ?? 0);
		}
		return diff === 0 && ab.length === bb.length;
	}
	let diff = 0;
	for (let i = 0; i < ab.length; i++) diff |= ab[i] ^ bb[i];
	return diff === 0;
}

async function hmacKey(): Promise<CryptoKey> {
	const secret = requireEnv('SESSION_SECRET');
	return crypto.subtle.importKey(
		'raw',
		encoder.encode(secret),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign', 'verify'],
	);
}

async function sign(payload: string): Promise<string> {
	const key = await hmacKey();
	const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
	return base64url(new Uint8Array(sig));
}

/** Verify username + password against the configured admin credentials. */
export function verifyCredentials(username: string, password: string): boolean {
	const expectedUser = env('ADMIN_USERNAME');
	const expectedPass = env('ADMIN_PASSWORD');
	if (!expectedUser || !expectedPass) return false;
	// Evaluate both so timing doesn't reveal which field was wrong.
	const userOk = timingSafeEqual(username, expectedUser);
	const passOk = timingSafeEqual(password, expectedPass);
	return userOk && passOk;
}

/** Create a signed session token for the given user. */
export async function createSessionToken(user: SessionUser): Promise<string> {
	const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
	const payload = base64url(encoder.encode(JSON.stringify({ u: user.username, exp })));
	const sig = await sign(payload);
	return `${payload}.${sig}`;
}

/** Verify a session token; returns the user or null if invalid/expired. */
export async function verifySessionToken(token: string | undefined): Promise<SessionUser | null> {
	if (!token) return null;
	const [payload, sig] = token.split('.');
	if (!payload || !sig) return null;
	const expected = await sign(payload);
	if (!timingSafeEqual(sig, expected)) return null;
	try {
		const data = JSON.parse(new TextDecoder().decode(fromBase64url(payload)));
		if (typeof data.exp !== 'number' || data.exp < Math.floor(Date.now() / 1000)) return null;
		if (typeof data.u !== 'string') return null;
		return { username: data.u };
	} catch {
		return null;
	}
}

export function sessionCookieOptions() {
	return {
		httpOnly: true,
		secure: true,
		sameSite: 'lax' as const,
		path: '/',
		maxAge: SESSION_TTL_SECONDS,
	};
}
