/*
 * ============================================================
 * MANAGER INSIGHTS
 * ============================================================
 *
 * Powers the dynamic parts of the Managers pages:
 *
 *   - Rival:            the opponent who has beaten a manager the
 *                       most times, all time (regular season +
 *                       championship bracket, every linked season)
 *   - Favorite Player:  the player on a team's current roster who
 *                       has scored the most fantasy points for that
 *                       team this season
 *   - Win Now/Rebuild:  league-wide tiers built from record, points
 *                       scored, rest-of-season projections and
 *                       roster age
 */

import { leagueID, managers as managersConfig } from '$lib/utils/leagueInfo';
import { browser } from '$app/environment';
import { getLeagueData } from './leagueData';
import { getNflState } from './nflState';
import { getLeagueTeamManagers } from './leagueTeamManagers';
import { getRosterIDFromManagerID } from './universalFunctions';
import { predictScores } from './predictOptimalScore';
import { waitForAll } from './multiPromise';
import { getLeagueRosters } from './leagueRosters';
import { loadPlayers } from './players';
import { classifyBracketGame, maxBracketRound } from './playoffRounds';

const CACHE_PREFIX = 'mfflSeasonGames_v2_';

const fetchJSON = async (url) => {
	const res = await fetch(url, { compress: true });
	if (!res.ok) throw new Error(`Sleeper request failed (${res.status}): ${url}`);
	return res.json();
};

const sumPoints = (team) =>
	Array.isArray(team.points)
		? team.points.reduce((t, p) => t + Number(p || 0), 0)
		: Number(team.points || 0);

/*
 * Loads one season.
 * games:        [{ week, playoff, a, b, winner, loser, tie }]  (roster IDs)
 * playerPoints: { rosterID: { playerID: points } }  (only if asked)
 */
const loadSeason = async (league, maxWeek, withPlayerPoints) => {
	const lastRegularWeek = Number(league.settings?.playoff_week_start || 15) - 1;
	const weeks = Math.max(0, Math.min(lastRegularWeek, maxWeek));

	const requests = [];
	for (let week = 1; week <= weeks; week++) {
		requests.push(fetchJSON(`https://api.sleeper.app/v1/league/${league.league_id}/matchups/${week}`));
	}
	requests.push(
		fetchJSON(`https://api.sleeper.app/v1/league/${league.league_id}/winners_bracket`).catch(() => [])
	);

	const results = await waitForAll(...requests);
	const bracket = results.pop() || [];

	const games = [];
	const playerPoints = {};

	results.forEach((weekData, index) => {
		const week = index + 1;
		const byMatchup = {};

		for (const team of weekData || []) {
			if (withPlayerPoints && team.players_points) {
				const bucket = (playerPoints[team.roster_id] ??= {});
				for (const [playerID, points] of Object.entries(team.players_points)) {
					bucket[playerID] = (bucket[playerID] || 0) + Number(points || 0);
				}
			}

			if (team.matchup_id == null) continue;
			(byMatchup[team.matchup_id] ??= []).push(team);
		}

		for (const pair of Object.values(byMatchup)) {
			if (pair.length !== 2) continue;

			const [a, b] = pair;
			const aPoints = sumPoints(a);
			const bPoints = sumPoints(b);

			// 0-0 means the game hasn't been played
			if (aPoints === 0 && bPoints === 0) continue;

			games.push({
				week,
				playoff: false,
				a: a.roster_id,
				b: b.roster_id,
				tie: aPoints === bPoints,
				winner: aPoints > bPoints ? a.roster_id : b.roster_id,
				loser: aPoints > bPoints ? b.roster_id : a.roster_id
			});
		}
	});

	// championship bracket games that have a winner (placement games skipped)
	const maxRound = maxBracketRound(bracket);
	for (const game of bracket) {
		if (!game.t1 || !game.t2 || !game.w) continue;
		if (!classifyBracketGame(game, maxRound)) continue;
		games.push({
			week: lastRegularWeek + Number(game.r || 1),
			playoff: true,
			a: game.t1,
			b: game.t2,
			tie: false,
			winner: game.w,
			loser: game.w === game.t1 ? game.t2 : game.t1
		});
	}

	return { games, playerPoints };
};

const readCache = (id) => {
	if (!browser) return null;
	try {
		return JSON.parse(localStorage.getItem(CACHE_PREFIX + id));
	} catch {
		return null;
	}
};

const writeCache = (id, value) => {
	if (!browser) return;
	try {
		localStorage.setItem(CACHE_PREFIX + id, JSON.stringify(value));
	} catch {
		// storage full or blocked — not a problem, we just refetch next time
	}
};

