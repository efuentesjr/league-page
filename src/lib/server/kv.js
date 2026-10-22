/*
 * Tiny Upstash Redis client (REST API, no SDK) + edit-code checks,
 * shared by the server routes that store league data.
 */
import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { createHash } from 'node:crypto';
import { BIO_CODE_HASHES } from '$lib/server/bioCodes';

const creds = () => {
	const url = env.KV_REST_API_URL || env.UPSTASH_REDIS_REST_URL;
	const token = env.KV_REST_API_TOKEN || env.UPSTASH_REDIS_REST_TOKEN;
	if (!url || !token) throw error(503, 'Storage is not set up');
	return { url, token };
};

/** run one command, e.g. ['HGET', key, field] */
export const redis = async (command) => {
	const { url, token } = creds();
	const res = await fetch(url, {
		method: 'POST',
		headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
		body: JSON.stringify(command)
	});
	const data = await res.json().catch(() => ({}));
	if (!res.ok || data.error) throw error(502, data.error || 'Storage error');
	return data.result;
};

/** run several commands in one round trip; returns their results in order */
export const pipeline = async (commands) => {
	if (!commands.length) return [];
	const { url, token } = creds();
	const res = await fetch(`${url}/pipeline`, {
		method: 'POST',
		headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
		body: JSON.stringify(commands)
	});
	const data = await res.json().catch(() => []);
	if (!res.ok || !Array.isArray(data)) throw error(502, 'Storage error');
	return data.map((d) => (d?.error ? null : d?.result));
};

const sha = (salt, code) => createHash('sha256').update(`${salt}:${code}`).digest('hex');
const norm = (code) => String(code || '').trim().toUpperCase();

export const isManagerCode = (managerID, code) =>
	!!norm(code) && managerID !== 'commissioner' && BIO_CODE_HASHES[managerID] === sha(managerID, norm(code));

export const isCommissionerCode = (code) => !!norm(code) && BIO_CODE_HASHES.commissioner === sha('commissioner', norm(code));

export const knownManager = (managerID) => managerID in BIO_CODE_HASHES && managerID !== 'commissioner';

/** pairs from HGETALL -> object */
export const hashToObject = (flat) => {
	const o = {};
	for (let i = 0; i < (flat || []).length; i += 2) o[flat[i]] = flat[i + 1];
	return o;
};
