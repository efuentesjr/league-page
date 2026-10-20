/*
 * ============================================================
 * SLEEPER REQUEST CACHE (browser only)
 * ============================================================
 * Sits in front of every request to api.sleeper.app:
 *
 *  1. Identical requests made at the same time share one network call.
 *  2. Current-season data is reused for CURRENT_TTL (20 seconds), so
 *     live scores still update on every scoreboard refresh.
 *  3. Finished seasons (any league ID other than the current one) never
 *     change, so they're saved on the device (IndexedDB) for a week and
 *     repeat visits skip those requests entirely.
 *
 * Anything unexpected (private browsing, storage blocked, non-GET
 * requests, errors) falls straight through to a normal network request.
 */

const SLEEPER = 'https://api.sleeper.app/';
const CURRENT_TTL = 20 * 1000;
const PAST_TTL = 7 * 24 * 60 * 60 * 1000;
const DB_NAME = 'mffl-sleeper-cache';
const STORE = 'responses';

let dbPromise = null;

const openDB = () => {
	if (dbPromise) return dbPromise;
	dbPromise = new Promise((resolve) => {
		try {
			const req = indexedDB.open(DB_NAME, 1);
			req.onupgradeneeded = () => req.result.createObjectStore(STORE);
			req.onsuccess = () => resolve(req.result);
			req.onerror = () => resolve(null);
			req.onblocked = () => resolve(null);
		} catch {
			resolve(null);
		}
	});
	return dbPromise;
};

const idbGet = async (key) => {
	const db = await openDB();
	if (!db) return null;
	return new Promise((resolve) => {
		try {
			const req = db.transaction(STORE, 'readonly').objectStore(STORE).get(key);
			req.onsuccess = () => resolve(req.result || null);
			req.onerror = () => resolve(null);
		} catch {
			resolve(null);
		}
	});
};

const idbPut = async (key, value) => {
	const db = await openDB();
	if (!db) return;
	try {
		db.transaction(STORE, 'readwrite').objectStore(STORE).put(value, key);
	} catch {
		// storage full or blocked — fine, we just refetch next time
	}
};

const toResponse = (entry) =>
	new Response(entry.body, {
		status: entry.status,
		headers: { 'content-type': entry.type || 'application/json' }
	});

export const installSleeperCache = (currentLeagueID) => {
	if (typeof window === 'undefined' || window.__sleeperCacheInstalled) return;
	window.__sleeperCacheInstalled = true;

	const nativeFetch = window.fetch.bind(window);
	const memory = new Map(); // url -> { time, promise<entry> }

	const isPastSeason = (url) => {
		const m = url.match(/\/v1\/league\/(\d+)/);
		return !!m && m[1] !== String(currentLeagueID);
	};

	const load = async (url, past) => {
		if (past) {
			const saved = await idbGet(url);
			if (saved && Date.now() - saved.time < PAST_TTL) return saved;
		}
		const res = await nativeFetch(url);
		const entry = {
			status: res.status,
			type: res.headers.get('content-type'),
			body: await res.text(),
			time: Date.now()
		};
		if (past && res.ok) idbPut(url, entry);
		return entry;
	};

	const cachedFetch = (url) => {
		const past = isPastSeason(url);
		const hit = memory.get(url);
		if (hit && (past || Date.now() - hit.time < CURRENT_TTL)) {
			return hit.promise.then(toResponse);
		}
		const promise = load(url, past);
		memory.set(url, { time: Date.now(), promise });
		promise
			.then((entry) => {
				// don't keep errors around
				if (entry.status >= 400) memory.delete(url);
			})
			.catch(() => memory.delete(url));
		return promise.then(toResponse);
	};

	window.fetch = (input, init) => {
		try {
			const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input?.url;
			const method = (init?.method || (typeof input === 'object' && input?.method) || 'GET').toUpperCase();
			const noCache = init?.cache === 'no-store' || init?.cache === 'reload';
			if (!url || method !== 'GET' || noCache || !url.startsWith(SLEEPER)) {
				return nativeFetch(input, init);
			}
			return cachedFetch(url);
		} catch {
			return nativeFetch(input, init);
		}
	};
};
