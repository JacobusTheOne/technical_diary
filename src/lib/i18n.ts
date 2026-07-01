// ---------------------------------------------------------------------------
// Internationalization: English + Brazilian Portuguese.
//
// The active language is stored in a plain `lang` cookie and exposed on
// `Astro.locals.lang` by the middleware. It drives the UI strings below plus
// date/locale formatting; entry content itself is authored once, not per-language.
// ---------------------------------------------------------------------------

export type Lang = 'en' | 'pt';

export const LANG_COOKIE = 'lang';

/** Normalize an untrusted cookie value into a supported language. */
export function parseLang(value: string | undefined): Lang {
	return value === 'pt' ? 'pt' : 'en';
}

/** BCP-47 locale used for date formatting and the <html lang> attribute. */
export function localeFor(lang: Lang): string {
	return lang === 'pt' ? 'pt-BR' : 'en';
}

const strings = {
	en: {
		navHome: 'Home',
		navDiary: 'Diary',
		navAbout: 'About',
		diaryHeading: 'Diary',
		newEntry: '+ New entry',
		noEntries: 'No entries yet. Log in to write the first one.',
		newEntryHeading: 'New entry',
		logout: 'Log out',
		fieldTitle: 'Title',
		fieldDate: 'Date',
		fieldBody: 'Body',
		markdownHint: '(Markdown supported)',
		publish: 'Publish',
		save: 'Save changes',
		edit: 'Edit',
		editHeading: 'Edit entry',
		errMissing: 'Title and body are both required.',
		errDate: 'That date is not valid.',
		lastUpdated: 'Last updated on',
		login: 'Log in',
		loginError: 'Incorrect username or password.',
		fieldUsername: 'Username',
		fieldPassword: 'Password',
		navTodos: 'Todos',
		todosHeading: 'Todos',
		newTodo: '+ New todo',
		newTodoHeading: 'New todo',
		editTodoHeading: 'Edit todo',
		noTodos: 'No todos yet. Add one from the template.',
		openSection: 'Open',
		completedSection: 'Completed',
		openEstimate: 'Open estimate',
		markDone: 'Mark done',
		reopen: 'Reopen',
		deleteLabel: 'Delete',
		jsonHint: 'Edit the JSON template below (a single todo or an array), then submit.',
		fieldGoal: 'Goal',
		fieldEstimate: 'Estimate',
		fieldPriority: 'Priority',
		fieldIdeas: 'Ideas',
		fieldSteps: 'Steps',
		fieldNotes: 'Notes',
		hoursSuffix: 'h',
		errInvalidJson: "That isn't valid JSON. Please fix it and try again.",
		errTodoTitle: 'Each todo needs a title.',
		weekView: 'Week view',
		listView: 'List view',
		unscheduled: 'Unscheduled',
		prevWeek: '← Previous',
		nextWeek: 'Next →',
		thisWeek: 'This week',
		dragHint: 'Drag a step onto a day to schedule it. Drag back to Unscheduled to clear.',
		noSteps: 'No steps yet. Add steps to a todo, then schedule them here.',
	},
	pt: {
		navHome: 'Início',
		navDiary: 'Diário',
		navAbout: 'Sobre',
		diaryHeading: 'Diário',
		newEntry: '+ Nova entrada',
		noEntries: 'Nenhuma entrada ainda. Faça login para escrever a primeira.',
		newEntryHeading: 'Nova entrada',
		logout: 'Sair',
		fieldTitle: 'Título',
		fieldDate: 'Data',
		fieldBody: 'Corpo',
		markdownHint: '(Markdown suportado)',
		publish: 'Publicar',
		save: 'Salvar alterações',
		edit: 'Editar',
		editHeading: 'Editar entrada',
		errMissing: 'Título e corpo são obrigatórios.',
		errDate: 'Essa data não é válida.',
		lastUpdated: 'Última atualização em',
		login: 'Entrar',
		loginError: 'Usuário ou senha incorretos.',
		fieldUsername: 'Usuário',
		fieldPassword: 'Senha',
		navTodos: 'Tarefas',
		todosHeading: 'Tarefas',
		newTodo: '+ Nova tarefa',
		newTodoHeading: 'Nova tarefa',
		editTodoHeading: 'Editar tarefa',
		noTodos: 'Nenhuma tarefa ainda. Adicione uma a partir do modelo.',
		openSection: 'Abertas',
		completedSection: 'Concluídas',
		openEstimate: 'Estimativa em aberto',
		markDone: 'Concluir',
		reopen: 'Reabrir',
		deleteLabel: 'Excluir',
		jsonHint: 'Edite o modelo JSON abaixo (uma tarefa ou uma lista) e envie.',
		fieldGoal: 'Objetivo',
		fieldEstimate: 'Estimativa',
		fieldPriority: 'Prioridade',
		fieldIdeas: 'Ideias',
		fieldSteps: 'Passos',
		fieldNotes: 'Notas',
		hoursSuffix: 'h',
		errInvalidJson: 'JSON inválido. Corrija e tente novamente.',
		errTodoTitle: 'Cada tarefa precisa de um título.',
		weekView: 'Visão semanal',
		listView: 'Visão em lista',
		unscheduled: 'Sem agendamento',
		prevWeek: '← Anterior',
		nextWeek: 'Próxima →',
		thisWeek: 'Esta semana',
		dragHint: 'Arraste um passo para um dia para agendá-lo. Arraste de volta para Sem agendamento para limpar.',
		noSteps: 'Nenhum passo ainda. Adicione passos a uma tarefa e agende-os aqui.',
	},
} as const;

export type Strings = (typeof strings)['en'];

/** UI strings for the given language. */
export function t(lang: Lang): Strings {
	return strings[lang];
}
