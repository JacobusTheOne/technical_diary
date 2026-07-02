// Single-admin site: "today" means the admin's home timezone, not the
// server's (Netlify functions run in UTC).
const TIME_ZONE = 'America/Sao_Paulo';

/** Today's date as YYYY-MM-DD in the admin's timezone. */
export function todayIsoDate(): string {
	// en-CA formats as YYYY-MM-DD.
	return new Intl.DateTimeFormat('en-CA', {
		timeZone: TIME_ZONE,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
	}).format(new Date());
}
