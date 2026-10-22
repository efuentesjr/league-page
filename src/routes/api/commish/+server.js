/*
 * Commissioner unlock: checks the commissioner code (same hashed code as
 * manager bios). Used to reveal commissioner-only tools on the site.
 */
import { json } from '@sveltejs/kit';
import { createHash } from 'node:crypto';
import { BIO_CODE_HASHES } from '$lib/server/bioCodes';

export async function POST({ request }) {
	const body = await request.json().catch(() => ({}));
	const code = String(body?.code || '').trim().toUpperCase();
	const ok = !!code && BIO_CODE_HASHES.commissioner === createHash('sha256').update(`commissioner:${code}`).digest('hex');
	return json({ ok }, { status: ok ? 200 : 403 });
}
