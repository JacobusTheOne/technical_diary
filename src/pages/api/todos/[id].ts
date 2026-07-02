import type { APIRoute } from 'astro';
import {
	deleteTodo,
	sanitizeTodoInput,
	scheduleTodoStep,
	toggleTodo,
	toggleTodoStep,
	updateTodo,
} from '../../../lib/todos';

export const POST: APIRoute = async ({ request, params, locals, redirect }) => {
	// Middleware guards /admin, but this endpoint lives under /api, so check here too.
	if (!locals.user) return redirect('/login', 302);

	const id = Number(params.id);
	if (!Number.isInteger(id)) return redirect('/admin/todos', 302);

	const form = await request.formData();
	const action = String(form.get('_action') ?? 'update');

	if (action === 'toggle') {
		await toggleTodo(id);
		return redirect('/admin/todos', 302);
	}

	// Optional sub-task index; absent/empty means the action targets the step itself.
	const subRaw = form.get('subIndex');
	const subIndex = subRaw != null && subRaw !== '' ? Number(subRaw) : undefined;
	const hasSub = subIndex !== undefined && Number.isInteger(subIndex);

	if (action === 'toggle-step') {
		const stepIndex = Number(form.get('stepIndex'));
		if (Number.isInteger(stepIndex)) {
			await toggleTodoStep(id, stepIndex, hasSub ? subIndex : undefined);
		}
		// fetch()-based callers update the UI in place; no redirect needed.
		if (form.get('ajax')) return new Response(null, { status: 204 });
		return redirect('/admin/todos', 302);
	}

	// Called via fetch() from the drag-and-drop week board; no redirect needed.
	if (action === 'schedule-step') {
		const stepIndex = Number(form.get('stepIndex'));
		const dateRaw = String(form.get('date') ?? '');
		const date = /^\d{4}-\d{2}-\d{2}$/.test(dateRaw) ? dateRaw : null;
		if (Number.isInteger(stepIndex)) {
			await scheduleTodoStep(id, stepIndex, date, hasSub ? subIndex : undefined);
		}
		return new Response(null, { status: 204 });
	}

	if (action === 'delete') {
		await deleteTodo(id);
		return redirect('/admin/todos', 302);
	}

	// Default: update from the pasted JSON.
	const raw = String(form.get('json') ?? '');
	let parsed: unknown;
	try {
		parsed = JSON.parse(raw);
	} catch {
		return redirect(`/admin/todos/edit/${id}?error=json`, 302);
	}

	const result = sanitizeTodoInput(parsed);
	if (!result.ok) {
		return redirect(`/admin/todos/edit/${id}?error=title`, 302);
	}

	const updated = await updateTodo(id, result.value);
	if (!updated) return redirect('/admin/todos', 302);

	return redirect('/admin/todos', 302);
};
