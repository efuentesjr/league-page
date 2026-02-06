// src/routes/playoffs-projection/+page.server.js
export const prerender = false;

import { env } from '$env/dynamic/public';
import { leagueID } from '$lib/utils/leagueInfo';
import { getLeagueTeamManagers } from '$lib/utils/helper';

// Temporary fallback only. Once projections JSON includes roster_id, this becomes irrelevant.
const slugMap = {
  'Bay Area Par': 'bay-area-party-supplies',
  'CeeDees TDs': 'ceedees-tds',
  'Chosen one.': 'chosen-one',
  'Peoples Champ': 'peoples-champ',
  'Blue Tent Al': 'blue-tent-all-stars',
  'Los Loquitos': 'los-loquitos',
  'bLuE BaLLeRs': 'blue-ballers',
  'TexasTimeshi': 'texastimeshifts',
  'Brute Force': 'brute-force-attack',
  'Comeback Kid': 'comeback-kid',
  'SlickBears': 'slickbears',
  'Demboyz': 'demboyz',
  'PrimeTime Pr': 'primetime-prodigies',
  'Do it to the': 'do-it-to-them',
  'Loud and Str': 'loud-and-stroud',
  'Vick2times': 'vick2times'
};

const toStatuses = (st = {}) => ({
  divStatus: st.division ? `C:${st.division}` : '',
  playStatus: [st.playoffs ? `C:${st.playoffs}` : '', st.title ? `T:${st.title}` : '']
    .filter(Boolean)
    .join(' ')
});

