/*
 * ============================================================
 * PLAYOFF ROUNDS + RIVALRY TIERS
 * ============================================================
 * Shared by the Rivalry page and the Managers page.
 */

/**
 * Names a game from Sleeper's winners_bracket, or returns null for
 * placement games (3rd, 5th, 7th place) that aren't on the road to
 * the title.
 *
 * @param {object} game     one winners_bracket entry ({r, m, t1, t2, w, l, p, t1_from, t2_from})
 * @param {number} maxRound the last round in that bracket
 * @returns {{stage: string, label: string, depth: number} | null}
 *          depth: 3 = Championship, 2 = Semifinals, 1 = earlier rounds
 */
export const classifyBracketGame = (game, maxRound) => {
	if (!game) return null;

	// placement games: anything not for 1st, or fed by a loser
	if (game.p != null && Number(game.p) !== 1) return null;
	if (game.t1_from?.l != null || game.t2_from?.l != null) return null;

	const round = Number(game.r) || 1;

	if (Number(game.p) === 1 || round === maxRound) {
		return { stage: 'championship', label: 'Championship', depth: 3 };
	}

	if (round === maxRound - 1) {
		return { stage: 'semifinal', label: 'Semifinals', depth: 2 };
	}

	return {
		stage: `round${round}`,
		label: `Playoff Round ${round}`,
		depth: 1
	};
};

export const maxBracketRound = (bracket) =>
	(bracket || []).reduce((max, g) => Math.max(max, Number(g.r) || 0), 0);

/*
 * Rivalry tiers: the deepest playoff meeting decides tiers 1-3;
 * without a playoff meeting, the number of regular season games
 * decides tiers 4-5.
 */
export const OLD_RIVALS_GAMES = 6;

export const RIVALRY_TIERS = {
	legendary: {
		tier: 1,
		name: 'Legendary',
		flames: 5,
		color: '#e5b52a'
	},
	heated: {
		tier: 2,
		name: 'Heated',
		flames: 4,
		color: '#e2452b'
	},
	badBlood: {
		tier: 3,
		name: 'Bad Blood',
		flames: 3,
		color: '#e2722b'
	},
	oldRivals: {
		tier: 4,
		name: 'Old Rivals',
		flames: 2,
		color: '#4a90d9'
	},
	familiar: {
		tier: 5,
		name: 'Familiar Foes',
		flames: 1,
		color: '#8a96a3'
	}
};

/**
 * @param {Array} playoffMeetings [{ depth, label, year }]
 * @param {number} totalGames     every meeting, regular season + playoffs
 */
export const getRivalryTier = (playoffMeetings = [], totalGames = 0) => {
	if (!totalGames) return null;

	const count = (depth) => playoffMeetings.filter((m) => m.depth === depth).length;
	const times = (n) => (n > 1 ? ` (${n}×)` : '');

	if (count(3)) {
		return { ...RIVALRY_TIERS.legendary, reason: `Met in the Championship${times(count(3))}` };
	}
	if (count(2)) {
		return { ...RIVALRY_TIERS.heated, reason: `Met in the Semifinals${times(count(2))}` };
	}
	if (count(1)) {
		return { ...RIVALRY_TIERS.badBlood, reason: `Met in the playoffs${times(count(1))}` };
	}
	// regular season only: 6+ games = Old Rivals, 1-5 = Familiar Foes
	const reason = `${totalGames} regular season game${totalGames === 1 ? '' : 's'}`;
	if (totalGames >= OLD_RIVALS_GAMES) {
		return { ...RIVALRY_TIERS.oldRivals, reason };
	}
	return { ...RIVALRY_TIERS.familiar, reason };
};
