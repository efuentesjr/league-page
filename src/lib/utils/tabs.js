import {leagueID} from '$lib/utils/leagueInfo';

export const tabs = [
    {
        icon: 'home',
        label: 'Home',
        dest: '/',
        key: 'home',					
    },
    {
        icon: 'sports',
        label: 'Matchups',
        dest: '/matchups',
        key: 'matchups',						
    },
    {
        icon: 'swap_horiz',
        label: 'Trades & Waivers',
        dest: '/transactions',
        key: 'transactions',
    },
    {
        icon: 'view_comfy',
        label: 'Drafts',
        dest: '/drafts',
        key: 'drafts',
    },
    {
        icon: 'storage',
        label: 'Rosters',
        dest: '/rosters',
		key: 'rosters',
    },
    {
        icon: 'groups',
        label: 'Managers',
        dest: '/managers',
		key: 'managers',
    },
    {
        icon: 'local_fire_department',
        label: 'Rivalry',
        dest: '/rivalry',
		key: 'rivalry',
    },
    {
        icon: 'movie',
        label: 'Championship Videos',
        dest: '/champ-videos',
		key: 'champ-videos',
    },
    {
        icon: 'article',
        label: 'Blog',
        dest: '/blog',
    },
    {
        icon: 'emoji_events',
        label: 'Trophy Room',
        dest: '/awards',
		key: 'awards',
    },
    {
        icon: 'military_tech',
        label: 'Records',
        dest: '/records',
		key: 'records',
    },
    {
        icon: 'trending_up',
        label: 'Playoff Projections',
        dest: '/playoffs-projection',
		key: 'playoffs-projection',
    },
    {
        icon: 'leaderboard',
        label: 'Standings',
        dest: '/standings',
		key: 'standings',
    },
    {
        icon: 'history_edu',
        label: 'Constitution',
        dest: '/constitution',
		key: 'constitution',
    },
    {
        icon: 'lightbulb',
        label: 'Resources',
        dest: '/resources',
		key: 'resources',
    },
    {
        icon: 'sports_football',
        label: 'Go to Sleeper',
         dest: `https://sleeper.app/leagues/${leagueID}`,
    },
];
