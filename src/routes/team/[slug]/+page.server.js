// src/routes/team/[slug]/+page.server.js
export const prerender = false;
import { env } from '$env/dynamic/public';

// Keep this in sync with playoffs-projection loader
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
const labelBySlug = Object.fromEntries(
  Object.entries(slugMap).map(([label, slug]) => [slug, label])
);

// Helpers to parse the JSON into the same shape we used on the table
const toStatuses = (st = {}) => ({
  divStatus: st.division ? `C:${st.division}` : '',
  playStatus: [st.playoffs ? `C:${st.playoffs}` : '', st.title ? `T:${st.title}` : '']
    .filter(Boolean)
    .join(' ')
});

function normalizeRow(r) {
  // "3-0-0" -> numbers
  let wins = 0, losses = 0, ties = 0;
  if (typeof r.record === 'string') {
    const [w, l, t] = r.record.split('-').map((n) => Number(n || 0));
    wins = w ?? 0; losses = l ?? 0; ties = t ?? 0;
  }
  const { divStatus, playStatus } = toStatuses(r.status || {});
  const slug = slugMap[r.team] || null;

  return {
    slug,
    teamLabel: r.team || '',
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

// Extract numeric odds from "C:82.7% T:1.0%" etc.
function parsePctFromTag(s, tag) {
  if (!s) return 0;
  const m = s.match(new RegExp(`${tag}:\\s*([\\d.]+)%`, 'i'));
  return m ? Number(m[1]) : 0;
}

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, fetch, setHeaders }) {
  const slug = params.slug;
  const url = (env.PUBLIC_PROJECTIONS_URL || '').trim();

  // Always return something — never throw => no 404s from the loader
  if (!url) {
    return {
      title: labelBySlug[slug] ?? slug,
      slug,
      division: '',
      record: '—',
      pointsFor: '—',
      pointsAgainst: '—',
      odds: { division: 0, playoffs: 0, title: 0 },
      minWins: '—',
      maxWins: '—',
      playoffTargetWins: '—',
      divisionTargetWins: '—',
      avatarBasePath: '/playoffs-projection/avatars'
    };
  }

  try {
    const res = await fetch(url, { cache: 'no-store', redirect: 'follow' });
    if (!res.ok) throw new Error(`fetch ${res.status}`);
    const raw = await res.json();
    const rows = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
    const projections = normalize(rows);

    const row = projections.find((r) => r.slug === slug);
    if (!row) {
      // Fallback shell if slug not in feed yet
      setHeaders({ 'cache-control': 'no-store' });
      return {
        title: labelBySlug[slug] ?? slug,
        slug,
        division: '',
        record: '—',
        pointsFor: '—',
        pointsAgainst: '—',
        odds: { division: 0, playoffs: 0, title: 0 },
        minWins: '—',
        maxWins: '—',
        playoffTargetWins: '—',
        divisionTargetWins: '—',
        avatarBasePath: '/playoffs-projection/avatars'
      };
    }

    const record = `${row.wins}-${row.losses}${row.ties ? `-${row.ties}` : ''}`;
    const odds = {
      division: parsePctFromTag(row.divStatus, 'C'),
      playoffs: parsePctFromTag(row.playStatus, 'C'),
      title: parsePctFromTag(row.playStatus, 'T')
    };

    // If you want a "max wins", we don’t have it explicitly — leave '—'.
    // Targets are ranges like "9.0-9.0" that we show as strings on the page.
    setHeaders({ 'cache-control': 'no-store' });
    return {
      title: row.teamLabel || labelBySlug[slug] || slug,
      slug,
      division: row.division || '',
      record,
      pointsFor: row.points,
      pointsAgainst: undefined, // not in current feed
      odds,
      minWins: row.min ?? '—',
      maxWins: '—',
      playoffTargetWins: row.targets || '—',
      divisionTargetWins: row.divTgts || '—',
      avatarBasePath: '/playoffs-projection/avatars'
      // If you later add SoS to the feed, you can add it here as data.sos
    };
  } catch {
    // Fail-soft shell (still no 404)
    setHeaders({ 'cache-control': 'no-store' });
    return {
      title: labelBySlug[slug] ?? slug,
      slug,
      division: '',
      record: '—',
      pointsFor: '—',
      pointsAgainst: '—',
      odds: { division: 0, playoffs: 0, title: 0 },
      minWins: '—',
      maxWins: '—',
      playoffTargetWins: '—',
      divisionTargetWins: '—',
      avatarBasePath: '/playoffs-projection/avatars'
    };
  }
}
