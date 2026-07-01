import { pgTable, serial, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

// A single diary entry. Authored only by the admin (see src/lib/auth.ts).
export const posts = pgTable(
	'posts',
	{
		id: serial('id').primaryKey(),
		slug: text('slug').notNull(),
		title: text('title').notNull(),
		// Raw Markdown body as typed in the New post form.
		body: text('body').notNull(),
		// The date the entry is *about* (editable in the form).
		pubDate: timestamp('pub_date', { withTimezone: true }).notNull().defaultNow(),
		// When the row was created / last touched.
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	},
	(table) => [uniqueIndex('posts_slug_idx').on(table.slug)],
);

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
