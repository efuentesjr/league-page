export const prerender = false;
import { env } from '$env/dynamic/public';

// Keep this in sync with playoffs-projection/+page.server.js
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

// Invert mapping: slug -> display label from the projections JSON
const labelBySlug = Object.fromEntries(
  Object.entries(slugMap).map(([label, slug]) => [slug, label])
);

const numFromPct = (v) => {
  if (v == null) return null;
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    const n = parseFloat(v.replace('%', '').trim());
    return Number.isFinite(n) ? n : null;
  }
  return null;
};

function buildTeamData(row, slug) {
  const status = row.status || {};
  const targetsStr = String(row.targets ?? '');
  const maxFromTargets = (() => {
    const m = targetsStr.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/);
    return m ? Number(m[2]) : '—';
  })();

  return {
    // what +page.svelte reads:
    slug,
    title: row.team ?? 'Team',
    division: typeof row.division === 'string' ? row.division : String(row.division ?? ''),

    record: row.record ?? '—',
    pointsFor: Number.isFinite(Number(row.points)) ? Number(row.points) : undefined,
    // pointsAgainst is not in projections JSON → leave undefined so UI shows "—"

    // odds as numbers (e.g., 42.7)
    odds: {
      division: numFromPct(status.division),
      playoffs: numFromPct(status.playoffs),
      title:    numFromPct(status.title)
    },

    // projections
    minWins: row.min ?? '—',
    maxWins: maxFromTargets, // derived from "targets" upper bound if present
    playoffTargetWins: row.targets ?? '—',
    divisionTargetWins: row.divisionTargets ?? '—',

    // optional avatar hints (UI will fallback to initials if not provided)
    logoUrl: row.logoUrl ?? null,
    avatarBasePath: '/playoffs-projection/avatars'
  };
}

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, fetch, setHeaders }) {
  const url = (env.PUBLIC_PROJECTIONS_URL || '').trim();
  const slug = params.slug;
  const label = labelBySlug[slug];

  if (!url) return { title: 'Team', slug, error: 'Missing PUBLIC_PROJECTIONS_URL' };
  if (!label) return { title: 'Team', slug, error: `Unknown team slug: ${slug}` };

  try {
    const res = await fetch(url, { cache: 'no-store', redirect: 'follow' });
    if (!res.ok) return { title: label, slug, error: `Fetch failed: ${res.status}` };

    const raw = await res.json();
    const rows = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
    const row = rows.find((r) => r?.team === label);

    if (!row) return { title: label, slug, error: 'Team not found in projections' };

    const data = buildTeamData(row, slug);
    setHeaders({ 'cache-control': 'no-store' });
    return data; // consumed by +page.svelte via `export let data`
  } catch (e) {
    return { title: label, slug, error: String(e) };
  }
}
