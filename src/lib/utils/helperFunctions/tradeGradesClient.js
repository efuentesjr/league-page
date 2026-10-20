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