function keyify(s) {
  return String(s ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\u2019']/g, '')       // remove apostrophes (handles People’s)
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function toAvatarUrl(v) {
  if (!v) return '';
  if (typeof v === 'string' && /^https?:\/\//i.test(v)) return v;
  if (typeof v === 'string' && v.startsWith('/')) return v;
  return `https://sleepercdn.com/avatars/thumbs/${v}`;
}

function normalizeRow(r) {
  let wins = 0, losses = 0, ties = 0;
  if (typeof r.record === 'string') {
    const [w, l, t] = r.record.split('-').map((n) => Number(n || 0));
    wins = Number.isFinite(w) ? w : 0;
    losses = Number.isFinite(l) ? l : 0;
    ties = Number.isFinite(t) ? t : 0;
  }

  const { divStatus, playStatus } = toStatuses(r.status || {});
  const slug = (r.slug && String(r.slug)) || slugMap[r.team] || null;

  return {
    // Stable id (future): if you add roster_id to JSON, this flows through automatically
    roster_id: Number.isFinite(Number(r.roster_id)) ? Number(r.roster_id) : null,

    slug,
    teamName: r.team || '',
    division: String(r.division ?? ''),
    wins, losses, ties,
    points: Number(r.points ?? 0),
    divStatus, playStatus,
    min: r.min ?? '',
    targets: r.targets ?? '',
    gIn: r.gamesIn ?? '',
    divTgts: r.divisionTargets ?? ''
  };
}

function normalize(rows = []) {
  return rows.map(normalizeRow);
}

// ——— SoS (past-only, safe fallback) ———
const SLEEPER = 'https://api.sleeper.app/v1';

async function getLeague(fetch) {
  const res = await fetch(`${SLEEPER}/league/${leagueID}`);
  if (!res.ok) throw new Error('league fetch failed');
  return res.json();
}

async function getMatchups(fetch, week) {
  const res = await fetch(`${SLEEPER}/league/${leagueID}/matchups/${week}`);
  if (!res.ok) return [];
  return res.json();
}

function pairsForWeek(matchups) {
  const byId = new Map();
  for (const m of matchups) {
    const list = byId.get(m.matchup_id) || [];
    list.push(m);
    byId.set(m.matchup_id, list);
  }
  const out = [];
  for (const list of byId.values()) {
    if (list.length < 2) continue;
    const [a, b] = list;
    out.push(
      { me: a.roster_id, opp: b.roster_id, myPts: a.points || 0, oppPts: b.points || 0 },
      { me: b.roster_id, opp: a.roster_id, myPts: b.points || 0, oppPts: a.points || 0 }
    );
  }
  return out;
}

async function computeSoSPast(fetch) {
  let regWeeks = 14;
  try {
    const league = await getLeague(fetch);
    regWeeks = Number(league.settings?.playoff_week_start) - 1 || 14;
  } catch {}

  const gp = new Map();
  const pf = new Map();
  const oppPts = new Map();

  for (let w = 1; w <= regWeeks; w++) {
    const week = await getMatchups(fetch, w);
    if (!week.length) continue;
    for (const p of pairsForWeek(week)) {
      gp.set(p.me, (gp.get(p.me) || 0) + 1);
      pf.set(p.me, (pf.get(p.me) || 0) + p.myPts);
      oppPts.set(p.me, (oppPts.get(p.me) || 0) + p.oppPts);
    }
  }

  const totalPF = Array.from(pf.values()).reduce((a, b) => a + b, 0);
  const totalGP = Array.from(gp.values()).reduce((a, b) => a + b, 0);
  const leagueAvgPPG = totalGP ? totalPF / totalGP : 0;

  const past = {};
  for (const id of gp.keys()) {
    const g = gp.get(id) || 0;
    const o = oppPts.get(id) || 0;
    const oppPPG = g ? o / g : 0;
    past[id] = {
      oppPPG: Number(oppPPG.toFixed(2)),
      index: leagueAvgPPG ? Number((oppPPG / leagueAvgPPG).toFixed(3)) : 0
    };
  }
  return { leagueAvgPPG: Number(leagueAvgPPG.toFixed(2)), past };
}

function buildLookupsFromLTM(ltm) {
  const year = ltm?.currentSeason;
  const mapForYear = ltm?.teamManagersMap?.[year] || {};

  const rosterMetaById = {};
  const rosterIdByNameKey = {};

  for (const [ridStr, entry] of Object.entries(mapForYear)) {
    const rosterId = Number(ridStr);
    const team = entry?.team || {};

    const teamName =
      team.team_name ??
      team.name ??
      '';

    const slug =
      team.slug ??
      team.teamSlug ??
      team.team_slug ??
      null;

    rosterMetaById[rosterId] = {
      rosterId,
      slug,
      teamName,
      avatarUrl: toAvatarUrl(team.avatar)
    };

    const k = keyify(teamName);
    if (k && rosterIdByNameKey[k] == null) rosterIdByNameKey[k] = rosterId;
  }

  return { year, rosterMetaById, rosterIdByNameKey };
}

/** @type {import('./$types').PageServerLoad} */
export async function load({ fetch, setHeaders }) {
  const url = (env.PUBLIC_PROJECTIONS_URL || '').trim();
  if (!url) {
    return { projections: [], error: 'Missing PUBLIC_PROJECTIONS_URL' };
  }

  // 1) Load LTM (same shared source as Standings)
  let ltm = null;
  try {
    ltm = await getLeagueTeamManagers();
  } catch (e) {
    console.error('[playoffs-projection] getLeagueTeamManagers failed', e);
  }
  const lookups = ltm ? buildLookupsFromLTM(ltm) : null;

  // 2) Fetch projections JSON
  let projections = [];
  let error = null;

  try {
    const res = await fetch(url, { cache: 'no-store', redirect: 'follow' });
    if (!res.ok) {
      error = `Fetch failed: ${res.status}`;
    } else {
      const raw = await res.json();
      const rows = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
      projections = normalize(rows);
    }
  } catch (e) {
    error = String(e);
  }

  // 3) Join to roster_id + avatarUrl + canonical slug (stable once roster_id exists)
  if (lookups) {
    projections = projections.map((r) => {
      let rosterId = Number.isFinite(Number(r.roster_id)) ? Number(r.roster_id) : null;

      // If roster_id is not in JSON yet, try to match by team name from LTM
      if (!rosterId) {
        const nameKey = keyify(r.teamName);
        rosterId = (nameKey && lookups.rosterIdByNameKey[nameKey]) ? lookups.rosterIdByNameKey[nameKey] : null;
      }

      const meta = rosterId ? lookups.rosterMetaById?.[rosterId] : null;

      return {
        ...r,
        roster_id: rosterId,
        // keep existing slug if present, else prefer canonical from LTM, else fallback slugMap
        slug: r.slug || meta?.slug || null,
        // avatar/logo is now from the same shared source as Standings
        avatarUrl: meta?.avatarUrl || ''
      };
    }).filter((x) => !!x.slug);
  } else {
    // if we have no lookups, at least filter to rows that can still link
    projections = projections.filter((x) => !!x.slug);
  }

  // 4) SoS join now uses roster_id (stable once added to JSON)
  try {
    const sos = await computeSoSPast(fetch);
    projections = projections.map((r) => {
      const rosterId = Number(r.roster_id ?? NaN);
      const past = Number.isFinite(rosterId) ? sos.past?.[rosterId] : null;
      return past ? { ...r, sos: { leagueAvgPPG: sos.leagueAvgPPG, past } } : r;
    });
  } catch {}

  setHeaders({ 'cache-control': 'no-store' });
  return { projections, error };
}
