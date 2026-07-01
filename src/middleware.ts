import { defineMiddleware } from 'astro:middleware';
import { SESSION_COOKIE, verifySessionToken } from './lib/auth';

export const onRequest = defineMiddleware(async (context, next) => {
	// Populate the current user (if any) for every request.
	const token = context.cookies.get(SESSION_COOKIE)?.value;
	context.locals.user = await verifySessionToken(token);

	// Protect the admin area: everything under /admin requires a session.
	const path = context.url.pathname;
	if (path.startsWith('/admin') && !context.locals.user) {
		const redirectTo = encodeURIComponent(path + context.url.search);
		return context.redirect(`/login?redirect=${redirectTo}`, 302);
	}

	return next();
});
