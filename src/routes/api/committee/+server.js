/*
 * Competition Committee voting (Committee Night).
 *
 * Storage (Upstash Redis):
 *   mffl:cc:proposals          hash  id -> JSON proposal
 *   mffl:cc:votes:<id>         hash  managerID -> option index   (secret ballot)
 *
 * Secret ballot: while a proposal is open, only the number of votes is ever
 * returned. Totals appear when the commissioner closes it. Individual votes
 * are never returned to anyone (a manager can see their own choice).
 *
 * GET  /api/committee            all proposals (+ vote counters, attendance)
 * GET  /api/committee?live=1     proposals + counter for open ones (cheap poll)
 * POST /api/committee            { action, ... }  see below
 */
import { json, error } from '@sveltejs/kit';
import { redis, pipeline, isManagerCode, isCommissionerCode, knownManager, hashToObject } from '$lib/server/kv';

const P = 'mffl:cc:proposals';
const V = (id) => `mffl:cc:votes:${id}`;
const VOTERS = 16;

// pass rules
const RULES = {
	regular: { label: 'Regular', text: 'Most votes wins' },
	scoring: { label: 'Scoring change', text: 'Majority and at least 9 yes votes', minYes: 9 },
	dues: { label: 'Raising dues', text: 'Needs 11 yes votes', minYes: 11 }
};

const clean = (s, max) =>
	String(s ?? '')
		.replace(/<[^>]*>/g, '')
		.replace(/\r/g, '')
		.trim()
		.slice(0, max);

const loadProposals = async () => {
	const raw = hashToObject(await redis(['HGETALL', P]));
	return Object.values(raw)
		.map((j) => {
			try {
				return JSON.parse(j);
			} catch {
				return null;
			}
		})
		.filter(Boolean)
		.sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || (a.createdAt || '').localeCompare(b.createdAt || ''));
};

const save = (p) => redis(['HSET', P, p.id, JSON.stringify(p)]);

/** decide a closed proposal from its counts */
const decide = (p, counts) => {
	const rule = RULES[p.type] || RULES.regular;
	const total = counts.reduce((a, b) => a + b, 0);
	const result = { counts, total, tie: false, winner: null, passed: null, note: '' };
	if (!total) {
		result.note = 'No votes cast';
		result.passed = false;
		return result;
	}
	const yesNo = p.options.length === 2 && p.options[0] === 'Yes' && p.options[1] === 'No';

	if (p.type === 'dues' || p.type === 'scoring') {
		const yes = counts[0], no = counts[1];
		if (p.type === 'dues') {
			result.passed = yes >= rule.minYes;
			result.note = result.passed ? `${yes} yes (needed ${rule.minYes})` : `${yes} yes, needed ${rule.minYes}`;
		} else {
			const majority = yes > no;
			result.passed = majority && yes >= rule.minYes;
			if (yes === no && yes >= rule.minYes) {
				result.tie = true; // can only happen with 18+ voters, kept for safety
				result.passed = null;
			}
			result.note = result.passed
				? `${yes} yes (needed a majority and ${rule.minYes})`
				: yes < rule.minYes
					? `${yes} yes, needed ${rule.minYes}`
					: 'No majority';
		}
		result.winner = result.passed ? 0 : 1;
		return result;
	}

	// regular: most votes wins, ties go to the commissioner
	const top = Math.max(...counts);
	const leaders = counts.map((c, i) => (c === top ? i : -1)).filter((i) => i >= 0);
	if (leaders.length > 1) {
		result.tie = true;
		result.tied = leaders;
		result.note = 'Tie: commissioner decides';
		return result;
	}
	result.winner = leaders[0];
	result.passed = yesNo ? leaders[0] === 0 : true;
	result.note = 'Most votes';
	return result;
};

// public shape: never includes individual votes; counts only once closed
const publicProposal = (p, voteCount) => {
	const out = { ...p, voteCount, voters: VOTERS };
	if (p.status === 'open' || p.status === 'draft') delete out.result;
	return out;
};

