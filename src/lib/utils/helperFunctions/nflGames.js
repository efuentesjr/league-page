import { leagueID } from '$lib/utils/leagueInfo';

let cachedGames = null;
let cacheTime = 0;

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const getNflGames = async (year, week) => {
	const now = Date.now();

	if (
		cachedGames &&
		now - cacheTime < CACHE_DURATION
	) {
		return cachedGames;
	}

	const res = await fetch(
		`https://api.sleeper.com/schedule/nfl/regular/${year}`,
		{ compress: true }
	);

	if (!res.ok) {
		throw new Error('Unable to fetch NFL schedule');
	}

	const games = await res.json();

	cachedGames = games.filter((game) => game.week === week);
	cacheTime = now;

	return cachedGames;
};
