import { getStore } from '@netlify/blobs';
import { slugify } from './slug';

const STORE_NAME = 'diary-posts';
const POSTS_KEY = 'posts.json';

export interface Post {
	id: number;
	slug: string;
	title: string;
	body: string;
	pubDate: Date;
	createdAt: Date;
}

interface StoredPost {
	id: number;
	slug: string;
	title: string;
	body: string;
	pubDate: string;
	createdAt: string;
}

export interface NewPostInput {
	title: string;
	body: string;
	pubDate: Date;
}

function getPostsStore() {
	return getStore({ name: STORE_NAME, consistency: 'strong' });
}

function fromStored(post: StoredPost): Post {
	return {
		...post,
		pubDate: new Date(post.pubDate),
		createdAt: new Date(post.createdAt),
	};
}

function toStored(post: Post): StoredPost {
	return {
		...post,
		pubDate: post.pubDate.toISOString(),
		createdAt: post.createdAt.toISOString(),
	};
}

async function readStoredPosts(): Promise<StoredPost[]> {
	const posts = await getPostsStore().get(POSTS_KEY, { type: 'json' });
	return Array.isArray(posts) ? (posts as StoredPost[]) : [];
}

async function writeStoredPosts(posts: StoredPost[]): Promise<void> {
	await getPostsStore().setJSON(POSTS_KEY, posts);
}

function uniqueSlug(posts: StoredPost[], title: string): string {
	const base = slugify(title);
	const usedSlugs = new Set(posts.map((post) => post.slug));
	let candidate = base;
	let n = 2;

	while (usedSlugs.has(candidate)) {
		candidate = `${base}-${n++}`;
	}

	return candidate;
}

export async function listPosts(): Promise<Post[]> {
	const posts = await readStoredPosts();
	return posts
		.map(fromStored)
		.sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());
}

export async function findPostBySlug(slug: string): Promise<Post | undefined> {
	const posts = await readStoredPosts();
	const post = posts.find((item) => item.slug === slug);
	return post ? fromStored(post) : undefined;
}

export async function createPost(input: NewPostInput): Promise<Post> {
	const posts = await readStoredPosts();
	const now = new Date();
	const post: Post = {
		id: posts.reduce((max, item) => Math.max(max, item.id), 0) + 1,
		slug: uniqueSlug(posts, input.title),
		title: input.title,
		body: input.body,
		pubDate: input.pubDate,
		createdAt: now,
	};

	await writeStoredPosts([...posts, toStored(post)]);
	return post;
}