/*
 * Walks every linked season and builds:
 *   beats[winnerManagerID][loserManagerID] = number of wins
 *   ties[managerA][managerB]               = number of ties
 *   seasonPlayerPoints                     = current season, per roster
 */
const buildHistory = async () => {
	const [nflState, teamManagers] = await waitForAll(getNflState(), getLeagueTeamManagers());

	const beats = {};
	const ties = {};
	const timeline = {}; // managerID -> [{ year, week, playoff, r: 'W'|'L'|'T' }]
	const pairs = {}; // 'idA|idB' (sorted) -> { reg, qf, sf, ch } meetings between two managers
	let seasonPlayerPoints = {};

	const managersOf = (year, rosterID) =>
		teamManagers.teamManagersMap?.[year]?.[rosterID]?.managers || [];

	const record = (year, game, depth = 0) => {
		const left = managersOf(year, game.tie ? game.a : game.winner);
		const right = managersOf(year, game.tie ? game.b : game.loser);

		// meeting counts per manager pair (depth 3 = Championship, 2 = Semifinals, 1 = earlier round)
		const field = !game.playoff ? 'reg' : depth === 3 ? 'ch' : depth === 2 ? 'sf' : 'qf';
		for (const x of left) {
			for (const y of right) {
				if (x === y) continue;
				const k = x < y ? `${x}|${y}` : `${y}|${x}`;
				const p = (pairs[k] ??= { reg: 0, qf: 0, sf: 0, ch: 0 });
				p[field]++;
			}
		}

		const log = (ids, r) => {
			for (const id of ids) (timeline[id] ??= []).push({ year, week: game.week, playoff: game.playoff, r });
		};
		log(left, game.tie ? 'T' : 'W');
		log(right, game.tie ? 'T' : 'L');

		for (const x of left) {
			for (const y of right) {
				if (x === y) continue;
				if (game.tie) {
					(ties[x] ??= {})[y] = (ties[x][y] || 0) + 1;
					(ties[y] ??= {})[x] = (ties[y][x] || 0) + 1;
				} else {
					(beats[x] ??= {})[y] = (beats[x][y] || 0) + 1;
				}
			}
		}
	};

	let currentLeagueID = leagueID;
	let isCurrentSeason = true;

	while (currentLeagueID && currentLeagueID != 0) {
		const league = await getLeagueData(currentLeagueID);
		const year = parseInt(league.season);

		let season;

		if (isCurrentSeason) {
			// current season: always fresh. The week being played right
			// now counts for player points but not for wins and losses.
			let maxWeek = 18;
			let liveWeek = null;

			if (nflState.season_type === 'regular' && String(nflState.season) === String(league.season)) {
				maxWeek = Number(nflState.week) || 0;
				liveWeek = maxWeek;
			} else if (league.status === 'pre_draft' || league.status === 'drafting') {
				maxWeek = 0;
			}

			season = await loadSeason(league, maxWeek, true);
			seasonPlayerPoints = season.playerPoints;

			if (liveWeek) {
				season.games = season.games.filter((g) => g.playoff || g.week < liveWeek);
			}
		} else {
			season = readCache(league.league_id);
			if (!season) {
				season = await loadSeason(league, 18, false);
				if (league.status === 'complete') writeCache(league.league_id, { games: season.games });
			}
		}

		// playoff games are stored at week = last regular week + bracket round
		const lastRegularWeek = Number(league.settings?.playoff_week_start || 15) - 1;
		const bracketRounds = Math.max(1, Math.ceil(Math.log2(Number(league.settings?.playoff_teams) || 8)));
		for (const game of season.games) {
			const round = game.week - lastRegularWeek;
			const depth = game.playoff ? Math.max(1, 3 - (bracketRounds - round)) : 0;
			record(year, game, depth);
		}

		currentLeagueID = league.previous_league_id;
		isCurrentSeason = false;
	}

	return { beats, ties, timeline, pairs, seasonPlayerPoints, teamManagers };
};

let historyPromise = null;

/*
 * ============================================================
 * WIN STREAKS
 * ============================================================
 * Longest run of consecutive wins for each manager, across every
 * linked season (a streak carries over from one season into the
 * next). A loss or a tie ends it. `playoffs` picks championship
 * bracket games only; otherwise regular-season games only.
 * Only managers on a current team are returned.
 */
