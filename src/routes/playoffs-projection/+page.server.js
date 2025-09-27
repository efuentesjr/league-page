// src/routes/playoffs-projection/+page.server.js
export const prerender = false;
import { env } from '$env/dynamic/public';
import { leagueID } from '$lib/utils/leagueInfo';

// ------------- EXISTING: team label -> site slug -------------
const slugMap = {
  'Bay Area Par': 'bay-area-party-supplies',
  'CeeDees TDs': 'ceedees-tds',            // <-- fixed slug
  'Chosen one.': 'chosen-one',
  'The People’s': 'peoples-champ',
  'Pete Weber B': 'pete-weber-bowl-club',
  'Los Loquitos': 'los-loquitos',
  'bLuE BaLLeRs': 'blue-ballers',
  'TexasTimeshi': 'texastimeshifts',
  'Brute Force': 'brute-force-attack',
  'The Comeback': 'comeback-kid',
  'SlickBears': 'slickbears',
  '88boyz11': 'team-88boyz11',
  'PrimeTime Pr': 'primetime-prodigies',
  'Do it to the': 'do-it-to-them',
  'Loud and Str': 'loud-and-stroud',
  'Vick2times': 'vick2times'
};

// ------------- NEW: slug -> OWNER (manager) ID (strings) -------------
// We'll translate these owner IDs to roster_ids in the next step.
const slugToOwnerId = {
  'bay-area-party-supplies': '110121045876686848',
  'ceedees-tds':             '852068353894916096',
  'chosen-one':              '846592470551732224',
  'peoples-champ':           '849793148648546304',
  'pete-weber-bowl-club':    '850894566360997888',
  'los-loquitos':            '851154711770939392',
  'blue-ballers':            '851243503987032064',
  'texastimeshifts':         '851923896448942080',
  'brute-force-attack':      '844760551790858240',
  'comeback-kid':            '791852794729598976',
  'slickbears':              '731626118116925440',
  'team-88boyz11':           '851283708244766720',
  'primetime-prodigies':     '851918795718131712',
  'do-it-to-them':           '855631483610697728',
  'loud-and-stroud':         '953418569209995264',
  'vick2times':              '852025689220677632'
};

// ------------- OPTIONAL: slug -> roster_id for SoS -------------
// (Leave empty for now; SoS will skip unless filled. We'll wire owner->roster in Step 2.)
const slugToRosterId = {
  // 'bay-area-party-supplies':  9,
  // 'ceedees-tds':              12,
  // ...
};

// turn { division:"42.7%", playoffs:"80.0%", title:"3.7%" } into strings the UI expects
const toStatuses = (st = {}) => ({
  divStatus: st.division ? `C:${st.division}` : '',
  playStatus: [st.playoffs ? `C:${st.playoffs}` : '', st.title ? `T:${st.title}` : '']
    .filter(Boolean)
    .join(' ')
});

// normalize one row from your JSON into what the Svelte table reads
function normalizeRow(r) {
  // record "3-0-0" → wins/losses/ties
  let wins = 0, losses = 0, ties = 0;
  if (typeof r.record === 'string') {
    const [w, l, t] = r.record.split('-').map((n) => Number(n || 0));
    wins = w ?? 0; losses = l ?? 0; ties = t ?? 0;
  }

  const { divStatus, playStatus } = toStatuses(r.status || {});
  const slug = slugMap[r.team] || null; // critical: Svelte filters on slug

  return {
    slug,
    division: r.division ?? '',
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
  return rows.map(normalizeRow).filter((x) => !!x.slug);
}

// ------------- SoS (Past-only, safe fallback) ------------------
const SLEEPER = 'https://api.sleeper.app/v1';

async function getLeague(fetch) {
  const res = await fetch(`${SLEEPER}/league/${leagueID}`);
  if (!res.ok) throw new Error('league fetch failed');
  return res.json();
}

async function getMatchups(fetch, week) {
  const res = await fetch(`${SLEEPER}/league/${leagueID}/matchups/${week}`);
  if (!res.ok) return []; // fail-soft per week
  return res.json();
}

// Build pairings for a week (roster_id ↔ opponent & points)
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
  // Figure regular-season weeks from league settings (fallback 14)
  let regWeeks = 14;
  try {
    const league = await getLeague(fetch);
    regWeeks = Number(league.settings?.playoff_week_start) - 1 || 14;
  } catch { /* ignore */ }

  const gp = new Map();         // roster_id -> games played
  const pf = new Map();         // roster_id -> total points for
  const oppPts = new Map();     // roster_id -> sum of opponent points

  for (let w = 1; w <= regWeeks; w++) {
    const week = await getMatchups(fetch, w);
    if (!week.length) continue;
    const pairs = pairsForWeek(week);
    for (const p of pairs) {
      gp.set(p.me, (gp.get(p.me) || 0) + 1);
      pf.set(p.me, (pf.get(p.me) || 0) + p.myPts);
      oppPts.set(p.me, (oppPts.get(p.me) || 0) + p.oppPts);
    }
  }

  const totalPF = Array.from(pf.values()).reduce((a, b) => a + b, 0);
  const totalGP = Array.from(gp.values()).reduce((a, b) => a + b, 0);
  const leagueAvgPPG = totalGP ? totalPF / totalGP : 0;

  // Return a plain object { [rosterId]: { oppPPG, index } } (no Map to keep JSONable)
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

/** @type {import('./$types').PageServerLoad} */
export async function load({ fetch, setHeaders }) {
  const url = (env.PUBLIC_PROJECTIONS_URL || '').trim();
  if (!url) {
    return { projections: [], sourceUrl: url, error: 'Missing PUBLIC_PROJECTIONS_URL' };
  }

  // Fetch your current JSON (unchanged behavior)
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

  // Compute SoS (Past) and merge — optional, fail-soft
  try {
    const sos = await computeSoSPast(fetch);
    projections = projections.map((r) => {
      const rosterId = slugToRosterId[r.slug]; // not wired yet; will replace using slugToOwnerId in Step 2
      const past = rosterId ? sos.past?.[rosterId] : null;
      return past
        ? { ...r, sos: { leagueAvgPPG: sos.leagueAvgPPG, past } }
        : r;
    });
  } catch {
    // ignore; page still renders
  }

  setHeaders({ 'cache-control': 'no-store' });
  return { projections, sourceUrl: url, error };
}
