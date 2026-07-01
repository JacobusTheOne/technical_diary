import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';
import { listPosts } from '../lib/posts';

export async function GET(context: APIContext) {
	const posts = await listPosts();

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
