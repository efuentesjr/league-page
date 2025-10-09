// src/routes/playoffs-projection/[slug]/+page.server.js
export const prerender = false;
import { env } from '$env/dynamic/public';
import { error } from '@sveltejs/kit';

// Use the SAME map as the tab (kept minimal here)
const slugMap = {
  'Bay Area Par': 'bay-area-party-supplies',
  'CeeDees TDs': 'ceedees-tds',
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

function computeSlug(row) {
  return (row?.slug && String(row.slug)) || slugMap[row?.team] || null;
}

// Safe placeholder so the page still renders even if the data source fails
function fallbackPayload(slug, msg = '') {
  return {
    team: {
      team: slug,                // shows the slug as name so layout renders
      division: '',
      record: '',
      points: 0,
      status: { division: '', playoffs: '', tie: '' },
      targets: '',
      min: ''
    },
    slug,
    // optional error string for debugging in the UI if you want to surface it later
    error: msg
  };
}

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, fetch, setHeaders }) {
  const slug = params.slug;
  const url = (env.PUBLIC_PROJECTIONS_URL || '').trim();

  if (!url) {
    // Do NOT throw 500 — return a safe payload so the page renders
    return fallbackPayload(slug, 'Missing PUBLIC_PROJECTIONS_URL');
  }

  try {
    const res = await fetch(url, { cache: 'no-store', redirect: 'follow' });
    if (!res.ok) {
      return fallbackPayload(slug, `Failed to load projections (${res.status})`);
    }

    const raw = await res.json();
    const rows = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];

    // Find the matching team using the same mapping as the tab
    const idx = rows.findIndex((r) => computeSlug(r) === slug);

    if (idx === -1) {
      // 404 is fine here; it won’t crash the site like a 500
      const samples = rows
        .map((r) => computeSlug(r))
        .filter(Boolean)
        .slice(0, 12)
        .join(', ');
      throw error(404, `Team not found in projections for slug "${slug}". Sample slugs: ${samples}`);
    }

    const team = rows[idx];

    setHeaders({ 'cache-control': 'no-store' });
    return {
      team,
      slug
    };
  } catch (e) {
    // Any unexpected error -> safe fallback (no 500)
    return fallbackPayload(slug, String(e));
  }
}
