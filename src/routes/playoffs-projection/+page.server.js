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
  'Vick2times': 'vick2times',

  // Add these if/when you know their real slugs (your JSON currently includes these labels)
  // 'The People’s': 'peoples-champ',
  // 'The Comeback': 'comeback-kid',
  // 'Pete Weber B': '???',
  // '88boyz11': '???'
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
    .replace(/[\u2019']/g, '') // remove apostrophes (handles People’s)
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
  let wins = 0,
    losses = 0,
    ties = 0;

  if (typeof r.record === 'string') {
    const [w, l, t] = r.record.split('-').map((n) => Number(n || 0));
    wins = Number.isFinite(w) ? w : 0;
    losses = Number.isFinite(l) ? l : 0;
    ties = Number.isFinite(t) ? t : 0;
  }

  const { divStatus, playStatus } = toStatuses(r.status || {});

  // NOTE: slugMap uses the raw "team" field from the JSON (which is often truncated)
  const slug = (r.slug && String(r.slug)) || slugMap[r.team] || null;

  return {
    // Stable id (future): if you add roster_id to JSON, this flows through automatically
    roster_id: Number.isFinite(Number(r.roster_id)) ? Number(r.roster_id) : null,

    // Link/display helpers
    slug,
    teamLabel: r.team || '', // keep the raw label from projections JSON
    teamName: r.team || '',  // alias (your UI expects teamName today)

    division: String(r.division ?? ''),
    wins,
    losses,
    ties,
    points: Number(r.points ?? 0),
    divStatus,
    playStatus,
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
  const rosterIdBySlug = {};
  const rosterNameKeyToId = {}; // exact-ish match
  const rosterNameKeys = [];    // for fuzzy contains match

  for (const [ridStr, entry] of Object.entries(mapForYear)) {
    const rosterId = Number(ridStr);
    const team = entry?.team || {};

    const teamName = (team.team_name ?? team.name ?? '').trim();
    const slug = team.slug ?? team.teamSlug ?? team.team_slug ?? null;

    const nameKey = keyify(teamName);

    const meta = {
      rosterId,
      slug,
      teamName,
      nameKey,
      avatarUrl: toAvatarUrl(team.avatar)
    };

    rosterMetaById[rosterId] = meta;

    if (slug && rosterIdBySlug[slug] == null) rosterIdBySlug[slug] = rosterId;
    if (nameKey && rosterNameKeyToId[nameKey] == null) rosterNameKeyToId[nameKey] = rosterId;
    if (nameKey) rosterNameKeys.push({ rosterId, nameKey });
  }

  return { year, rosterMetaById, rosterIdBySlug, rosterNameKeyToId, rosterNameKeys };
}

function findRosterIdByFuzzyName(teamLabel, lookups) {
  const k = keyify(teamLabel);
  if (!k) return null;

  // 1) Exact nameKey match
  const exact = lookups.rosterNameKeyToId?.[k];
  if (exact) return exact;

  // 2) Contains match either direction (handles truncation like "the peoples", "the comeback")
  // Prefer the longest overlap by simple score
  let best = { rosterId: null, score: 0 };

  for (const item of lookups.rosterNameKeys) {
    const a = k;
    const b = item.nameKey;

    if (!a || !b) continue;

    if (b.includes(a) || a.includes(b)) {
      // score = shorter length (the more specific the label, the higher)
      const score = Math.min(a.length, b.length);
      if (score > best.score) best = { rosterId: item.rosterId, score };
    }
  }

  return best.rosterId;
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

  // 3) Join to roster_id + avatarUrl + canonical slug
  if (lookups) {
    projections = projections.map((r) => {
      // prefer JSON roster_id if present (future-proof)
      let rosterId = Number.isFinite(Number(r.roster_id)) ? Number(r.roster_id) : null;

      // if slug exists, use slug -> roster_id
      if (!rosterId && r.slug && lookups.rosterIdBySlug?.[r.slug]) {
        rosterId = lookups.rosterIdBySlug[r.slug];
      }

      // if still missing, attempt fuzzy name match against LTM team names
      if (!rosterId) {
        rosterId = findRosterIdByFuzzyName(r.teamLabel, lookups);
      }

      const meta = rosterId ? lookups.rosterMetaById?.[rosterId] : null;

      return {
        ...r,
        roster_id: rosterId,
        // use canonical slug from LTM if we found rosterId, else keep whatever we had
        slug: r.slug || meta?.slug || null,
        // display the CURRENT team name from LTM when we can (handles team renames)
        teamName: meta?.teamName || r.teamName,
        avatarUrl: meta?.avatarUrl || ''
      };
    });

    // only drop rows that cannot link anywhere
    projections = projections.filter((x) => !!x.slug || Number.isFinite(Number(x.roster_id)));
  }

  // 4) SoS join uses roster_id
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
