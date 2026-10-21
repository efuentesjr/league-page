import { json } from '@sveltejs/kit';
import { parseLine } from '$lib/utils/helperFunctions/rookieProjection';
import { leagueID } from '$lib/utils/leagueInfo';

/*
 * Dynasty trade values (superflex) from DynastyProcess open data, updated
 * weekly. Players are matched to Sleeper IDs through DynastyProcess's
 * player ID map. Cached on Vercel's CDN for a day.
 *
 * TE premium: DynastyProcess assumes standard scoring. For each valued TE we
 * compare this season + last season's standard PPR points with what the
 * league's TE bonuses (per catch, per first down) add, and boost the value by
 * that ratio, toned down (ratio ^ 0.6) and capped at +40%. TEs without enough
 * catches get the median boost.
 */
const TE_DAMPEN = 0.6;
const TE_MAX_BOOST = 1.4;
const TE_MIN_REC = 15;
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
		const ages = {};
		const tes = [];
		let updated = null;
		for (const v of values) {
			const value = Math.round(Number(v.value_2qb) || 0);
			if (!updated && v.scrape_date) updated = v.scrape_date;
			if (v.pos === 'PICK') {
				picks[v.player] = value;
			} else {
				const sid = fpToSleeper[v.fp_id];
				if (!sid) continue;
				players[sid] = value;
				const age = Number(v.age);
				if (age) ages[sid] = age;
				if (v.pos === 'TE') tes.push(sid);
			}
		}

		// ---- TE premium from the league's own scoring ----
		const teBoost = {};
		let tePremium = null;
		try {
			const league = await fetch(`https://api.sleeper.app/v1/league/${leagueID}`).then((r) => r.json());
			const perRec = Number(league.scoring_settings?.bonus_rec_te) || 0;
			const perFd = Number(league.scoring_settings?.bonus_fd_te) || 0;
			if (perRec || perFd) {
				tePremium = { perRec, perFd };
				const season = Number(league.season);
				const [cur, prev] = await Promise.all(
					[season, season - 1].map((y) =>
						fetch(`https://api.sleeper.app/v1/stats/nfl/regular/${y}`).then((r) => (r.ok ? r.json() : {})).catch(() => ({}))
					)
				);
				const raw = {};
				for (const sid of tes) {
					const a = cur?.[sid] || {}, b = prev?.[sid] || {};
					const rec = (a.rec || 0) + (b.rec || 0);
					const fd = (a.rec_fd || 0) + (b.rec_fd || 0);
					const ppr = (a.pts_ppr || 0) + (b.pts_ppr || 0);
					if (rec >= TE_MIN_REC && ppr > 0) {
						const ratio = (ppr + rec * perRec + fd * perFd) / ppr;
						raw[sid] = Math.min(TE_MAX_BOOST, Math.pow(ratio, TE_DAMPEN));
					}
				}
				const sorted = Object.values(raw).sort((x, y) => x - y);
				const median = sorted.length ? sorted[Math.floor(sorted.length / 2)] : 1;
				for (const sid of tes) teBoost[sid] = Math.round((raw[sid] ?? median) * 1000) / 1000;
				tePremium.median = Math.round(median * 1000) / 1000;
			}
		} catch {
			// no premium adjustment if Sleeper can't be reached
		}

		return json(
			{ updated, source: 'DynastyProcess superflex values', players, picks, ages, teBoost, tePremium },
			{ headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' } }
		);
	} catch (err) {
		return json({ players: {}, picks: {}, message: String(err?.message || err) }, { status: 502, headers: { 'Cache-Control': 'public, s-maxage=300' } });
	}
}