export async function GET({ url }) {
	const proposals = await loadProposals();
	const live = url.searchParams.get('live') === '1';
	const counted = live ? proposals.filter((p) => p.status === 'open') : proposals.filter((p) => p.status !== 'draft');
	const lens = await pipeline(counted.map((p) => ['HLEN', V(p.id)]));
	const countOf = Object.fromEntries(counted.map((p, i) => [p.id, Number(lens[i] || 0)]));

	const body = { proposals: proposals.map((p) => publicProposal(p, countOf[p.id] ?? null)), rules: RULES };

	if (!live) {
		// attendance: who voted on anything, per season (names only, no choices)
		const voted = await pipeline(counted.map((p) => ['HKEYS', V(p.id)]));
		const attendance = {};
		counted.forEach((p, i) => {
			const set = (attendance[p.season] ??= new Set());
			for (const m of voted[i] || []) set.add(m);
		});
		body.attendance = Object.fromEntries(Object.entries(attendance).map(([s, set]) => [s, [...set]]));
	}
	return json(body, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST({ request }) {
	const b = await request.json().catch(() => ({}));
	const action = String(b.action || '');

	// ----- manager actions -----
	if (action === 'vote' || action === 'myvote') {
		const managerID = String(b.managerID || '');
		if (!knownManager(managerID)) throw error(400, 'Pick your name first');
		if (!isManagerCode(managerID, b.code)) throw error(403, 'That code is not right for this manager');
		const p = (await loadProposals()).find((x) => x.id === String(b.proposalID));
		if (!p) throw error(404, 'Proposal not found');

		if (action === 'myvote') {
			const v = await redis(['HGET', V(p.id), managerID]);
			return json({ choice: v == null ? null : Number(v) });
		}
		if (p.status !== 'open') throw error(409, 'Voting is not open for this proposal');
		const choice = Number(b.choice);
		if (!Number.isInteger(choice) || choice < 0 || choice >= p.options.length) throw error(400, 'Pick one of the choices');
		const [, count] = await pipeline([['HSET', V(p.id), managerID, String(choice)], ['HLEN', V(p.id)]]);
		return json({ ok: true, choice, voteCount: Number(count || 0) });
	}

	// ----- commissioner actions -----
	if (!isCommissionerCode(b.code)) throw error(403, 'That is not the commissioner code');
	const all = await loadProposals();
	const find = () => {
		const p = all.find((x) => x.id === String(b.proposalID));
		if (!p) throw error(404, 'Proposal not found');
		return p;
	};

	if (action === 'check') return json({ ok: true });

	if (action === 'create' || action === 'update') {
		const title = clean(b.title, 300);
		if (!title) throw error(400, 'Give the proposal a title');
		const type = RULES[b.type] ? b.type : 'regular';
		let options = (Array.isArray(b.options) ? b.options : []).map((o) => clean(o, 120)).filter(Boolean).slice(0, 6);
		if (type !== 'regular' || options.length < 2) options = ['Yes', 'No'];
		const base = action === 'update' ? find() : null;
		if (base && base.status !== 'draft') throw error(409, 'Only proposals that have not been voted on can be edited');
		const p = {
			...(base || {}),
			id: base?.id || `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
			title,
			details: clean(b.details, 800),
			owner: clean(b.owner, 80),
			ref: clean(b.ref, 60),
			cardId: b.cardId ? String(b.cardId) : base?.cardId || null,
			type,
			options,
			season: Number(b.season) || base?.season || new Date().getFullYear() + 1,
			status: base?.status || 'draft',
			order: base?.order ?? all.length,
			createdAt: base?.createdAt || new Date().toISOString()
		};
		await save(p);
		return json({ ok: true, proposal: p });
	}

	if (action === 'delete') {
		const p = find();
		await pipeline([['HDEL', P, p.id], ['DEL', V(p.id)]]);
		return json({ ok: true });
	}

	if (action === 'open') {
		const p = find();
		if (p.status === 'closed') throw error(409, 'Reset it first to vote again');
		p.status = 'open';
		p.openedAt = new Date().toISOString();
		delete p.result;
		await save(p);
		return json({ ok: true, proposal: p });
	}

	if (action === 'close') {
		const p = find();
		if (p.status !== 'open') throw error(409, 'This proposal is not open');
		const votes = hashToObject(await redis(['HGETALL', V(p.id)]));
		const counts = p.options.map(() => 0);
		for (const v of Object.values(votes)) if (counts[Number(v)] != null) counts[Number(v)]++;
		p.result = decide(p, counts);
		p.status = p.result.tie ? 'tie' : 'closed';
		p.closedAt = new Date().toISOString();
		await save(p);
		return json({ ok: true, proposal: publicProposal(p, Object.keys(votes).length) });
	}

	if (action === 'breakTie') {
		const p = find();
		if (p.status !== 'tie') throw error(409, 'This proposal is not tied');
		const w = Number(b.winner);
		if (!(p.result.tied || [0, 1]).includes(w)) throw error(400, 'Pick one of the tied choices');
		const yesNo = p.options.length === 2 && p.options[0] === 'Yes' && p.options[1] === 'No';
		p.result = { ...p.result, tie: false, winner: w, passed: yesNo ? w === 0 : true, tieBroken: true, note: 'Tie broken by commissioner' };
		p.status = 'closed';
		await save(p);
		return json({ ok: true, proposal: p });
	}

	if (action === 'reset') {
		const p = find();
		p.status = 'draft';
		delete p.result;
		delete p.openedAt;
		delete p.closedAt;
		await pipeline([['DEL', V(p.id)], ['HSET', P, p.id, JSON.stringify(p)]]);
		return json({ ok: true, proposal: p });
	}

	if (action === 'move') {
		const p = find();
		const dir = Number(b.dir) < 0 ? -1 : 1;
		const list = all.slice();
		const i = list.indexOf(p), j = i + dir;
		if (j < 0 || j >= list.length) return json({ ok: true });
		[list[i], list[j]] = [list[j], list[i]];
		await pipeline(list.map((x, k) => ['HSET', P, x.id, JSON.stringify({ ...x, order: k })]));
		return json({ ok: true });
	}

	throw error(400, 'Unknown action');
}
