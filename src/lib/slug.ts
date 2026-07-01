import { eq } from 'drizzle-orm';
import { getDb } from './db';
import { posts } from './schema';

export function slugify(input: string): string {
	return (
		input
			.toLowerCase()
			.trim()
			.normalize('NFKD')
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '')
			.slice(0, 80) || 'entry'
	);
}

/**
 * Produce a slug that is unique in the posts table, appending -2, -3, ... on
 * collision. `db` must be non-null (caller has already checked).
 */
export async function uniqueSlug(
	db: NonNullable<ReturnType<typeof getDb>>,
	title: string,
): Promise<string> {
	const base = slugify(title);
	let candidate = base;
	let n = 2;
	// Low write volume (single admin) so a lookup loop is fine.
	while (true) {
		const existing = await db
			.select({ id: posts.id })
			.from(posts)
			.where(eq(posts.slug, candidate))
			.limit(1);
		if (existing.length === 0) return candidate;
		candidate = `${base}-${n++}`;
	}
}
