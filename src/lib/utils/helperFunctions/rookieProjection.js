import { ROOKIE_MOCK } from '$lib/utils/rookieMock';

/*
 * Picks the projected players for the upcoming rookie draft board.
 *
 *   1. After the NFL draft: DynastyProcess lists the class with NFL teams
 *      → automatic projection (superflex value order), refreshed weekly.
 *   2. Before that: the commissioner's mock for that season (rookieMock.js).
 *   3. No mock for that season: DynastyProcess's pre-draft class, if listed.
 *   4. Otherwise: nothing (squares stay empty).
 */

const POSITIONS = new Set(['QB', 'RB', 'WR', 'TE']);
const MIN_CLASS = 16;

const parseLine = (line) => {
	const out = [];
	let cur = '', quoted = false;
	for (let i = 0; i < line.length; i++) {
		const c = line[i];
		if (quoted) {
			if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
			else if (c === '"') quoted = false;
			else cur += c;
		} else if (c === '"') quoted = true;
		else if (c === ',') { out.push(cur); cur = ''; }
		else cur += c;
	}
	out.push(cur);
	return out;
};

export const parseRookies = (text, season) => {
	const lines = text.split(/\r?\n/).filter(Boolean);
	const header = parseLine(lines[0]);
	const [iName, iPos, iTeam, iYear, iVal, iDate] =
		['player', 'pos', 'team', 'draft_year', 'value_2qb', 'scrape_date'].map((n) => header.indexOf(n));
	let updated = null;
	const rookies = [];
	for (const line of lines.slice(1)) {
		const r = parseLine(line);
		if (!updated && r[iDate]) updated = r[iDate];
		if (r[iYear] !== String(season) || !POSITIONS.has(r[iPos])) continue;
		const team = r[iTeam] && !['NA', 'FA', ''].includes(r[iTeam]) ? r[iTeam] : null;
		rookies.push({ name: r[iName], pos: r[iPos], team, value: Number(r[iVal]) || 0 });
	}
	rookies.sort((a, b) => b.value - a.value);
	return { updated, rookies };
};

export const normalizeName = (name) =>
	String(name || '')
		.toLowerCase()
		.replace(/[.'’,-]/g, '')
		.replace(/\b(jr|sr|ii|iii|iv|v)\b/g, '')
		.replace(/\s+/g, ' ')
		.trim();

const sleeperIndex = (players) => {
	const idx = new Map();
	for (const [id, p] of Object.entries(players || {})) {
		if (!POSITIONS.has(p?.pos)) continue;
		const key = `${normalizeName(`${p.fn} ${p.ln}`)}|${p.pos}`;
		if (!idx.has(key)) idx.set(key, id);
	}
	return idx;
};

const initials = (name) =>
	normalizeName(name).split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');

export const chooseProspects = (season, projection, players, mock = ROOKIE_MOCK) => {
	const rookies = projection?.rookies || [];
	const drafted = rookies.filter((r) => r.team);
	let mode, list, label, updated;
	if (drafted.length >= MIN_CLASS) {
		mode = 'auto';
		list = drafted.map((r) => ({ name: r.name, pos: r.pos, sub: r.team }));
		label = 'Automatic projection: rookies ranked by DynastyProcess superflex value';
		updated = projection.updated;
	} else if (mock && Number(mock.season) === Number(season) && mock.players?.length) {
		mode = 'mock';
		list = mock.players.map((p) => ({ name: p.name, pos: p.pos, sub: p.school }));
		label = mock.source;
		updated = mock.updated;
	} else if (rookies.length >= MIN_CLASS) {
		mode = 'preDraft';
		list = rookies.map((r) => ({ name: r.name, pos: r.pos, sub: 'Pre-NFL draft' }));
		label = 'Pre-NFL draft rankings from DynastyProcess superflex values';
		updated = projection.updated;
	} else {
		return null;
	}
	// Headshots only once the class is real NFL rookies; before that a prospect
	// could share a name with a veteran already in Sleeper.
	const idx = mode === 'auto' ? sleeperIndex(players) : new Map();
	const picks = list.map((p) => ({
		...p,
		initials: initials(p.name),
		sleeperID: idx.get(`${normalizeName(p.name)}|${p.pos}`) || null
	}));
	return { mode, label, updated, picks };
};
