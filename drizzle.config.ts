import { defineConfig } from 'drizzle-kit';

const url = process.env.NETLIFY_DATABASE_URL ?? process.env.DATABASE_URL;

if (!url) {
	throw new Error(
		'Set NETLIFY_DATABASE_URL (or DATABASE_URL) before running drizzle-kit. ' +
			'For local use, add it to a .env file; on Netlify it is injected automatically.',
	);
}

export default defineConfig({
	schema: './src/lib/schema.ts',
	out: './drizzle',
	dialect: 'postgresql',
	dbCredentials: { url },
});
