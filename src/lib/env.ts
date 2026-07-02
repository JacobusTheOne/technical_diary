// Small helper to read runtime env vars.
//
// On Netlify, secrets (admin credentials, session secret) are injected into
// `process.env` at request time. During local `astro dev` they come from a
// `.env` file, which Astro loads into `import.meta.env`. Read both so the same
// code works in either place.
export function env(key: string): string | undefined {
	const fromProcess =
		typeof process !== 'undefined' && process.env ? process.env[key] : undefined;
	// import.meta.env is statically analysed, so index access still works here.
	const fromImport = (import.meta.env as Record<string, string | undefined>)[key];
	return fromProcess ?? fromImport;
}

export function requireEnv(key: string): string {
	const value = env(key);
	if (!value) throw new Error(`Missing required environment variable: ${key}`);
	return value;
}
