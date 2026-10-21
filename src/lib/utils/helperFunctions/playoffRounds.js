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
 * Rivalry tiers (10): every meeting earns rivalry points and the total
 * sets the tier.
 *   Regular-season game 1 · Quarterfinals 4 · Semifinals 8 · Championship 20
 * Floors: any Championship meeting is at least Title Clash; any playoff
 * meeting is at least Grudge Match. Regular-season-only pairs stay in the
 * bottom three tiers.
 */
export const RIVALRY_POINTS = { regular: 1, quarterfinal: 4, semifinal: 8, championship: 20 };

/*
 * Former managers. Any rivalry with one of them is a Ghost Rivalry,
 * whatever their history. Sleeper user IDs (names can change).
 */
export const GHOST_MANAGERS = {
	'852011322831912960': 'XioCanela',
	'866167945603239936': 'XioLu'
};

export const RIVALRY_TIERS = {
	legendary:      { tier: 1,  name: 'Legendary',       flames: 10, color: '#e5b52a' },
	dynastyWar:     { tier: 2,  name: 'Dynasty War',     flames: 9,  color: '#f0c75e' },
	titleClash:     { tier: 3,  name: 'Title Clash',     flames: 8,  color: '#c9d3e0' },
	playoffNemesis: { tier: 4,  name: 'Playoff Nemesis', flames: 7,  color: '#e2452b' },
	heated:         { tier: 5,  name: 'Heated',          flames: 6,  color: '#e85d2e' },
	badBlood:       { tier: 6,  name: 'Bad Blood',       flames: 5,  color: '#e2722b' },
	grudgeMatch:    { tier: 7,  name: 'Grudge Match',    flames: 4,  color: '#d99a3a' },
	oldRivals:      { tier: 8,  name: 'Old Rivals',      flames: 3,  color: '#4a90d9' },
	braggingRights: { tier: 9,  name: 'Bragging Rights', flames: 2,  color: '#5fa8c9' },
	scrimmage:      { tier: 10, name: 'Scrimmage',       flames: 1,  color: '#8a96a3' },
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
 * @param {Array} playoffMeetings [{ depth, label, year }]  depth 3 = Championship, 2 = Semifinals, 1 = earlier
 * @param {number} regularGames   regular-season games between the two
 */
export const getRivalryTier = (playoffMeetings = [], regularGames = 0, ghost = null) => {
	if (!regularGames && !playoffMeetings.length) return null;

	if (ghost) {
		const left = ghost.lastSeason ? ` after ${ghost.lastSeason}` : '';
		return { ...RIVALRY_TIERS.ghost, reason: `${ghost.name} left the league${left}` };
	}

	const count = (depth) => playoffMeetings.filter((m) => m.depth === depth).length;
	const ch = count(3), sf = count(2), qf = count(1);
	const P = RIVALRY_POINTS;
	const score = regularGames * P.regular + qf * P.quarterfinal + sf * P.semifinal + ch * P.championship;

	const parts = [];
	if (ch) parts.push(`${ch} Championship${ch > 1 ? 's' : ''}`);
	if (sf) parts.push(`${sf} Semifinal${sf > 1 ? 's' : ''}`);
	if (qf) parts.push(`${qf} Quarterfinal${qf > 1 ? 's' : ''}`);
	if (regularGames) parts.push(`${regularGames} regular-season game${regularGames === 1 ? '' : 's'}`);
	const reason = `${score} rivalry points · ${parts.join(' · ')}`;

	const T = RIVALRY_TIERS;
	let tier;
	if (playoffMeetings.length) {
		if (score >= 50) tier = T.legendary;
		else if (score >= 35) tier = T.dynastyWar;
		else if (score >= 20 || ch) tier = T.titleClash;
		else if (score >= 14) tier = T.playoffNemesis;
		else if (score >= 12) tier = T.heated;
		else if (score >= 10) tier = T.badBlood;
		else tier = T.grudgeMatch;
	} else if (regularGames >= 5) tier = T.oldRivals;
	else if (regularGames >= 3) tier = T.braggingRights;
	else tier = T.scrimmage;

	return { ...tier, score, reason };
};
