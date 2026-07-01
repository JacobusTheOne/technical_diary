import { getStore } from '@netlify/blobs';

const STORE_NAME = 'diary-todos';
const TODOS_KEY = 'todos.json';

export type Priority = 'low' | 'medium' | 'high';
const PRIORITIES: Priority[] = ['low', 'medium', 'high'];

export interface SubTask {
	text: string;
	done: boolean;
	// ISO date (YYYY-MM-DD) this sub-task is scheduled on the week board, or null.
	scheduledDate?: string | null;
}

export interface TodoStep {
	text: string;
	done: boolean;
	// ISO date (YYYY-MM-DD) this step is scheduled on the week board, or null.
	scheduledDate?: string | null;
	// One level of nested sub-tasks. When present, `done` is derived from them.
	subtasks?: SubTask[];
}

/** A step with sub-tasks is done iff every sub-task is done; else keep its own flag. */
function recomputeStepDone(step: TodoStep): void {
	if (step.subtasks && step.subtasks.length > 0) {
		step.done = step.subtasks.every((sub) => sub.done);
	}
}

export interface Todo {
	id: number;
	title: string;
	goal: string;
	timeEstimateHours: number | null;
	priority: Priority | null;
	ideas: string[];
	steps: TodoStep[];
	notes: string;
	done: boolean;
	createdAt: Date;
	updatedAt: Date;
}

interface StoredTodo extends Omit<Todo, 'createdAt' | 'updatedAt'> {
	createdAt: string;
	updatedAt: string;
}

/** The subset of a Todo that a pasted JSON template can set. */
export interface TodoInput {
	title: string;
	goal: string;
	timeEstimateHours: number | null;
	priority: Priority | null;
	ideas: string[];
	steps: TodoStep[];
	notes: string;
	done: boolean;
}

/** Prefilled template shown in the New-todo form. */
export const TODO_TEMPLATE_JSON = `{
  "title": "Short name of the todo",
  "goal": "The overall goal / why it matters",
  "timeEstimateHours": 2,
  "priority": "high",
  "ideas": ["First idea", "Another idea"],
  "steps": [
    { "text": "A simple step", "done": false },
    {
      "text": "A step with sub-tasks",
      "subtasks": [
        { "text": "Sub-task 1", "done": false },
        { "text": "Sub-task 2", "done": false }
      ]
    }
  ],
  "notes": "Any extra details"
}`;

function getTodosStore() {
	return getStore({ name: STORE_NAME, consistency: 'strong' });
}

function fromStored(todo: StoredTodo): Todo {
	return {
		...todo,
		createdAt: new Date(todo.createdAt),
		updatedAt: new Date(todo.updatedAt),
	};
}

function toStored(todo: Todo): StoredTodo {
	return {
		...todo,
		createdAt: todo.createdAt.toISOString(),
		updatedAt: todo.updatedAt.toISOString(),
	};
}

async function readStoredTodos(): Promise<StoredTodo[]> {
	const todos = await getTodosStore().get(TODOS_KEY, { type: 'json' });
	return Array.isArray(todos) ? (todos as StoredTodo[]) : [];
}

async function writeStoredTodos(todos: StoredTodo[]): Promise<void> {
	await getTodosStore().setJSON(TODOS_KEY, todos);
}

// ---------------------------------------------------------------------------
// Untrusted-input handling: todos are built from pasted JSON, so coerce every
// field into the expected shape rather than trusting it.
// ---------------------------------------------------------------------------

function asString(value: unknown): string {
	return typeof value === 'string' ? value.trim() : '';
}

function asStringArray(value: unknown): string[] {
	if (!Array.isArray(value)) return [];
	return value.map((item) => asString(item)).filter((item) => item.length > 0);
}

/** Accept a valid YYYY-MM-DD string, otherwise null. */
function asDateOrNull(value: unknown): string | null {
	return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}

function asSubtasks(value: unknown): SubTask[] {
	if (!Array.isArray(value)) return [];
	return value
		.map((item): SubTask => {
			if (typeof item === 'string') return { text: item.trim(), done: false, scheduledDate: null };
			if (item && typeof item === 'object') {
				return {
					text: asString((item as any).text),
					done: (item as any).done === true,
					scheduledDate: asDateOrNull((item as any).scheduledDate),
				};
			}
			return { text: '', done: false, scheduledDate: null };
		})
		.filter((sub) => sub.text.length > 0);
}

function asSteps(value: unknown): TodoStep[] {
	if (!Array.isArray(value)) return [];
	return value
		.map((item): TodoStep => {
			if (typeof item === 'string') return { text: item.trim(), done: false, scheduledDate: null };
			if (item && typeof item === 'object') {
				const subtasks = asSubtasks((item as any).subtasks);
				const step: TodoStep = {
					text: asString((item as any).text),
					done: (item as any).done === true,
					scheduledDate: asDateOrNull((item as any).scheduledDate),
					...(subtasks.length > 0 ? { subtasks } : {}),
				};
				// Parent completion is derived when sub-tasks exist.
				recomputeStepDone(step);
				return step;
			}
			return { text: '', done: false, scheduledDate: null };
		})
		.filter((step) => step.text.length > 0);
}

