/// <reference types="astro/client" />

declare namespace App {
	interface Locals {
		user: import('./lib/auth').SessionUser | null;
		lang: import('./lib/i18n').Lang;
	}
}