export const computeWinStreaks = (history, { playoffs = false } = {}) => {
	if (!history?.timeline) return [];
	const tm = history.teamManagers;
	const current = tm?.teamManagersMap?.[tm.currentSeason] || {};

	const currentRosterOf = {};
	for (const [rosterID, entry] of Object.entries(current)) {
		for (const m of entry.managers || []) currentRosterOf[m] = Number(rosterID);
	}

	const out = [];
	for (const managerID of Object.keys(currentRosterOf)) {
		const games = (history.timeline[managerID] || [])
			.filter((g) => !!g.playoff === !!playoffs)
			.sort((a, b) => a.year - b.year || a.week - b.week);

		let longest = 0, run = 0, runStart = null, best = null;
		for (const g of games) {
			if (g.r === 'W') {
				if (run === 0) runStart = g;
				run++;
				// ">=" keeps the most recent streak when two are tied
				if (run >= longest) {
					longest = run;
					best = { start: runStart, end: g };
				}
			} else {
				run = 0;
			}
		}

		out.push({
			managerID,
			rosterID: currentRosterOf[managerID],
			streak: longest,
			current: run,
			active: longest > 0 && run === longest,
			start: best?.start ? { year: best.start.year, week: best.start.week } : null,
			end: best?.end ? { year: best.end.year, week: best.end.week } : null,
			games: games.length
		});
	}

	out.sort((a, b) => b.streak - a.streak || b.current - a.current);
	return out;
};

/** Cached for the life of the page so every manager view reuses it. */
export const getManagerHistory = (forceRefresh = false) => {
	if (!historyPromise || forceRefresh) {
		historyPromise = buildHistory().catch((err) => {
			historyPromise = null;
			throw err;
		});
	}
	return historyPromise;
};

/*
 * ============================================================
 * RIVAL
 * ============================================================
 * The opponent with the most wins over this manager.
 * Tie-breaker: the one this manager has beaten the fewest times.
 */
export const findRival = (history, managerID) => {
	if (!history || !managerID) return null;

	let best = null;

	const inLeague = (id) => managersConfig.some((m) => String(m.managerID) === String(id));

	for (const opponentID in history.beats) {
		if (opponentID === managerID) continue;

		const theirWins = history.beats[opponentID]?.[managerID] || 0;
		if (!theirWins) continue;

		const yourWins = history.beats[managerID]?.[opponentID] || 0;
		const current = inLeague(opponentID);

		// most wins over you → fewest of your wins over them → still in the league
		if (
			!best ||
			theirWins > best.theirWins ||
			(theirWins === best.theirWins && yourWins < best.yourWins) ||
			(theirWins === best.theirWins && yourWins === best.yourWins && current && !best.current)
		) {
			best = { opponentID, theirWins, yourWins, current };
		}
	}

	if (!best) return null;

	const { teamManagers } = history;
	const configIndex = managersConfig.findIndex(
		(m) => String(m.managerID) === String(best.opponentID)
	);
	const config = configIndex > -1 ? managersConfig[configIndex] : null;

	const location = getRosterIDFromManagerID(teamManagers, best.opponentID);
	const team = location
		? teamManagers.teamManagersMap[location.year]?.[location.rosterID]?.team
		: null;

	return {
		managerID: best.opponentID,
		name: team?.name || config?.name || teamManagers.users?.[best.opponentID]?.display_name || 'Unknown',
		image: config?.photo || team?.avatar || 'https://sleepercdn.com/images/v2/icons/player_default.webp',
		link: configIndex > -1 ? configIndex : null,
		theirWins: best.theirWins,
		yourWins: best.yourWins,
		ties: history.ties?.[managerID]?.[best.opponentID] || 0
	};
};

/*
 * ============================================================
 * FAVORITE PLAYER
 * ============================================================
 * Highest season point total for this team, among players still
 * on the roster.
 */
export const findTopScorer = (history, roster) => {
	if (!history || !roster) return null;

	const points = history.seasonPlayerPoints?.[roster.roster_id];
	if (!points) return null;

	let best = null;

	for (const playerID of roster.players || []) {
		const total = points[playerID] || 0;
		if (total > 0 && (!best || total > best.points)) {
			best = { playerID, points: Math.round(total * 100) / 100 };
		}
	}

	return best;
};

/*
 * ============================================================
 * WIN NOW / REBUILD TIERS
 * ============================================================
 * "Strength now" (0-100) blends where each team ranks in the
 * league on:
 *     record                  45%
 *     points scored           25%
 *     rest-of-season proj.    30%
 * (before any games are played it's projection only)
 *
 * Teams are split into thirds:
 *     Contender  → Win Now  (or Dynasty if the core is young)
 *     Bubble     → Win Now if the core is older, Rebuild if young
 *     Rebuilding → Rebuild
 *
 * "Young" = the team's top-10 projected players average an age at
 * or below the league median.
 */
const SEASON_END = 18;

