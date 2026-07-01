import type { APIRoute } from 'astro';
import {
	SESSION_COOKIE,
	createSessionToken,
	sessionCookieOptions,
	verifyCredentials,
} from '../../lib/auth';

function safeRedirect(target: string | null): string {
	// Only allow same-site, absolute paths to avoid open-redirects.
	if (target && target.startsWith('/') && !target.startsWith('//')) return target;
	return '/admin/new';
}

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
	const form = await request.formData();
	const username = String(form.get('username') ?? '');
	const password = String(form.get('password') ?? '');
	const dest = safeRedirect(form.get('redirect') ? String(form.get('redirect')) : null);

	if (!verifyCredentials(username, password)) {
		return redirect(`/login?error=1&redirect=${encodeURIComponent(dest)}`, 302);
	}

	const token = await createSessionToken({ username });
	cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
	return redirect(dest, 302);
};