function asHours(value: unknown): number | null {
	const n = typeof value === 'string' ? Number(value) : value;
	return typeof n === 'number' && Number.isFinite(n) && n >= 0 ? n : null;
}

function asPriority(value: unknown): Priority | null {
	return PRIORITIES.includes(value as Priority) ? (value as Priority) : null;
}

/** Validate/coerce parsed JSON into a TodoInput; requires a non-empty title. */
export function sanitizeTodoInput(
	raw: unknown,
): { ok: true; value: TodoInput } | { ok: false; reason: 'title' } {
	const obj = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
	const title = asString(obj.title);
	if (!title) return { ok: false, reason: 'title' };

	return {
		ok: true,
		value: {
			title,
			goal: asString(obj.goal),
			timeEstimateHours: asHours(obj.timeEstimateHours),
			priority: asPriority(obj.priority),
			ideas: asStringArray(obj.ideas),
			steps: asSteps(obj.steps),
			notes: asString(obj.notes),
			done: obj.done === true,
		},
	};
}

// ---------------------------------------------------------------------------
// CRUD
// ---------------------------------------------------------------------------

export async function listTodos(): Promise<Todo[]> {
	const todos = await readStoredTodos();
	return todos.map(fromStored).sort((a, b) => {
		// Open todos first, then most-recently created.
		if (a.done !== b.done) return a.done ? 1 : -1;
		return b.createdAt.valueOf() - a.createdAt.valueOf();
	});
}

export async function findTodoById(id: number): Promise<Todo | undefined> {
	const todos = await readStoredTodos();
	const todo = todos.find((item) => item.id === id);
	return todo ? fromStored(todo) : undefined;
}

export async function createTodo(input: TodoInput): Promise<Todo> {
	const todos = await readStoredTodos();
	const now = new Date();
	const todo: Todo = {
		id: todos.reduce((max, item) => Math.max(max, item.id), 0) + 1,
		...input,
		createdAt: now,
		updatedAt: now,
	};

	await writeStoredTodos([...todos, toStored(todo)]);
	return todo;
}

export async function updateTodo(id: number, input: TodoInput): Promise<Todo | undefined> {
	const todos = await readStoredTodos();
	const index = todos.findIndex((item) => item.id === id);
	if (index === -1) return undefined;

	const existing = fromStored(todos[index]);
	// Keep id/createdAt; the pasted JSON drives everything else (incl. done).
	const updated: Todo = {
		...existing,
		...input,
		updatedAt: new Date(),
	};

	todos[index] = toStored(updated);
	await writeStoredTodos(todos);
	return updated;
}

export async function toggleTodo(id: number): Promise<Todo | undefined> {
	const todos = await readStoredTodos();
	const index = todos.findIndex((item) => item.id === id);
	if (index === -1) return undefined;

	const updated = fromStored(todos[index]);
	updated.done = !updated.done;
	updated.updatedAt = new Date();

	todos[index] = toStored(updated);
	await writeStoredTodos(todos);
	return updated;
}

export async function toggleTodoStep(
	id: number,
	stepIndex: number,
	subIndex?: number,
): Promise<Todo | undefined> {
	const todos = await readStoredTodos();
	const index = todos.findIndex((item) => item.id === id);
	if (index === -1) return undefined;

	const updated = fromStored(todos[index]);
	const step = updated.steps[stepIndex];
	if (!step) return updated;

	if (typeof subIndex === 'number') {
		const sub = step.subtasks?.[subIndex];
		if (!sub) return updated;
		sub.done = !sub.done;
		recomputeStepDone(step); // roll completion up to the parent step
	} else if (!step.subtasks || step.subtasks.length === 0) {
		// A step with sub-tasks is derived, so only plain steps toggle directly.
		step.done = !step.done;
	}

	updated.updatedAt = new Date();
	todos[index] = toStored(updated);
	await writeStoredTodos(todos);
	return updated;
}

export async function scheduleTodoStep(
	id: number,
	stepIndex: number,
	date: string | null,
	subIndex?: number,
): Promise<Todo | undefined> {
	const todos = await readStoredTodos();
	const index = todos.findIndex((item) => item.id === id);
	if (index === -1) return undefined;

	const updated = fromStored(todos[index]);
	const step = updated.steps[stepIndex];
	if (!step) return updated;

	if (typeof subIndex === 'number') {
		const sub = step.subtasks?.[subIndex];
		if (!sub) return updated;
		sub.scheduledDate = asDateOrNull(date);
	} else {
		step.scheduledDate = asDateOrNull(date);
	}

	updated.updatedAt = new Date();
	todos[index] = toStored(updated);
	await writeStoredTodos(todos);
	return updated;
}

export async function deleteTodo(id: number): Promise<boolean> {
	const todos = await readStoredTodos();
	const remaining = todos.filter((item) => item.id !== id);
	if (remaining.length === todos.length) return false;

	await writeStoredTodos(remaining);
	return true;
}
