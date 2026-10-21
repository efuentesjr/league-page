import { leagueID } from '$lib/utils/leagueInfo';

export const tabs = [
  {
    icon: 'home',
    label: 'Home',
    dest: '/',
    key: 'home'
  },
  {
    icon: 'sports',
    label: 'Matchups',
    dest: '/matchups',
    key: 'matchups'
  },
  {
    icon: 'leaderboard',
    label: 'Standings',
    dest: '/standings',
    key: 'standings'
  },
  {
    icon: 'trending_up',
    label: 'Playoff Odds',
    dest: '/playoff-odds',
    key: 'playoff-odds'
  },
  {
    icon: 'swap_horiz',
    label: 'Trades & Waivers',
    dest: '/transactions',
    key: 'transactions'
  },
  {
    icon: 'grading',
    label: 'Trade Grades',
    dest: '/trade-grades',
    key: 'trade-grades'
  },
  {
    icon: 'confirmation_number',
    label: 'Pick Tracker',
    dest: '/picks',
    key: 'picks'
  },
  {
    icon: 'storage',
    label: 'Rosters',
    dest: '/rosters',
    key: 'rosters'
  },
  {
    icon: 'groups',
    label: 'Managers',
    dest: '/managers',
    key: 'managers'
  },
  {
    icon: 'local_fire_department',
    label: 'Rivalry',
    dest: '/rivalry',
    key: 'rivalry'
  },
  {
    icon: 'movie',
    label: 'Championship Videos',
    dest: '/champ-videos',
    key: 'champ-videos'
  },
  {
    icon: 'view_comfy',
    label: 'Drafts',
    dest: '/drafts',
    key: 'drafts'
  },
  {
    icon: 'emoji_events',
    label: 'Trophy Room',
    dest: '/awards',
    key: 'awards'
  },
  {
    icon: 'military_tech',
    label: 'Records',
    dest: '/records',
    key: 'records'
  },
  {
    icon: 'gavel',
    label: 'Competition Committee',
    dest: '/competition-committee',
    key: 'competition-committee'
  },
  {
    icon: 'history_edu',
    label: 'Constitution',
    dest: '/constitution',
    key: 'constitution'
  },
  {
    icon: 'lightbulb',
    label: 'Resources',
    dest: '/resources',
    key: 'resources'
  },
  {
    icon: 'sports_football',
    label: 'Go to Sleeper',
    dest: `https://sleeper.app/leagues/${leagueID}`,
    key: 'sleeper',
    external: true
  }
];

/*
 * Menu layout: top-level links and dropdown groups, by tab key.
 * Every page still lives in `tabs` above (the footer lists them all).
 */
export const navGroups = [
  { key: 'home' },
  { key: 'matchups' },
  { label: 'League', icon: 'leaderboard', keys: ['standings', 'playoff-odds', 'records'] },
  { label: 'Teams', icon: 'groups', keys: ['rosters', 'managers', 'rivalry'] },
  { label: 'Moves', icon: 'swap_horiz', keys: ['transactions', 'trade-grades', 'picks'] },
  { label: 'History', icon: 'emoji_events', keys: ['awards', 'drafts', 'champ-videos'] },
  { label: 'Rules', icon: 'gavel', keys: ['constitution', 'competition-committee', 'resources'] },
  { key: 'sleeper' }
];

const byKey = Object.fromEntries(tabs.map((t) => [t.key, t]));
export const resolvedNav = navGroups.map((g) =>
  g.key ? { ...byKey[g.key], single: true } : { ...g, children: g.keys.map((k) => byKey[k]).filter(Boolean) }
);
