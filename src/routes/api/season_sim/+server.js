/*
 * Season simulation, run once on the server and cached on Vercel's CDN, so
 * the Playoff Odds and Drafts pages don't each run 10,000 simulated seasons
 * in every visitor's browser.
 *
 * Returns the simulation inputs (so the page can still run "What if?" picks
 * locally), the baseline results, clinch status, projected draft order, and
 * the offseason mode / final playoff field.
 */
import { json } from '@sveltejs/kit';
import { leagueID } from '$lib/utils/leagueInfo';
import {
	buildSimInputs,
	simulateSeason,
	clinchStatus,
	projectedDraftOrder,
	finalPlayoffField
} from '$lib/utils/helperFunctions/playoffOdds';

const SIMS = 10000;
const API = 'https://api.sleeper.app/v1';

const getJSON = async (u) => {
	const res = await fetch(u);
	if (!res.ok) throw new Error(`${res.status} ${u}`);
	return res.json();
};

const processMatchups = (list) => {
	if (!list?.length) return null;
	const matchups = {};
	for (const m of list) {
		(matchups[m.matchup_id] ??= []).push({ roster_id: m.roster_id, starters: m.starters, points: m.starters_points });
	}
	return matchups;
};

export async function GET({ url }) {
	const [leagueData, rosterList, nflState] = await Promise.all([
		getJSON(`${API}/league/${leagueID}`),
		getJSON(`${API}/league/${leagueID}/rosters`),
		getJSON(`${API}/state/nfl`)
	]);
	const rosters = Object.fromEntries(rosterList.map((r) => [r.roster_id, r]));
	const regEnd = Number(leagueData.settings?.playoff_week_start || 15) - 1;

	// player projections come from the (CDN-cached) players endpoint
	const [weekly, playersRes] = await Promise.all([
		Promise.all(
			Array.from({ length: regEnd }, (_, i) =>
				getJSON(`${API}/league/${leagueID}/matchups/${i + 1}`).catch(() => null)
			)
		),
		fetch(new URL('/api/fetch_players_info', url.origin)).then((r) => (r.ok ? r.json() : {}))
	]);
	const matchupWeeks = weekly
		.map((list, i) => ({ week: i + 1, matchups: processMatchups(list) }))
		.filter((w) => w.matchups);

	const inputs = buildSimInputs({ rosters, players: playersRes, leagueData, nflState, matchupWeeks });

	const out = { updated: new Date().toISOString(), season: leagueData.season, sims: SIMS, mode: 'live', inputs };

	if (!inputs.games.length) {
		const played = inputs.teams.some((t) => t.wins + t.losses + t.ties > 0);
		if (played) {
			out.mode = 'final';
			out.field = finalPlayoffField(rosters, leagueData.settings);
			out.fieldSeason = leagueData.season;
		} else {
			out.mode = 'waiting';
			const prevID = leagueData.previous_league_id;
			if (prevID && prevID !== '0') {
				const [prevLeague, prevRosters] = await Promise.all([
					getJSON(`${API}/league/${prevID}`),
					getJSON(`${API}/league/${prevID}/rosters`)
				]).catch(() => [null, null]);
				if (prevRosters) {
					out.field = finalPlayoffField(prevRosters, prevLeague?.settings);
					out.fieldSeason = prevLeague?.season;
				}
			}
		}
	}

	if (out.mode !== 'waiting' && inputs.teams.length) {
		out.results = simulateSeason(inputs, { sims: SIMS });
		out.status = clinchStatus(inputs);
		out.draftOrder = projectedDraftOrder(out.results, inputs.playoffTeams);
	}

	// fresh for 5 minutes, then served instantly while a new run happens in the background
	return json(out, {
		headers: { 'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=3600' }
	});
}
