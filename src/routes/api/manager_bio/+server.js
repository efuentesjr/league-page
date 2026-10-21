/*
 * Manager philosophy / bio that managers edit themselves.
 * Stored in Upstash Redis (Vercel integration) as one hash: field = managerID,
 * value = JSON { philosophy, bio, updated }.
 *
 * GET  /api/manager_bio            -> { bios: { managerID: {...} } }
 * POST /api/manager_bio  { managerID, code, philosophy, bio }
 */
import { json, error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { createHash } from 'node:crypto';
import { BIO_CODE_HASHES } from '$lib/server/bioCodes';

const KEY = 'mffl:bios';
const MAX_PHILOSOPHY = 600;
const MAX_BIO = 300;

const redis = async (command) => {
	const url = env.KV_REST_API_URL || env.UPSTASH_REDIS_REST_URL;
	const token = env.KV_REST_API_TOKEN || env.UPSTASH_REDIS_REST_TOKEN;
	if (!url || !token) throw error(503, 'Bio storage is not set up');
	const res = await fetch(url, {
		method: 'POST',
		headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
		body: JSON.stringify(command)
	});
	const data = await res.json().catch(() => ({}));
	if (!res.ok || data.error) throw error(502, data.error || 'Storage error');
	return data.result;
};

// plain text only: drop any tags, collapse runaway blank lines, trim to length
const clean = (s, max) =>
	String(s ?? '')
		.replace(/<[^>]*>/g, '')
		.replace(/\r/g, '')
		.replace(/\n{3,}/g, '\n\n')
		.trim()
		.slice(0, max);

const hash = (salt, code) => createHash('sha256').update(`${salt}:${code}`).digest('hex');

const authorized = (managerID, code) => {
	const c = String(code || '').trim().toUpperCase();
	if (!c) return false;
	return BIO_CODE_HASHES[managerID] === hash(managerID, c) || BIO_CODE_HASHES.commissioner === hash('commissioner', c);
};

export async function GET() {
	const flat = (await redis(['HGETALL', KEY])) || [];
	const bios = {};
	for (let i = 0; i < flat.length; i += 2) {
		try {
			bios[flat[i]] = JSON.parse(flat[i + 1]);
		} catch {
			/* skip bad rows */
		}
	}
	return json({ bios }, { headers: { 'Cache-Control': 'public, max-age=0, s-maxage=20, stale-while-revalidate=300' } });
}

export async function POST({ request }) {
	const body = await request.json().catch(() => null);
	const managerID = String(body?.managerID || '');
	if (!managerID || !(managerID in BIO_CODE_HASHES) || managerID === 'commissioner') throw error(400, 'Unknown manager');
	if (!authorized(managerID, body?.code)) throw error(403, 'That edit code is not right');

	if (body?.reset) {
		await redis(['HDEL', KEY, managerID]);
		return json({ ok: true, entry: null });
	}

	const entry = {
		philosophy: clean(body?.philosophy, MAX_PHILOSOPHY),
		bio: clean(body?.bio, MAX_BIO),
		updated: new Date().toISOString()
	};
	await redis(['HSET', KEY, managerID, JSON.stringify(entry)]);
	return json({ ok: true, entry });
}
