import { json } from '@sveltejs/kit';
import { parseRookies } from '$lib/utils/helperFunctions/rookieProjection';

/*
 * Rookie projection for the upcoming draft board.
 * Source: DynastyProcess open data (updated weekly, CSV on GitHub).
 * Returns that season's rookie class (QB/RB/WR/TE) ranked by superflex value.
 * Cached on Vercel's CDN for a day.
 */
const CSV_URL = 'https://raw.githubusercontent.com/dynastyprocess/data/master/files/values-players.csv';
export async function GET({ url, fetch }) {
	const season = parseInt(url.searchParams.get('season'), 10);
	if (!season) return json({ message: 'season required' }, { status: 400 });
	try {
		const res = await fetch(CSV_URL);
		if (!res.ok) throw new Error(`DynastyProcess ${res.status}`);
		const { updated, rookies } = parseRookies(await res.text(), season);
		return json(
			{ season, updated, source: 'DynastyProcess superflex values', rookies },
			{ headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' } }
		);
	} catch (err) {
		return json(
			{ season, rookies: [], message: String(err?.message || err) },
			{ status: 200, headers: { 'Cache-Control': 'public, s-maxage=600' } }
		);
	}
}
