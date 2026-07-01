import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { desc } from 'drizzle-orm';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';
import { getDb } from '../lib/db';
import { posts as postsTable } from '../lib/schema';

export async function GET(context: APIContext) {
	const db = getDb();
	const posts = db
		? await db.select().from(postsTable).orderBy(desc(postsTable.pubDate))
		: [];

	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site ?? 'https://example.netlify.app',
		items: posts.map((post) => ({
			title: post.title,
			pubDate: post.pubDate,
			description: post.body.slice(0, 200),
			link: `/blog/${post.slug}/`,
		})),
	});
}
