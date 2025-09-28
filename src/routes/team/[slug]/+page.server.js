// src/routes/team/[slug]/+page.server.js
export const prerender = false;

// Read the same JSON you committed to the repo
import projectionsRaw from '$lib/data/projections-latest.json';

// ----- MUST match the mapping used on /playoffs-projection -----
const nameToSlug = {
  'Bay Area Par': 'bay-area-party-supplies',
  'CeeDees TDs': 'ceedees-tds',         // <- note all lowercase here
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

// Build reverse map: slug -> display name
const slugToName = Object.fromEntries(
  Object.entries(nameToSlug).map(([name, slug]) => [slug, name])
);

// Helper: parse "42.7%" -> 42.7 (number)
const pct = (s) => {
  if (s == null) return null;
  const n = Number(String(s).replace('%', '').trim());
  return Number.isFinite(n) ? n : null;
};

// Find the JSON row for a given slug
function findRowBySlug(slug) {
  const teamName = slugToName[slug];
  if (!teamName) return null;

  const rows = Array.isArray(projectionsRaw)
    ? projectionsRaw
    : Array.isArray(projectionsRaw?.data)
      ? projectionsRaw.data
      : [];

  return rows.find((r) => r?.team === teamName) || null;
}

// Normalize to what +page.svelte expects.
// IMPORTANT: never throw/404—return safe placeholders instead.
function toTeamData(slug, r) {
  if (!r) {
    return {
      slug,
      title: slug,
      division: '',
      record: '—',
      pointsFor: null,
      pointsAgainst: null,
      odds: { division: null, playoffs: null, title: null },
      minWins: '—',
      maxWins: '—',
      playoffTargetWins: '—',
      divisionTargetWins: '—',
      avatarBasePath: '/playoffs-projection/avatars'
    };
  }

  const odds = r.status
    ? {
        division: pct(r.status.division),
        playoffs: pct(r.status.playoffs),
        title: pct(r.status.title)
      }
    : { division: null, playoffs: null, title: null };

  return {
    slug,
    title: r.team ?? slug,
    division: String(r.division ?? ''),
    record: r.record ?? '—',
    pointsFor: Number(r.points ?? 0),
    pointsAgainst: null, // not in your JSON; leave null/— in UI
    odds,
    minWins: r.min ?? '—',
    maxWins: '—', // not in your JSON; leave as —
    playoffTargetWins: r.targets ?? '—',
    divisionTargetWins: r.divisionTargets ?? '—',
    avatarBasePath: '/playoffs-projection/avatars'
  };
}

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, setHeaders }) {
  const slug = params.slug;
  const row = findRowBySlug(slug);
  const data = toTeamData(slug, row);

  setHeaders({ 'cache-control': 'no-store' });
  return data; // <- do NOT throw; this prevents 404s
}
