export const prerender = false;
import { env } from '$env/dynamic/public';

// --- duplicate the same slugMap you use on the main page ---
const slugMap = {
  'Bay Area Par': 'bay-area-party-supplies',
  'CeeDees TDs': 'ceedees-tds', // <-- fixed lowercase
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

const toStatuses = (st = {}) => ({
  divStatus: st.division ? `C:${st.division}` : '',
  playStatus: [st.playoffs ? `C:${st.playoffs}` : '', st.title ? `T:${st.title}` : '']
    .filter(Boolean)
    .join(' ')
});

function normalizeRow(r) {
  let wins = 0, losses = 0, ties = 0;
  if (typeof r.record === 'string') {
    const [w, l, t] = r.record.split('-').map((n) => Number(n || 0));
    wins = w ?? 0; losses = l ?? 0; ties = t ?? 0;
  }

  const { divStatus, playStatus } = toStatuses(r.status || {});
  const slug = slugMap[r.team] || null;

  return {
    slug,
    title: r.team || '',
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

export async function load({ params, fetch, setHeaders }) {
  const url = (env.PUBLIC_PROJECTIONS_URL || '').trim();
  const slug = params.slug;

  if (!url) {
    return {
      title: 'Team Not Found',
      division: '',
      slug,
      avatarBasePath: '/playoffs-projection/avatars'
    };
  }

  try {
    const res = await fetch(url, { cache: 'no-store', redirect: 'follow' });
    const raw = await res.json();
    const rows = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
    const normalized = rows.map(normalizeRow).filter(x => !!x.slug);

    const team = normalized.find(r => r.slug === slug);

    setHeaders({ 'cache-control': 'no-store' });

    if (!team) {
      return {
        title: 'Team Not Found',
        division: '',
        slug,
        avatarBasePath: '/playoffs-projection/avatars'
      };
    }

    return {
      // the fields your +page.svelte reads:
      title: team.title,
      division: team.division,
      slug: team.slug,
      // optional extras you can wire into the UI later:
      record: `${team.wins}-${team.losses}${team.ties ? '-' + team.ties : ''}`,
      pointsFor: team.points,
      divStatus: team.divStatus,
      playStatus: team.playStatus,
      minWins: team.min,
      targets: team.targets,
      divTargets: team.divTgts,
      avatarBasePath: '/playoffs-projection/avatars'
    };
  } catch (_e) {
    return {
      title: 'Team Not Found',
      division: '',
      slug,
      avatarBasePath: '/playoffs-projection/avatars'
    };
  }
}
