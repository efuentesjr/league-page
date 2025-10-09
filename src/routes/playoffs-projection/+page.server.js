// src/routes/playoffs-projection/[slug]/+page.server.js
export const prerender = false;
import { env } from '$env/dynamic/public';
import { error } from '@sveltejs/kit';

// ——— Team label -> site slug (MUST exactly match JSON "team" values) ———
// Keep this in sync with ../+page.server.js (or move to a shared module later)
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

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, fetch, setHeaders }) {
  const url = (env.PUBLIC_PROJECTIONS_URL || '').trim();
  if (!url) {
    throw error(500, 'Missing PUBLIC_PROJECTIONS_URL');
  }

  const res = await fetch(url, { cache: 'no-store', redirect: 'follow' });
  if (!res.ok) {
    throw error(500, `Failed to load projections (${res.status})`);
  }

  // Raw array from R2 (each item should include team label and stats)
  const raw = await res.json();
  const rows = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];

  // Normalize: compute slug the SAME way as the list page
  const withSlugs = rows.map((r) => ({
    ...r,
    slug: (r.slug && String(r.slug)) || slugMap[r.team] || null
  })).filter((r) => !!r.slug);

  const requested = params.slug;

  // Find the exact team for this slug
  const team = withSlugs.find((t) => t.slug === requested);

  if (!team) {
    // Helpful 404 with sample slugs (like the screenshot you shared)
    const samples = withSlugs.map((t) => t.slug).join(', ');
    throw error(404, `Team not found in projections for slug "${requested}". Sample slugs: ${samples}`);
  }

  setHeaders({ 'cache-control': 'no-store' });

  // Return the raw team object so +page.svelte can use fields like team.status, team.points, etc.
  return {
    team,
    slug: team.slug,
    avatarBasePath: '/playoffs-projection/avatars',
    // sourceUrl: url // (kept off UI per earlier change)
  };
}
