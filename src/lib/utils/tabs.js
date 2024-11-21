import { leagueID } from '$lib/utils/leagueInfo';

export const tabs = [
    {
        icon: 'home',
        label: 'Home',
        dest: '/',
    },
    {
        icon: 'sports',
        label: 'Matchups',
        dest: '/matchups',
    },
    {
        icon: 'swap_horiz',
        label: 'Trades & Waivers',
        dest: '/transactions',
    },
    {
        icon: 'article',
        label: 'Blog',
        dest: '/blog',
    },
    {
        icon: 'view_comfy',
        label: 'League Info',
        nest: true,
        children: [
            {
                icon: 'storage',
                label: 'Rosters',
                dest: '/rosters',
            },
            {
                icon: 'groups',
                label: 'Managers',
                dest: '/managers',
            },
            {
                icon: 'local_fire_department',
                label: 'Rivalry',
                dest: '/rivalry',
            },
            {
                icon: 'leaderboard',
                label: 'Standings',
                dest: '/standings',
            },
            {
                icon: 'emoji_events',
                label: 'Trophy Room',
                dest: '/awards',
            },
            {
                icon: 'military_tech',
                label: 'Records',
                dest: '/records',
            },
            {
                icon: 'history_edu',
                label: 'Constitution',
                dest: '/constitution',
            },
        ]
    },
    {
        icon: 'view_comfy',
        label: 'Draft Info',
        nest: true,
        children: [
            {
                icon: 'view_comfy',
                label: 'Drafts',
                dest: '/drafts',
            },
            {
                icon: 'view_comfy',
                label: 'Mock Draft',
                dest: '/mockdrafts',
            },
        ]
    },
    {
        icon: 'sports_football',
        label: 'Go to Sleeper',
        dest: `https://sleeper.app/leagues/${leagueID}`,
    },
    {
        icon: 'lightbulb',
        label: 'Resources',
        dest: '/resources',
    },
];

