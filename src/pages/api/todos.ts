import type { APIRoute } from 'astro';
import { createTodo, sanitizeTodoInput } from '../../lib/todos';

export const POST: APIRoute = async ({ request, locals, redirect }) => {
	// Middleware guards /admin, but this endpoint lives under /api, so check here too.
	if (!locals.user) return redirect('/login', 302);

	const form = await request.formData();
	const raw = String(form.get('json') ?? '');

	let parsed: unknown;
	try {
		parsed = JSON.parse(raw);
	} catch {
		return redirect('/admin/todos/new?error=json', 302);
	}

	// Accept either a single todo object or an array of them.
	const items = Array.isArray(parsed) ? parsed : [parsed];
	const sanitized = items.map((item) => sanitizeTodoInput(item));
	if (sanitized.some((result) => !result.ok)) {
		return redirect('/admin/todos/new?error=title', 302);
	}

	for (const result of sanitized) {
		if (result.ok) await createTodo(result.value);
	}

	return redirect('/admin/todos', 302);
};
