import type { APIRoute } from 'astro';
import { createPost } from '../../lib/posts';

export const POST: APIRoute = async ({ request, locals, redirect }) => {
	// Middleware guards /admin, but this endpoint lives under /api, so check here too.
	if (!locals.user) return redirect('/login', 302);

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

	const post = await createPost({ title, body, pubDate });

	return redirect(`/blog/${post.slug}`, 302);
};
