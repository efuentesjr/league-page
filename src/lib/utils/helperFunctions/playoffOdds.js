/*
 * ============================================================
 * PLAYOFF ODDS — season simulator
 * ============================================================
 *
 * Plays the rest of the regular season (and the playoffs) out
 * thousands of times and counts how often each team gets in,
 * where it's seeded, and how far it goes.
 *
 *  1. Expected score for each team, each remaining week:
 *       70% Sleeper projection for the best lineup (same math as
 *           the Power Rankings), scaled to how this league actually
 *           scores vs. projections
 *       30% the team's actual average this season
 *  2. Randomness: each team's own week-to-week swing this season,
 *     pulled toward a league-typical 24 points while the sample
 *     is small, plus a season-long shift in team strength per
 *     simulated season (rosters change; projections miss).
 *  3. The week in progress uses live points already scored plus
 *     projections for starters who haven't played yet.
 *  4. Standings: wins (ties count half), then points for — this
 *     matches how the 2025 bracket was actually seeded.
 *  5. Bracket (8 teams): 1v8 & 4v5 meet in one semifinal, 3v6 &
 *     2v7 in the other, then the championship.
 *  6. "What if" picks force the winner of chosen games.
 */

import { predictScores } from './predictOptimalScore';

const DEFAULT_SD = 24;
const PRIOR_WEIGHT = 4; // weeks of "typical league" variance mixed in
// Team strength isn't fixed: trades, waivers, injuries and projection
// misses shift it over a season. Each simulated season every team gets
// one random shift (points per game) applied to all its remaining games.
const TEAM_SHIFT_SD = 9;
// Projections overstate gaps between teams, so pull them toward the
// league average a little.
const REGRESSION = 0.85;

/*
 * Draft lottery (Constitution 3.4). Ping pong balls by final
 * regular season place, plus Toilet Bowl finish (1st, 2nd, 3rd).
 * Every ball is always awarded, so #1 pick odds = balls / total.
 */
export const LOTTERY = {
	regularSeason: { 8: 1, 11: 3, 12: 2, 13: 1 },
	toiletBowl: [3, 2, 1]
};
const LOTTERY_TOTAL =
	Object.values(LOTTERY.regularSeason).reduce((t, b) => t + b, 0) +
	LOTTERY.toiletBowl.reduce((t, b) => t + b, 0);

const mean = (arr) => (arr.length ? arr.reduce((t, v) => t + v, 0) / arr.length : 0);

