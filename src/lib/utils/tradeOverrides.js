/*
 * ============================================================
 * TRADE CORRECTIONS
 * ============================================================
 * Fixes for trades where Sleeper's record doesn't match what the
 * league actually agreed (conditional picks, commissioner changes).
 * Keyed by Sleeper transaction ID. Applied to the trade cards, the
 * trade grades and the report card.
 *
 *  conditional: true      shows a "Conditional" tag
 *  note:                  short explanation shown with the trade
 *  picks: [{ season, originalOwner, fromRound, toRound }]
 *                         a pick in the trade that actually changed
 *                         round (originalOwner = roster ID whose pick it is)
 */
export const TRADE_OVERRIDES = {
	// 2025 week 7: Brute Force Attack gets Tyrod Taylor, Bay Area Party Supplies gets BFA's 2027 pick
	'1286888060390211584': {
		conditional: true,
		note: "Conditional trade: the 2027 1st-round pick was changed to a 2027 3rd-round pick.",
		picks: [{ season: '2027', originalOwner: 1, fromRound: 1, toRound: 3 }]
	}
};

/** returns the pick's corrected round (and what it was) for a trade */
export const correctedPick = (transactionID, { season, round, roster_id }) => {
	const fix = TRADE_OVERRIDES[String(transactionID)]?.picks?.find(
		(p) =>
			String(p.season) === String(season) &&
			Number(p.originalOwner) === Number(roster_id) &&
			Number(p.fromRound) === Number(round)
	);
	return fix ? { round: fix.toRound, changedFrom: fix.fromRound } : { round, changedFrom: null };
};