const percentile = (values, value) => {
	if (values.length <= 1) return 0.5;
	const below = values.filter((v) => v < value).length;
	const equal = values.filter((v) => v === value).length;
	return (below + (equal - 1) / 2) / (values.length - 1);
};

const median = (values) => {
	if (!values.length) return null;
	const sorted = [...values].sort((a, b) => a - b);
	const mid = Math.floor(sorted.length / 2);
	return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

export const computeTeamTiers = ({ rosters, players, leagueData, nflState }) => {
	if (!rosters || !players) return {};

	let week = 1;
	if (nflState?.season_type === 'regular') week = Number(nflState.week) || 1;
	if (nflState?.season_type === 'post' || leagueData?.status === 'complete') week = SEASON_END;

	const teams = [];

	for (const rosterID in rosters) {
		const roster = rosters[rosterID];
		const rosterPlayers = [];
		const playerValues = [];

		for (const playerID of roster.players || []) {
			const player = players[playerID];
			if (!player) continue;

			rosterPlayers.push({ name: player.ln, pos: player.pos, wi: player.wi });

			let remaining = 0;
			for (let i = week; i < SEASON_END; i++) remaining += Number(player.wi?.[i]?.p || 0);
			playerValues.push({ age: Number(player.a) || null, remaining });
		}

		let projection = 0;
		for (let i = week; i < SEASON_END; i++) {
			projection += predictScores(rosterPlayers, i, leagueData);
		}

		const ages = playerValues
			.sort((a, b) => b.remaining - a.remaining)
			.slice(0, 10)
			.map((p) => p.age)
			.filter(Boolean);

		const s = roster.settings || {};
		const wins = Number(s.wins || 0);
		const losses = Number(s.losses || 0);
		const ties = Number(s.ties || 0);
		const games = wins + losses + ties;

		teams.push({
			rosterID: String(rosterID),
			games,
			winPct: games ? (wins + ties / 2) / games : 0,
			pointsFor: Number(s.fpts || 0) + Number(s.fpts_decimal || 0) / 100,
			projection,
			avgAge: ages.length >= 5 ? ages.reduce((t, a) => t + a, 0) / ages.length : null
		});
	}

	const winPcts = teams.map((t) => t.winPct);
	const pointsFors = teams.map((t) => t.pointsFor);
	const projections = teams.map((t) => t.projection);
	const anyGames = teams.some((t) => t.games > 0);
	const anyProjection = projections.some((p) => p > 0);

	let weights = { record: 0.45, points: 0.25, projection: 0.3 };
	if (!anyGames) weights = { record: 0, points: 0, projection: 1 };
	else if (!anyProjection) weights = { record: 0.65, points: 0.35, projection: 0 };

	for (const team of teams) {
		team.nowScore =
			weights.record * percentile(winPcts, team.winPct) +
			weights.points * percentile(pointsFors, team.pointsFor) +
			weights.projection * percentile(projections, team.projection);
	}

	teams.sort((a, b) => b.nowScore - a.nowScore);

	const total = teams.length;
	const third = Math.round(total / 3);
	const medianAge = median(teams.map((t) => t.avgAge).filter(Boolean));

	const result = {};

	teams.forEach((team, index) => {
		const rank = index + 1;
		const young = medianAge != null && team.avgAge != null ? team.avgAge <= medianAge : null;

		let tier, mode;

		if (rank <= third) {
			tier = 'Contender';
			mode = young ? 'Dynasty' : 'Win Now';
		} else if (rank > total - third) {
			tier = 'Rebuilding';
			mode = 'Rebuild';
		} else {
			tier = 'Bubble';
			mode = young ? 'Rebuild' : 'Win Now';
		}

		result[team.rosterID] = {
			rank,
			total,
			tier,
			mode,
			strength: Math.round(team.nowScore * 100),
			avgAge: team.avgAge != null ? Math.round(team.avgAge * 10) / 10 : null
		};
	});

	return result;
};

export const TIER_ORDER = ['Contender', 'Bubble', 'Rebuilding'];


/*
 * ============================================================
 * LIVE TIERS (shared, cached)
 * ============================================================
 * One calculation per page load, shared by the manager rows, the
 * League Tiers board and anything else that shows Win Now/Rebuild.
 */
let tiersPromise = null;

export const getLiveTeamTiers = () => {
	if (!tiersPromise) {
		tiersPromise = waitForAll(getLeagueRosters(), getLeagueData(), getNflState(), loadPlayers(null))
			.then(([rostersData, leagueData, nflState, playerData]) =>
				computeTeamTiers({
					rosters: rostersData.rosters,
					players: playerData.players,
					leagueData,
					nflState
				})
			)
			.catch((err) => {
				tiersPromise = null;
				throw err;
			});
	}
	return tiersPromise;
};
