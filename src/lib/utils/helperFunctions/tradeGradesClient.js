/*
 * Loads /api/trade_grades once per page load (it's cached on Vercel's
 * CDN, so this is fast) and indexes trades by transaction ID.
 */
let gradesPromise = null;

export const getTradeGrades = () => {
	if (!gradesPromise) {
		gradesPromise = fetch('/api/trade_grades')
			.then((res) => {
				if (!res.ok) throw new Error(`trade grades ${res.status}`);
				return res.json();
			})
			.then((data) => ({
				...data,
				byID: Object.fromEntries((data.trades || []).map((t) => [String(t.id), t]))
			}))
			.catch((err) => {
				gradesPromise = null;
				throw err;
			});
	}
	return gradesPromise;
};

/** color family for a grade badge */
export const gradeTone = (grade) => {
	if (!grade) return 'muted';
	if (grade.startsWith('A')) return 'great';
	if (grade.startsWith('B')) return 'good';
	if (grade === 'C' || grade === 'D') return 'meh';
	if (grade === 'F') return 'bad';
	return 'muted'; // Too early, Pending, Wash, FAAB deal
};

/*
 * When a trade happened. Sleeper files every offseason trade under "week 1" of
 * the new season, so trades made before that season's Week 1 kickoff (the
 * Thursday after Labor Day) are labeled "Offseason" with their real date.
 */
const kickoff = (season) => {
	const d = new Date(Number(season), 8, 1); // Sept 1
	while (d.getDay() !== 1) d.setDate(d.getDate() + 1); // Labor Day (first Monday)
	d.setDate(d.getDate() + 3); // Thursday opener
	return d.getTime();
};

export const tradeDate = (t) =>
	t?.timestamp
		? new Date(Number(t.timestamp)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'America/Chicago' })
		: null;

export const isOffseasonTrade = (t) => !!t?.timestamp && Number(t.week || 1) <= 1 && Number(t.timestamp) < kickoff(t.season);

/** "Mar 14, 2023 · Offseason" or "Oct 2, 2023 · Week 5" */
export const tradeWhen = (t) => {
	const date = tradeDate(t);
	if (!date) return `${t.season} · Week ${t.week}`;
	return isOffseasonTrade(t) ? `${date} · Offseason` : `${date} · Week ${t.week}`;
};
