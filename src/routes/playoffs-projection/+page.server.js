// src/routes/playoffs-projection/[slug]/+page.server.js
export const prerender = false;
import { env } from '$env/dynamic/public';
import { error } from '@sveltejs/kit';

/*
  Minimal, safe loader:
  - Fetch the same JSON the tab uses
  - Compute the expected slug per your tab’s slugMap (duplicated here)
  - Add a tiny alias so "peoples-champ" also matches older forms ("the-people-s", "the-peoples")
  - Return the ORIGINAL row shape your +page.svelte already expects
*/

// --- COPY of the tab’s slugMap (keep in sync with ../+page.server.js) ---
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

// Very small, safe helpers (no impact on tab)
const basicSlug = (s = '') =>
  String(s)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')    // strip diacritics
    .replace(/[^a-z0-9]+/g, '-')        // non-alnum -> dash
    .replace(/(^-|-$)/g, '');           // trim dashes

// For one-off URL stability: if user requests "peoples-champ", also accept these legacy forms
const slugAliases = (slug) => {
  if (slug === 'peoples-champ') return new Set(['peoples-champ', 'the-people-s', 'the-peoples']);
  return new Set([slug]);
};

export async function load({ params, fetch, setHeaders }) {
  const url = (env.PUBLIC_PROJECTIONS_URL || '').trim();
  if (!url) throw error(500, 'Missing PUBLIC_PROJECTIONS_URL');

  // Fetch the same data source as the tab
  const res = await fetch(url, { cache: 'no-store', redirect: 'follow' });
  if (!res.ok) throw error(500, `Failed to load projections (${res.status})`);

  // JSON may be a raw array or { data: [...] }
  const raw = await res.json();
  const rows = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];

  // Build an index: expectedSlug (from slugMap or row.slug or basic slug) -> original row index
  const index = new Map();
  rows.forEach((r, i) => {
    // Preferred: the same mapping your tab uses
    const mapped = slugMap[r?.team];
    const expected = (r?.slug && String(r.slug)) || mapped || basicSlug(r?.team);
    if (expected) index.set(expected, i);

    // Backward-compatibility for People’s variations, in case JSON/team names shift
    if (expected === 'peoples-champ') {
      index.set('the-people-s', i);
      index.set('the-peoples', i);
    }
  });

  const requested = params.slug;
  const candidates = slugAliases(requested); // e.g., 'peoples-champ' + legacy forms

  // Find the first matching candidate in our index
  let hitIndex = null;
  for (const c of candidates) {
    if (index.has(c)) {
      hitIndex = index.get(c);
      break;
    }
  }

  if (hitIndex == null) {
    const samples = Array.from(index.keys()).slice(0, 12).join(', ');
    throw error(404, `Team not found in projections for slug "${requested}". Sample slugs: ${samples}`);
  }

  // Return the ORIGINAL row the page already expects
  const team = rows[hitIndex];

  setHeaders({ 'cache-control': 'no-store' });
  return {
    team,                          // fields: team, record, points, status{division,playoffs,tie}, division, etc.
    slug: requested,               // for avatar fallback
    avatarBasePath: '/playoffs-projection/avatars'
    // source intentionally omitted from UI
  };
}
