// src/routes/playoffs-projection/[slug]/+page.server.js
export const prerender = false;
import { env } from '$env/dynamic/public';
import { error } from '@sveltejs/kit';

// ---- COPY EXACTLY THE SAME MAP USED BY THE LIST PAGE ----
const slugMap = {
  'Bay Area Par': 'bay-area-party-supplies',
  'CeeDees TDs': 'ceedees-tds',          // fixed case/typo
  'Chosen one.': 'chosen-one',
  'The Peoples': 'peoples-champ',
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

// Prefer r.slug from JSON if present; else use our map (must match list page)
function computeSlug(row) {
  return (row?.slug && String(row.slug)) || slugMap[row?.team] || null;
}

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, fetch, setHeaders }) {
  const url = (env.PUBLIC_PROJECTIONS_URL || '').trim();
  if (!url) throw error(500, 'Missing PUBLIC_PROJECTIONS_URL');

  const res = await fetch(url, { cache: 'no-store', redirect: 'follow' });
  if (!res.ok) throw error(500, `Failed to load projections (${res.status})`);

  const raw = await res.json();
  const rows = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];

  // Build [index, slug] list using the SAME logic as the list page
  const indexed = rows
    .map((r, i) => ({ i, slug: computeSlug(r) }))
    .filter(x => !!x.slug);

  const requested = params.slug;
  const hit = indexed.find(x => x.slug === requested);

  if (!hit) {
    const samples = indexed.map(x => x.slug).join(', ');
    throw error(404, `Team not found in projections for slug "${requested}". Sample slugs: ${samples}`);
  }

  // Return the ORIGINAL row so your +page.svelte keeps working as-is
  const team = rows[hit.i];

  setHeaders({ 'cache-control': 'no-store' });
  return {
    team,                        // raw fields: team, record, points, status{division,playoffs,tie}, etc.
    slug: requested,             // for avatar fallback
    avatarBasePath: '/playoffs-projection/avatars'
    // source intentionally omitted from UI
  };
}
