/*
 * Live win probability for the current week's matchups.
 * Rosters, league settings and player projections are loaded once and
 * cached; pass fresh matchup data (e.g. every scoreboard refresh) to get
 * updated odds as points come in.
 */
import { getLeagueRosters } from './leagueRosters';
import { getLeagueData } from './leagueData';
import { getNflState } from './nflState';
import { loadPlayers } from './players';
import { waitForAll } from './multiPromise';
import { buildSimInputs, gameWinProbabilities } from './playoffOdds';

let basePromise = null;

const getBase = () => {
	if (!basePromise) {
		basePromise = waitForAll(getLeagueRosters(), getLeagueData(), getNflState(), loadPlayers(null)).catch((err) => {
			basePromise = null;
			throw err;
		});
	}
	return basePromise;
};

/**
 * @param {Array} matchupWeeks from getLeagueMatchups()
 * @returns {Promise<{ week: number, probs: { [rosterID]: number } }>}
 */
export const getLiveWinProbabilities = async (matchupWeeks) => {
	const [rostersData, leagueData, nflState, playerData] = await getBase();
	const inputs = buildSimInputs({
		rosters: rostersData.rosters,
		players: playerData.players,
		leagueData,
		nflState,
		matchupWeeks
	});
	return gameWinProbabilities(inputs);
};

export const formatWinPct = (v) => {
	if (v == null) return '';
	if (v >= 99.5) return '>99%';
	if (v <= 0.5) return '<1%';
	return `${Math.round(v)}%`;
};
