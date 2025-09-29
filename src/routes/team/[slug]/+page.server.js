// src/routes/team/[slug]/+page.server.js
export const prerender = false;

// ----- name -> slug (same names as in your JSON) -----
const nameToSlug = {
  'Bay Area Par': 'bay-area-party-supplies',
  'CeeDees TDs': 'ceedees-tds',      // all lowercase here
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

// Reverse map (slug -> name). We'll also allow case-insensitive lookups.
const slugToName = Object.fromEntries(
  Object.entries(nameToSlug).map(([name, slug]) => [slug, name])
);

// Parse "42.7%" -> 42.7
const pct = (s) => {
  if (s == null) return null;
  const n = Number(String(s).replace('%', '').trim());
  return Number.isFinite(n) ? n : null;
};

// Normalize a row from projections JSON into what +page.svelte expects
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
    pointsAgainst: null, // not present in your JSON
    odds,
    minWins: r.min ?? '—',
    maxWins: '—', // not present in your JSON
    playoffTargetWins: r.targets ?? '—',
    divisionTargetWins: r.divisionTargets ?? '—',
    avatarBasePath: '/playoffs-projection/avatars'
  };
}

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, fetch, setHeaders }) {
  const slugParam = params.slug;
  const slugLc = slugParam.toLowerCase();
  const teamName =
    slugToName[slugParam] ||
    slugToName[slugLc] || // tolerate mixed-case slugs like "ceedees-tDs"
    null;

  // Fetch projections from the committed static file
  let rows = [];
  try {
    const res = await fetch('/projections-latest.json', { cache: 'no-store' });
    if (res.ok) {
      const raw = await res.json();
      rows = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
    }
  } catch {
    // fail-soft
  }

  const row = teamName ? rows.find((r) => r?.team === teamName) : null;
  const data = toTeamData(slugParam, row);

  setHeaders({ 'cache-control': 'no-store' });
  return data; // never throw -> no 404
}
