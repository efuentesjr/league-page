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
		label: round === maxRound - 2 ? 'Quarterfinals' : `Playoff Round ${round}`,
		depth: 1
	};
};

export const maxBracketRound = (bracket) =>
	(bracket || []).reduce((max, g) => Math.max(max, Number(g.r) || 0), 0);

/*
 * Rivalry tiers: Championship meetings decide tiers 1-2 (2+ = Legendary,
 * 1 = Title Clash), other playoff meetings tiers 3-4; without a playoff
 * meeting, the number of regular season games decides tiers 5-6.
 */
export const OLD_RIVALS_GAMES = 6;

/*
 * Former managers. Any rivalry with one of them is a Ghost Rivalry,
 * whatever their history. Sleeper user IDs (names can change).
 */
export const GHOST_MANAGERS = {
	'852011322831912960': 'XioCanela',
	'866167945603239936': 'XioLu'
};

export const RIVALRY_TIERS = {
	legendary: {
		tier: 1,
		name: 'Legendary',
		flames: 6,
		color: '#e5b52a'
	},
	titleClash: {
		tier: 2,
		name: 'Title Clash',
		flames: 5,
		color: '#c9d3e0'
	},
	heated: {
		tier: 3,
		name: 'Heated',
		flames: 4,
		color: '#e2452b'
	},
	badBlood: {
		tier: 4,
		name: 'Bad Blood',
		flames: 3,
		color: '#e2722b'
	},
	oldRivals: {
		tier: 5,
		name: 'Old Rivals',
		flames: 2,
		color: '#4a90d9'
	},
	familiar: {
		tier: 6,
		name: 'Familiar Foes',
		flames: 1,
		color: '#8a96a3'
	},
	ghost: {
		tier: null,
		label: 'Retired rival',
		name: 'Ghost Rivalry',
		icon: '👻',
		slots: 1,
		flames: 1,
		color: '#b8a7ff'
	}
};

/**
 * @param {Array} playoffMeetings [{ depth, label, year }]
 * @param {number} totalGames     every meeting, regular season + playoffs
 */
export const getRivalryTier = (playoffMeetings = [], totalGames = 0, ghost = null) => {
	if (!totalGames) return null;

	if (ghost) {
		const left = ghost.lastSeason ? ` after ${ghost.lastSeason}` : '';
		return { ...RIVALRY_TIERS.ghost, reason: `${ghost.name} left the league${left}` };
	}

	const count = (depth) => playoffMeetings.filter((m) => m.depth === depth).length;
	const times = (n) => (n > 1 ? ` (${n}×)` : '');

	// two or more Championship meetings = Legendary, one = Title Clash
	if (count(3) >= 2) {
		return { ...RIVALRY_TIERS.legendary, reason: `Met in the Championship${times(count(3))}` };
	}
	if (count(3) === 1) {
		return { ...RIVALRY_TIERS.titleClash, reason: 'Met in the Championship' };
	}
	if (count(2)) {
		return { ...RIVALRY_TIERS.heated, reason: `Met in the Semifinals${times(count(2))}` };
	}
	if (count(1)) {
		return { ...RIVALRY_TIERS.badBlood, reason: `Met in the Quarterfinals${times(count(1))}` };
	}
	// regular season only: 6+ games = Old Rivals, 1-5 = Familiar Foes
	const reason = `${totalGames} regular season game${totalGames === 1 ? '' : 's'}`;
	if (totalGames >= OLD_RIVALS_GAMES) {
		return { ...RIVALRY_TIERS.oldRivals, reason };
	}
	return { ...RIVALRY_TIERS.familiar, reason };
};