/** Standard normal sample (Box-Muller). */
const gaussian = (rand) => {
	let u = 0;
	let v = 0;
	while (u === 0) u = rand();
	while (v === 0) v = rand();
	return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

/** Small seedable RNG so a page shows stable numbers between refreshes. */
export const mulberry32 = (seed) => {
	let a = seed >>> 0;
	return () => {
		a |= 0;
		a = (a + 0x6d2b79f5) | 0;
		let t = Math.imul(a ^ (a >>> 15), 1 | a);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
};

const sumPoints = (points) =>
	Array.isArray(points) ? points.reduce((t, p) => t + Number(p || 0), 0) : Number(points || 0);

/**
 * Turns Sleeper data into everything the simulator needs.
 *
 * @param {object} p
 * @param {object} p.rosters      rosterID -> Sleeper roster (current season)
 * @param {object} p.players      player info with weekly projections (wi)
 * @param {object} p.leagueData   Sleeper league
 * @param {object} p.nflState     Sleeper NFL state
 * @param {Array}  p.matchupWeeks [{ week, matchups: { matchupID: [ {roster_id, starters, points[]} x2 ] } }]
 */
export const buildSimInputs = ({ rosters, players, leagueData, nflState, matchupWeeks }) => {
	const settings = leagueData?.settings || {};
	const regEnd = Number(settings.playoff_week_start || 15) - 1;
	const playoffTeams = Number(settings.playoff_teams || 8);
	const playoffRounds = playoffTeams > 4 ? 3 : 2;

	let currentWeek;
	if (leagueData?.status === 'complete' || nflState?.season_type === 'post' || nflState?.season_type === 'off') {
		currentWeek = regEnd + 1;
	} else if (nflState?.season_type === 'regular' && String(nflState.season) === String(leagueData.season)) {
		currentWeek = Number(nflState.week) || 1;
	} else {
		currentWeek = 1;
	}

	const teamIDs = Object.keys(rosters).map(String);
	const index = Object.fromEntries(teamIDs.map((id, i) => [id, i]));

	const weekMap = Object.fromEntries((matchupWeeks || []).map((w) => [Number(w.week), w.matchups]));

	// optimal-lineup projection for a team in a week
	const rosterPlayers = {};
	for (const id of teamIDs) {
		rosterPlayers[id] = (rosters[id].players || [])
			.filter((pid) => players[pid])
			.map((pid) => ({ name: players[pid].ln, pos: players[pid].pos, wi: players[pid].wi }));
	}
	const projCache = {};
	const projection = (id, week) => {
		const key = `${id}-${week}`;
		if (projCache[key] == null) projCache[key] = predictScores(rosterPlayers[id], week, leagueData);
		return projCache[key];
	};

	// actual scores in finished weeks
	const actual = Object.fromEntries(teamIDs.map((id) => [id, []]));
	const projectedPast = [];
	for (let week = 1; week < Math.min(currentWeek, regEnd + 1); week++) {
		const matchups = weekMap[week];
		if (!matchups) continue;
		for (const pair of Object.values(matchups)) {
			for (const team of pair) {
				const id = String(team.roster_id);
				if (!(id in actual)) continue;
				const pts = sumPoints(team.points);
				if (pts > 0) {
					actual[id].push(pts);
					projectedPast.push(projection(id, week));
				}
			}
		}
	}

	const allActual = teamIDs.flatMap((id) => actual[id]);
	let calibration = 0.92;
	if (allActual.length >= teamIDs.length && mean(projectedPast) > 0) {
		calibration = Math.min(1.1, Math.max(0.75, mean(allActual) / mean(projectedPast)));
	}

	const leagueAvg = allActual.length ? mean(allActual) : null;

	const teams = teamIDs.map((id) => {
		const s = rosters[id].settings || {};
		const scores = actual[id];
		const n = scores.length;
		const avg = mean(scores);
		const variance = n > 1 ? scores.reduce((t, v) => t + (v - avg) ** 2, 0) / (n - 1) : 0;
		const sd = Math.sqrt((n * variance + PRIOR_WEIGHT * DEFAULT_SD ** 2) / (n + PRIOR_WEIGHT));

		return {
			id,
			wins: Number(s.wins || 0),
			losses: Number(s.losses || 0),
			ties: Number(s.ties || 0),
			pointsFor: Number(s.fpts || 0) + Number(s.fpts_decimal || 0) / 100,
			avg: n ? avg : null,
			sd
		};
	});

	const expected = (id, week) => {
		const proj = projection(id, week) * calibration;
		const team = teams[index[id]];
		if (team.avg == null) return proj || leagueAvg || 100;
		if (!proj) return team.avg;
		return 0.7 * proj + 0.3 * team.avg;
	};

	// remaining regular season games
	const games = [];
	for (let week = currentWeek; week <= regEnd; week++) {
		const matchups = weekMap[week];
		if (!matchups) continue;

		for (const [matchupID, pair] of Object.entries(matchups)) {
			if (!pair || pair.length !== 2 || matchupID === 'null') continue;

			const sides = pair.map((team) => {
				const id = String(team.roster_id);
				let mu = expected(id, week);
				let sd = teams[index[id]].sd;
				let shiftWeight = 1;

				// week in progress: live points + projections for starters yet to play
				if (week === currentWeek) {
					const live = sumPoints(team.points);
					if (live > 0) {
						let remaining = 0;
						(team.starters || []).forEach((pid, i) => {
							const scored = Number(team.points?.[i] || 0);
							if (!scored && players[pid]?.wi?.[week]) {
								remaining += Number(players[pid].wi[week].p || 0) * calibration;
							}
						});
						const fraction = mu > 0 ? Math.min(1, remaining / mu) : 0;
						mu = live + remaining;
						sd = sd * Math.sqrt(fraction);
						shiftWeight = fraction;
					}
				}

				return { id, mu, sd, shiftWeight, live: shiftWeight < 1 };
			});

			games.push({ key: `${week}-${matchupID}`, week, a: sides[0], b: sides[1] });
		}
	}

	// pull future projections toward that week's league average
	const byWeek = {};
	for (const g of games) (byWeek[g.week] ??= []).push(g.a, g.b);
	for (const sides of Object.values(byWeek)) {
		const future = sides.filter((x) => !x.live);
		if (!future.length) continue;
		const avg = mean(future.map((x) => x.mu));
		for (const x of future) x.mu = avg + REGRESSION * (x.mu - avg);
	}

	// playoff weeks
	const playoffExpected = {};
	for (const team of teams) {
		playoffExpected[team.id] = [];
		for (let r = 0; r < playoffRounds; r++) {
			playoffExpected[team.id].push(expected(team.id, regEnd + 1 + r));
		}
	}
	for (let r = 0; r < playoffRounds; r++) {
		const avg = mean(teams.map((t) => playoffExpected[t.id][r]));
		for (const t of teams) playoffExpected[t.id][r] = avg + REGRESSION * (playoffExpected[t.id][r] - avg);
	}

	return {
		teams,
		index,
		games,
		currentWeek,
		regEnd,
		playoffTeams,
		playoffRounds,
		playoffExpected,
		calibration,
		season: leagueData?.season
	};
};

const rankTeams = (wins, points, n) => {
	const order = Array.from({ length: n }, (_, i) => i);
	order.sort((x, y) => wins[y] - wins[x] || points[y] - points[x]);
	return order;
};

/** Bracket pairs by seed (0-based), for supported sizes. */
const bracketFor = (size) => {
	if (size === 8) return { round1: [[0, 7], [3, 4], [2, 5], [1, 6]], byes: [] };
	if (size === 6) return { round1: [[3, 4], [2, 5]], byes: [0, 1] };
	if (size === 4) return { round1: [[0, 3], [1, 2]], byes: [] };
	return null;
};

/**
 * @param {object} inputs  from buildSimInputs
 * @param {object} opts
 * @param {number} opts.sims   number of simulated seasons
 * @param {object} opts.picks  { gameKey: rosterID } forced winners
 * @param {number} opts.seed   RNG seed
 */
export const simulateSeason = (inputs, { sims = 10000, picks = {}, seed = 2026 } = {}) => {
	const { teams, index, games, playoffTeams, playoffExpected } = inputs;
	const n = teams.length;
	const rand = mulberry32(seed);
	const bracket = bracketFor(playoffTeams);

	const playoffs = new Array(n).fill(0);
	const seeds = teams.map(() => new Array(n).fill(0));
	const wonRound1 = new Array(n).fill(0);
	const madeFinal = new Array(n).fill(0);
	const champion = new Array(n).fill(0);
	const winTotals = new Array(n).fill(0);
	const lossTotals = new Array(n).fill(0);
	const ballTotals = new Array(n).fill(0);
	const anyBalls = new Array(n).fill(0);
	const firstPickShare = new Array(n).fill(0);
	const simBalls = new Float64Array(n);
	// Toilet Bowl: seeds after the playoff teams, mirrored bracket, winners advance
	const toiletBowl = playoffTeams === 8 && n >= 16;

	const baseWins = teams.map((t) => t.wins + t.ties / 2);
	const basePoints = teams.map((t) => t.pointsFor);

	const wins = new Float64Array(n);
	const losses = new Float64Array(n);
	const points = new Float64Array(n);
	const shift = new Float64Array(n);

	const playGame = (i, j, roundIndex) => {
		const a = teams[i].id;
		const b = teams[j].id;
		const sa = playoffExpected[a][roundIndex] + shift[i] + teams[i].sd * gaussian(rand);
		const sb = playoffExpected[b][roundIndex] + shift[j] + teams[j].sd * gaussian(rand);
		return sa >= sb ? i : j;
	};

	for (let s = 0; s < sims; s++) {
		for (let i = 0; i < n; i++) {
			shift[i] = TEAM_SHIFT_SD * gaussian(rand);
			wins[i] = baseWins[i];
			losses[i] = teams[i].losses + teams[i].ties / 2;
			points[i] = basePoints[i];
		}

		for (const game of games) {
			const ia = index[game.a.id];
			const ib = index[game.b.id];
			const sa = Math.max(0, game.a.mu + shift[ia] * game.a.shiftWeight + game.a.sd * gaussian(rand));
			const sb = Math.max(0, game.b.mu + shift[ib] * game.b.shiftWeight + game.b.sd * gaussian(rand));
			points[ia] += sa;
			points[ib] += sb;

			const forced = picks[game.key];
			let aWins;
			if (forced != null) aWins = String(forced) === game.a.id;
			else aWins = sa >= sb;

			if (aWins) {
				wins[ia]++;
				losses[ib]++;
			} else {
				wins[ib]++;
				losses[ia]++;
			}
		}

		const order = rankTeams(wins, points, n);
		simBalls.fill(0);
		for (let place = 0; place < n; place++) {
			const t = order[place];
			seeds[t][place]++;
			winTotals[t] += wins[t];
			lossTotals[t] += losses[t];
			if (place < playoffTeams) playoffs[t]++;
			simBalls[t] += LOTTERY.regularSeason[place + 1] || 0;
		}

		if (toiletBowl) {
			const tb = (k) => order[playoffTeams + k]; // k = 0..7 -> seeds 9..16
			const r1 = [[0, 7], [3, 4], [2, 5], [1, 6]].map(([x, y]) => [tb(x), tb(y)]);
			const r1w = r1.map(([x, y]) => playGame(x, y, 0));
			const sf = [[r1w[0], r1w[1]], [r1w[2], r1w[3]]];
			const sfw = sf.map(([x, y]) => playGame(x, y, 1));
			const sfl = sf.map(([x, y], k) => (sfw[k] === x ? y : x));
			const first = playGame(sfw[0], sfw[1], 2);
			const second = first === sfw[0] ? sfw[1] : sfw[0];
			const third = playGame(sfl[0], sfl[1], 2);
			simBalls[first] += LOTTERY.toiletBowl[0];
			simBalls[second] += LOTTERY.toiletBowl[1];
			simBalls[third] += LOTTERY.toiletBowl[2];
		}

		const totalBalls = toiletBowl ? LOTTERY_TOTAL : LOTTERY_TOTAL - LOTTERY.toiletBowl.reduce((t, b) => t + b, 0);
		for (let i = 0; i < n; i++) {
			if (!simBalls[i]) continue;
			ballTotals[i] += simBalls[i];
			anyBalls[i]++;
			firstPickShare[i] += simBalls[i] / totalBalls;
		}

		if (!bracket) continue;

		// round 1
		const advancing = bracket.byes.map((seedIdx) => order[seedIdx]);
		const r1Winners = bracket.round1.map(([x, y]) => playGame(order[x], order[y], 0));
		for (const w of r1Winners) wonRound1[w]++;
		for (const b of advancing) wonRound1[b]++; // a bye counts as reaching the semifinal

		// semifinals
		let semis;
		if (playoffTeams === 8) semis = [[r1Winners[0], r1Winners[1]], [r1Winners[2], r1Winners[3]]];
		else if (playoffTeams === 6) semis = [[advancing[0], r1Winners[0]], [advancing[1], r1Winners[1]]];
		else semis = null;

		let finalists;
		if (semis) {
			finalists = semis.map(([x, y]) => playGame(x, y, 1));
		} else {
			finalists = r1Winners;
		}
		for (const f of finalists) madeFinal[f]++;

		const champ = playGame(finalists[0], finalists[1], semis ? 2 : 1);
		champion[champ]++;
	}

	const pct = (count) => (count / sims) * 100;

	return teams.map((team, i) => ({
		rosterID: team.id,
		record: { wins: team.wins, losses: team.losses, ties: team.ties },
		pointsFor: team.pointsFor,
		playoffPct: pct(playoffs[i]),
		seedPct: seeds[i].map(pct),
		projectedWins: winTotals[i] / sims,
		projectedLosses: lossTotals[i] / sims,
		semifinalPct: bracket ? pct(wonRound1[i]) : null,
		finalPct: bracket ? pct(madeFinal[i]) : null,
		champPct: bracket ? pct(champion[i]) : null,
		lotteryBalls: ballTotals[i] / sims,
		lotteryAnyPct: pct(anyBalls[i]),
		firstPickPct: (firstPickShare[i] / sims) * 100
	}));
};

/**
 * Clinched / eliminated, by worst and best cases (wins only, so
 * points tiebreakers can never make these wrong).
 *
 * clinched:   even losing out, fewer than `playoffTeams` other teams
 *             could finish with as many wins
 * eliminated: even winning out, at least `playoffTeams` teams
 *             already have more wins
 * Picks are applied as decided results.
 */
export const clinchStatus = (inputs, picks = {}) => {
	const { teams, index, games, playoffTeams } = inputs;
	const n = teams.length;

	const now = teams.map((t) => t.wins + t.ties / 2);
	const remaining = new Array(n).fill(0);

	for (const game of games) {
		const forced = picks[game.key];
		const ia = index[game.a.id];
		const ib = index[game.b.id];
		if (forced != null) {
			if (String(forced) === game.a.id) now[ia]++;
			else now[ib]++;
		} else {
			remaining[ia]++;
			remaining[ib]++;
		}
	}

	const best = now.map((w, i) => w + remaining[i]);

	return teams.map((team, i) => {
		const worst = now[i];
		const threats = teams.filter((_, j) => j !== i && best[j] >= worst).length;
		const clinched = threats < playoffTeams;

		const surelyAhead = teams.filter((_, j) => j !== i && now[j] > best[i]).length;
		const eliminated = surelyAhead >= playoffTeams;

		return { rosterID: team.id, clinched, eliminated };
	});
};

/*
 * ============================================================
 * WIN PROBABILITY for a single week's games
 * ============================================================
 * Each side's score ~ Normal(expected, its swing, plus the season-long
 * strength shift for whatever is still left to play). The chance A
 * beats B is the chance that (A - B) > 0.
 */
const erf = (x) => {
	// Abramowitz-Stegun 7.1.26
	const sign = x < 0 ? -1 : 1;
	const ax = Math.abs(x);
	const t = 1 / (1 + 0.3275911 * ax);
	const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-ax * ax);
	return sign * y;
};

const normalCdf = (z) => 0.5 * (1 + erf(z / Math.SQRT2));

/**
 * @returns {{ week: number, probs: { [rosterID]: number } }} percent chance each team wins its game
 */
export const gameWinProbabilities = (inputs, week = inputs.currentWeek) => {
	const probs = {};
	for (const g of inputs.games) {
		if (g.week !== week) continue;
		const variance =
			g.a.sd ** 2 +
			g.b.sd ** 2 +
			(TEAM_SHIFT_SD * g.a.shiftWeight) ** 2 +
			(TEAM_SHIFT_SD * g.b.shiftWeight) ** 2;
		const diff = g.a.mu - g.b.mu;
		const p = variance > 1e-9 ? normalCdf(diff / Math.sqrt(variance)) : diff > 0 ? 1 : diff < 0 ? 0 : 0.5;
		probs[g.a.id] = p * 100;
		probs[g.b.id] = (1 - p) * 100;
	}
	return { week, probs };
};
