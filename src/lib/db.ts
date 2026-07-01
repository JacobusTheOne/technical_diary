import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { env } from './env';
import * as schema from './schema';

// Netlify DB injects NETLIFY_DATABASE_URL automatically. For local dev you can
// set either NETLIFY_DATABASE_URL or DATABASE_URL in a .env file.
export function databaseUrl(): string | undefined {
	return env('NETLIFY_DATABASE_URL') ?? env('DATABASE_URL');
}

let _db: ReturnType<typeof drizzle> | null = null;

/**
 * Returns the Drizzle client, or null if no database is configured yet.
 * Callers should handle the null case gracefully (e.g. show an empty diary)
 * so the site still renders before the database is provisioned.
 */
export function getDb() {
	if (_db) return _db;
	const url = databaseUrl();
	if (!url) return null;
	const sql = neon(url);
	_db = drizzle(sql, { schema });
	return _db;
}

export { schema };
