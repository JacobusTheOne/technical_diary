import type { APIRoute } from 'astro';
import { getDb } from '../../lib/db';
import { posts } from '../../lib/schema';
import { uniqueSlug } from '../../lib/slug';

export const POST: APIRoute = async ({ request, locals, redirect }) => {
	// Middleware guards /admin, but this endpoint lives under /api, so check here too.
	if (!locals.user) return redirect('/login', 302);

	const db = getDb();
	if (!db) {
		return new Response('Database is not configured.', { status: 503 });
	}

	const form = await request.formData();
	const title = String(form.get('title') ?? '').trim();
	const body = String(form.get('body') ?? '').trim();
	const pubDateRaw = String(form.get('pubDate') ?? '').trim();

	if (!title || !body) {
		return redirect('/admin/new?error=missing', 302);
	}

	// The date input gives YYYY-MM-DD; treat it as local midnight, fall back to now.
	const pubDate = pubDateRaw ? new Date(`${pubDateRaw}T00:00:00`) : new Date();
	if (Number.isNaN(pubDate.valueOf())) {
		return redirect('/admin/new?error=date', 302);
	}

	const slug = await uniqueSlug(db, title);
	await db.insert(posts).values({ slug, title, body, pubDate });

	return redirect(`/blog/${slug}`, 302);
};
