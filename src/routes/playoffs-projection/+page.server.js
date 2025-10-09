I think you're mixed up a bit. Hee's the current: // src/routes/playoffs-projection/+page.server.js
export const prerender = false;
import { env } from '$env/dynamic/public';
import { leagueID } from '$lib/utils/leagueInfo';

// ——— Team label -> site slug (MUST exactly match JSON "team" values) ———
const slugMap = {
  'Bay Area Par': 'bay-area-party-supplies',
  'CeeDees TDs': 'ceedees-tds',          // fixed case/typo
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

// ——— Optional: slug -> roster_id (SoS) ———
const slugToRosterId = {
  'bay-area-party-supplies': 110121045876686848,
  'ceedees-tds':             852068353894916096,
  'chosen-one':              846592470551732224,
  'peoples-champ':           849793148648546304,
  'pete-weber-bowl-club':    850894566360997888,
  'los-loquitos':            851154711770939392,
  'blue-ballers':            851243503987032064,
  'texastimeshifts':         851923896448942080,
  'brute-force-attack':      844760551790858240,
  'comeback-kid':            791852794729598976,
  'slickbears':              731626118116925440,
  'team-88boyz11':           851283708244766720,
  'primetime-prodigies':     851918795718131712,
  'do-it-to-them':           855631483610697728,
  'loud-and-stroud':         953418569209995264,
  'vick2times':              852025689220677632
};

// Convert {division:"42.7%", playoffs:"80.0%", title:"3.7%"} -> UI strings
const toStatuses = (st = {}) => ({
  divStatus: st.division ? `C:${st.division}` : '',
  playStatus: [st.playoffs ? `C:${st.playoffs}` : '', st.title ? `T:${st.title}` : '']
    .filter(Boolean)
    .join(' ')
});

// normalize a single row from the JSON into what the table reads
function normalizeRow(r) {
  // record "3-0-0" -> wins/losses/ties
  let wins = 0, losses = 0, ties = 0;
  if (typeof r.record === 'string') {
    const [w, l, t] = r.record.split('-').map((n) => Number(n || 0));
    wins = Number.isFinite(w) ? w : 0;
    losses = Number.isFinite(l) ? l : 0;
    ties = Number.isFinite(t) ? t : 0;
  }

  const { divStatus, playStatus } = toStatuses(r.status || {});
  // prefer slug in JSON if you add it; fallback to map by team label
  const slug = (r.slug && String(r.slug)) || slugMap[r.team] || null;

  return {
    slug,                       // used for link & filtering
    teamName: r.team || '',     // keep the friendly name for team pages
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
  return rows.map(normalizeRow).filter((x) => !!x.slug);
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

  const gp = new Map();     // games played
  const pf = new Map();     // points for
  const oppPts = new Map(); // opponent points

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

/** @type {import('./$types').PageServerLoad} */
export async function load({ fetch, setHeaders }) {
  // IMPORTANT: put your R2 URL in PUBLIC_PROJECTIONS_URL
  // e.g. PUBLIC_PROJECTIONS_URL="https://pub-6c49...r2.dev/projections-latest.json"
  const url = (env.PUBLIC_PROJECTIONS_URL || '').trim();
  if (!url) {
    return { projections: [], sourceUrl: url, error: 'Missing PUBLIC_PROJECTIONS_URL' };
  }

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

  // Merge SoS (fail-soft)
  try {
    const sos = await computeSoSPast(fetch);
    projections = projections.map((r) => {
      const rosterId = slugToRosterId[r.slug];
      const past = rosterId ? sos.past?.[rosterId] : null;
      return past ? { ...r, sos: { leagueAvgPPG: sos.leagueAvgPPG, past } } : r;
    });
  } catch {}

  setHeaders({ 'cache-control': 'no-store' });
  // NOTE: if you want to hide the Source URL line in the UI, just don’t return sourceUrl
  return { projections, /* sourceUrl: url, */ error };
}
