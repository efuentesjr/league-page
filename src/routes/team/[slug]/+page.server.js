// src/routes/playoffs-projection/[slug]/+page.server.js
export const prerender = false;
import { env } from '$env/dynamic/public';

// Map short team labels -> site slugs (same map you use in the list page)
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

const pctNum = (v) => Number(String(v ?? '').replace(/[^\d.]/g, '')) || 0;

function normalizeRow(r) {
  // record "3-0-0" → wins/losses/ties and string form
  let wins = 0, losses = 0, ties = 0;
  if (typeof r.record === 'string') {
    const [w, l, t] = r.record.split('-').map((n) => Number(n || 0));
    wins = w ?? 0; losses = l ?? 0; ties = t ?? 0;
  }

  const slug = slugMap[r.team] || null;

  const [minWins, maxWins] =
    String(r.targets ?? '')
      .split('-')
      .map((s) => s.trim())
      .filter(Boolean);

  return {
    slug,
    team: r.team,
    division: r.division ?? '',
    record: wins + '-' + losses + '-' + ties,
    pointsFor: Number(r.points ?? 0),
    odds: {
      division: pctNum(r.status?.division),
      playoffs: pctNum(r.status?.playoffs),
      title: pctNum(r.status?.title)
    },
    minWins: minWins ?? null,
    maxWins: maxWins ?? null,
    playoffTargetWins: r.targets ?? null,
    divisionTargetWins: r.divisionTargets ?? r.divTgts ?? null
  };
}

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, fetch, setHeaders }) {
  const url = (env.PUBLIC_PROJECTIONS_URL || '').trim();
  if (!url) {
    return {
      title: params.slug,
      slug: params.slug,
      division: '',
      record: '—',
      pointsFor: null,
      odds: {},
      error: 'Missing PUBLIC_PROJECTIONS_URL'
    };
  }

  try {
    const res = await fetch(url, { cache: 'no-store', redirect: 'follow' });
    if (!res.ok) {
      return { title: params.slug, slug: params.slug, error: `Fetch failed: ${res.status}` };
    }

    const raw = await res.json();
    const rows = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
    const normalized = rows.map(normalizeRow).filter((x) => !!x.slug);
    const team = normalized.find((t) => t.slug === params.slug);

    if (!team) {
      return { title: params.slug, slug: params.slug, error: 'Team not found in projections' };
    }

    setHeaders({ 'cache-control': 'no-store' });
    return {
      title: team.team,
      slug: team.slug,
      division: team.division,
      record: team.record,
      pointsFor: team.pointsFor,
      // pointsAgainst can be added later when we wire SoS/PA
      odds: team.odds,
      minWins: team.minWins,
      maxWins: team.maxWins,
      playoffTargetWins: team.playoffTargetWins,
      divisionTargetWins: team.divisionTargetWins
    };
  } catch (e) {
    return { title: params.slug, slug: params.slug, error: String(e) };
  }
}
