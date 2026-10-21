import { json } from '@sveltejs/kit';
import { parseLine } from '$lib/utils/helperFunctions/rookieProjection';

/*
 * Dynasty trade values (superflex) from DynastyProcess open data, updated
 * weekly. Players are matched to Sleeper IDs through DynastyProcess's
 * player ID map. Cached on Vercel's CDN for a day.
 */
const BASE = 'https://raw.githubusercontent.com/dynastyprocess/data/master/files';

const rows = (text) => {
	const lines = text.split(/\r?\n/).filter(Boolean);
	const header = parseLine(lines[0]);
	return lines.slice(1).map((l) => {
		const r = parseLine(l);
		return Object.fromEntries(header.map((h, i) => [h, r[i]]));
	});
};

export async function GET({ fetch }) {
	try {
		const [valuesRes, idsRes] = await Promise.all([fetch(`${BASE}/values.csv`), fetch(`${BASE}/db_playerids.csv`)]);
		if (!valuesRes.ok || !idsRes.ok) throw new Error(`DynastyProcess ${valuesRes.status}/${idsRes.status}`);
		const values = rows(await valuesRes.text());
		const fpToSleeper = {};
		for (const r of rows(await idsRes.text())) {
			if (r.fantasypros_id && r.sleeper_id && r.sleeper_id !== 'NA') fpToSleeper[r.fantasypros_id] = r.sleeper_id;
		}

		const players = {};
		const picks = {};
		let updated = null;
		for (const v of values) {
			const value = Math.round(Number(v.value_2qb) || 0);
			if (!updated && v.scrape_date) updated = v.scrape_date;
			if (v.pos === 'PICK') {
				picks[v.player] = value;
			} else {
				const sid = fpToSleeper[v.fp_id];
				if (sid) players[sid] = value;
			}
		}

		return json(
			{ updated, source: 'DynastyProcess superflex values', players, picks },
			{ headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' } }
		);
	} catch (err) {
		return json({ players: {}, picks: {}, message: String(err?.message || err) }, { status: 502, headers: { 'Cache-Control': 'public, s-maxage=300' } });
	}
}
