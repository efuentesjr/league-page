// src/routes/playoffs-projection/+page.server.js
export const prerender = false;
import { env } from '$env/dynamic/public';

// Map the short "team" labels in your JSON → site slugs from leagueInfo.js
const slugMap = {
  'Bay Area Par': 'bay-area-party-supplies',
  'CeeDees TDs': 'ceedees-tDs',
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

/** @type {import('./$types').PageServerLoad} */
export async function load({ fetch, setHeaders }) {
  const url = (env.PUBLIC_PROJECTIONS_URL || '').trim();
  if (!url) {
    return { projections: [], sourceUrl: url, error: 'Missing PUBLIC_PROJECTIONS_URL' };
  }

  try {
    const res = await fetch(url, { cache: 'no-store', redirect: 'follow' });
    if (!res.ok) {
      return { projections: [], sourceUrl: url, error: `Fetch failed: ${res.status}` };
    }

    const raw = await res.json();
    const rows = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
    const projections = normalize(rows);

    setHeaders({ 'cache-control': 'no-store' });
    return { projections, sourceUrl: url, error: null };
  } catch (e) {
    return { projections: [], sourceUrl: url, error: String(e) };
  }
}
