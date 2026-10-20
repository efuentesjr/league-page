/*
 * GET /api/trade_grades
 * Gathers every season's trades, weekly starting lineups, rosters and
 * rookie drafts from Sleeper, grades every trade (see tradeGrades.js)
 * and returns a compact summary. Cached on Vercel's CDN for an hour so
 * visitors get it instantly and Sleeper is called rarely.
 */
import { json, error } from '@sveltejs/kit';
import { leagueID } from '$lib/utils/leagueInfo';
import { computeTradeGrades } from '$lib/utils/helperFunctions/tradeGrades';

const SLEEPER = 'https://api.sleeper.app/v1';

const getJSON = async (path) => {
	const res = await fetch(`${SLEEPER}${path}`);
	if (!res.ok) throw new Error(`Sleeper ${res.status} for ${path}`);
	return res.json();
};

/** run async tasks with limited concurrency (be polite to Sleeper) */
const pool = async (tasks, size = 10) => {
	const results = new Array(tasks.length);
	let next = 0;
	const worker = async () => {
		while (next < tasks.length) {
			const i = next++;
			results[i] = await tasks[i]();
		}
	};
	await Promise.all(Array.from({ length: Math.min(size, tasks.length) }, worker));
	return results;
};

const loadSeason = async (league, nflState) => {
	const isCurrent = String(league.season) === String(nflState.season);
	const lastWeek = isCurrent && nflState.season_type === 'regular' ? Math.max(1, Number(nflState.week)) : 18;
	const matchupWeeks = Math.min(lastWeek, 17);

	const tasks = [];
	for (let w = 1; w <= matchupWeeks; w++) tasks.push(() => getJSON(`/league/${league.league_id}/matchups/${w}`).catch(() => []));
	for (let w = 1; w <= lastWeek; w++) tasks.push(() => getJSON(`/league/${league.league_id}/transactions/${w}`).catch(() => []));
	tasks.push(() => getJSON(`/league/${league.league_id}/rosters`));
	tasks.push(() => getJSON(`/league/${league.league_id}/users`));
	tasks.push(() => getJSON(`/league/${league.league_id}/drafts`).catch(() => []));

	const results = await pool(tasks);
	const matchups = results.slice(0, matchupWeeks);
	const transactions = results.slice(matchupWeeks, matchupWeeks + lastWeek).flat();
	const [rosters, users, drafts] = results.slice(matchupWeeks + lastWeek);

	// starting lineups only: { week: { rosterID: { playerID: points } } }
	const starters = {};
	matchups.forEach((weekData, i) => {
		const week = i + 1;
		const byRoster = {};
		let any = false;
		for (const team of weekData || []) {
			const lineup = {};
			(team.starters || []).forEach((pid, k) => {
				if (!pid || pid === '0') return;
				const pts = Number(team.starters_points?.[k] || 0);
				lineup[pid] = pts;
				if (pts) any = true;
			});
			byRoster[team.roster_id] = lineup;
		}
		if (any) starters[week] = byRoster; // skip weeks not played yet
	});

	// this season's rookie draft (latest completed one)
	let draft = null;
	const done = (drafts || []).filter((d) => d.status === 'complete' && String(d.season) === String(league.season));
	if (done.length) {
		const latest = done.sort((a, b) => (b.start_time || 0) - (a.start_time || 0))[0];
		const [detail, picks] = await Promise.all([
			getJSON(`/draft/${latest.draft_id}`),
			getJSON(`/draft/${latest.draft_id}/picks`)
		]);
		draft = {
			status: 'complete',
			slotToRoster: detail.slot_to_roster_id || {},
			picks: (picks || []).map((p) => ({ round: p.round, draft_slot: p.draft_slot, player_id: p.player_id }))
		};
	}

	return {
		season: Number(league.season),
		leagueID: league.league_id,
		starters,
		transactions,
		rosters: (rosters || []).map((r) => ({ roster_id: r.roster_id, owner_id: r.owner_id, co_owners: r.co_owners })),
		users: Object.fromEntries((users || []).map((u) => [u.user_id, u.display_name])),
		draft
	};
};

export async function GET() {
	try {
		const nflState = await getJSON('/state/nfl');

		const leagues = [];
		let id = leagueID;
		while (id && id !== '0') {
			const league = await getJSON(`/league/${id}`);
			leagues.push(league);
			id = league.previous_league_id;
		}

		const seasons = await Promise.all(leagues.map((league) => loadSeason(league, nflState)));

		const current = seasons[0];
		const playedWeeks = Object.keys(current?.starters || {}).map(Number);
		const nowKey = current
			? current.season * 100 + (playedWeeks.length ? Math.max(...playedWeeks) : 0)
			: 0;

		const result = computeTradeGrades({ seasons, nowKey });

		return json(
			{ generated: Date.now(), currentSeason: current?.season, ...result },
			{
				headers: {
					'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400'
				}
			}
		);
	} catch (err) {
		console.error('[trade_grades]', err);
		throw error(502, 'Could not grade trades right now');
	}
}
