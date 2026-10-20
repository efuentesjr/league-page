/*
 * ============================================================
 * TRADE GRADES (pure calculation — no fetching)
 * ============================================================
 *
 * For every trade, each side's value = fantasy points its received
 * players scored IN ITS STARTING LINEUP, from the trade until that
 * player left the team (traded away or dropped).
 *
 * Draft picks stay "pending" until drafted; then the drafted player
 * is tracked the same way for the team that held the pick (if the
 * pick was flipped before the draft, that value belongs to the later
 * trade instead).
 *
 * Grades compare each side's share of the trade's total value and are
 * recalculated every time, so old trades keep aging.
 */

export const MIN_WEEKS = 3; // fewer game weeks since the trade = "Too early"

const GRADE_SCALE = [
	[0.75, 'A+'],
	[0.65, 'A'],
	[0.58, 'A-'],
	[0.53, 'B+'],
	[0.47, 'B'],
	[0.42, 'B-'],
	[0.35, 'C'],
	[0.25, 'D'],
	[0, 'F']
];

export const letterFor = (share) => GRADE_SCALE.find(([min]) => share >= min)[1];

// time key: season * 100 + week (or transaction leg)
const key = (season, week) => Number(season) * 100 + Number(week);

/**
 * @param {object} data
 * @param {Array} data.seasons [{
 *     season, leagueID,
 *     starters: { [week]: { [rosterID]: { [playerID]: points } } },   // starting lineups only
 *     transactions: [Sleeper transaction],                            // all types, this season
 *     rosters: [{ roster_id, owner_id, co_owners }],
 *     users: { [userID]: displayName },
 *     draft: null | { status, slotToRoster: {slot: rosterID}, picks: [{round, draft_slot, player_id}] }
 *   }]
 * @param {number} data.nowKey  key(currentSeason, currentWeek) — last week with games
 */
export const computeTradeGrades = ({ seasons, nowKey }) => {
	// ---------- index weekly starters ----------
	const starterWeeks = []; // [{ k, byRoster }]
	for (const s of seasons) {
		for (const [week, byRoster] of Object.entries(s.starters || {})) {
			const k = key(s.season, week);
			if (k > nowKey) continue;
			starterWeeks.push({ k, season: Number(s.season), byRoster });
		}
	}
	starterWeeks.sort((a, b) => a.k - b.k);

	// ---------- every completed transaction, in order ----------
	const allTx = [];
	for (const s of seasons) {
		for (const t of s.transactions || []) {
			if (t.status !== 'complete') continue;
			allTx.push({ ...t, _season: Number(s.season), _k: key(s.season, t.leg || 1) });
		}
	}
	allTx.sort((a, b) => a._k - b._k || (a.status_updated || 0) - (b.status_updated || 0));

	// when does a player leave a roster? (dropped or traded away)
	const exits = {};
	allTx.forEach((t, order) => {
		for (const [pid, rid] of Object.entries(t.drops || {})) {
			(exits[`${pid}|${rid}`] ??= []).push({ k: t._k, order });
		}
	});

	const exitAfter = (pid, rid, fromK, fromOrder) => {
		const list = exits[`${pid}|${rid}`] || [];
		const hit = list.find((e) => e.k > fromK || (e.k === fromK && e.order > fromOrder));
		return hit ? hit.k : Infinity;
	};

	/** starting-lineup points for player on roster between keys, split into checkpoints */
	const playerValue = (pid, rid, startK, endK, checkpoints) => {
		const out = { total: 0, weeks: 0, at: checkpoints.map(() => 0) };
		for (const wk of starterWeeks) {
			if (wk.k < startK) continue;
			if (wk.k > endK) break;
			const pts = wk.byRoster[rid]?.[pid];
			if (pts == null) continue;
			out.total += pts;
			out.weeks++;
			checkpoints.forEach((c, i) => {
				if (wk.k <= c) out.at[i] += pts;
			});
		}
		return out;
	};

	// ---------- drafts by season (to resolve picks) ----------
	const drafts = {};
	for (const s of seasons) if (s.draft) drafts[String(s.season)] = s.draft;

	const resolvePick = (pick) => {
		const draft = drafts[String(pick.season)];
		if (!draft || draft.status !== 'complete') return null;
		const slot = Object.keys(draft.slotToRoster || {}).find(
			(sl) => Number(draft.slotToRoster[sl]) === Number(pick.roster_id)
		);
		if (!slot) return null;
		const made = (draft.picks || []).find(
			(p) => Number(p.round) === Number(pick.round) && Number(p.draft_slot) === Number(slot)
		);
		return made?.player_id ? { playerID: String(made.player_id), slot: Number(slot) } : null;
	};

	// ---------- managers ----------
	const managersBySeasonRoster = {};
	const names = {};
	for (const s of seasons) {
		managersBySeasonRoster[s.season] = {};
		for (const r of s.rosters || []) {
			const ids = [r.owner_id, ...(r.co_owners || [])].filter(Boolean).map(String);
			managersBySeasonRoster[s.season][r.roster_id] = ids;
		}
		for (const [id, name] of Object.entries(s.users || {})) {
			if (!names[id]) names[id] = name; // newest season first wins
		}
	}

	// game weeks between two keys (for "Too early")
	const weeksBetween = (fromK, toK) => starterWeeks.filter((w) => w.k >= fromK && w.k <= toK).length;

	// ---------- grade every trade ----------
	const trades = [];
	allTx.forEach((t, order) => {
		if (t.type !== 'trade') return;

		const tradeK = t._k;
		const season = t._season;
		// checkpoints: ~1 month later, end of that season, today
		const monthK = (() => {
			const later = starterWeeks.filter((w) => w.k >= tradeK);
			return later[3]?.k ?? nowKey;
		})();
		const seasonEndK = key(season, 99);
		const checkpoints = [monthK, Math.min(seasonEndK, nowKey), nowKey];

		const sides = (t.roster_ids || []).map((rid) => {
			const assets = [];
			const sum = { total: 0, at: checkpoints.map(() => 0) };
			let pending = 0;

			for (const [pid, to] of Object.entries(t.adds || {})) {
				if (Number(to) !== Number(rid)) continue;
				const end = exitAfter(pid, rid, tradeK, order);
				const v = playerValue(pid, rid, tradeK, end, checkpoints);
				sum.total += v.total;
				v.at.forEach((x, i) => (sum.at[i] += x));
				assets.push({
					type: 'player',
					playerID: pid,
					points: Math.round(v.total * 10) / 10,
					starts: v.weeks,
					still: end === Infinity
				});
			}

			for (const pick of t.draft_picks || []) {
				if (Number(pick.owner_id) !== Number(rid)) continue;
				const made = resolvePick(pick);
				if (!made) {
					pending++;
					assets.push({ type: 'pick', season: pick.season, round: pick.round, from: pick.roster_id, pending: true });
					continue;
				}
				const draftK = key(pick.season, 0);
				const end = exitAfter(made.playerID, rid, draftK, -1);
				const v = playerValue(made.playerID, rid, draftK, end, checkpoints);
				sum.total += v.total;
				v.at.forEach((x, i) => (sum.at[i] += x));
				assets.push({
					type: 'pick',
					season: pick.season,
					round: pick.round,
					from: pick.roster_id,
					pending: false,
					playerID: made.playerID,
					points: Math.round(v.total * 10) / 10,
					starts: v.weeks,
					still: end === Infinity
				});
			}

			for (const b of t.waiver_budget || []) {
				if (Number(b.receiver) === Number(rid)) assets.push({ type: 'faab', amount: b.amount });
			}

			return {
				rosterID: Number(rid),
				managers: managersBySeasonRoster[season]?.[rid] || [],
				assets,
				pending,
				value: sum.total,
				at: sum.at
			};
		});

		const weeks = weeksBetween(tradeK, nowKey);
		// sides that can't be judged by points
		const onlyFaab = sides.map((side) => side.assets.length > 0 && side.assets.every((a) => a.type === 'faab'));
		const onlyPending = sides.map(
			(side) =>
				side.pending > 0 &&
				side.assets.every((a) => (a.type === 'pick' ? a.pending : a.type === 'faab'))
		);
		const faabDeal = onlyFaab.some(Boolean);
		const waitingOnPicks = onlyPending.some(Boolean);

		const gradeAt = (vals, enoughWeeks) => {
			const total = vals.reduce((a, b) => a + b, 0);
			return vals.map((v) => {
				if (faabDeal) return 'FAAB deal';
				if (waitingOnPicks) return 'Pending';
				if (!enoughWeeks) return 'Too early';
				if (total < 1) return 'Wash';
				return letterFor(v / total);
			});
		};

		const nowGrades = gradeAt(sides.map((s) => s.value), weeks >= MIN_WEEKS);
		const history = checkpoints.map((c, ci) => ({
			label: ['1 month', 'End of season', 'Today'][ci],
			grades: gradeAt(
				sides.map((s) => s.at[ci]),
				weeksBetween(tradeK, c) >= MIN_WEEKS
			)
		}));
		const total = sides.reduce((a, s) => a + s.value, 0);

		trades.push({
			id: String(t.transaction_id),
			season,
			week: Number(t.leg || 1),
			timestamp: t.status_updated,
			weeks,
			total: Math.round(total * 10) / 10,
			sides: sides.map((s, i) => ({
				rosterID: s.rosterID,
				managers: s.managers,
				assets: s.assets,
				pending: s.pending,
				value: Math.round(s.value * 10) / 10,
				share: total > 0 ? s.value / total : null,
				grade: nowGrades[i]
			})),
			// drop the "End of season" checkpoint when it's the same as today
			history: history.filter((h, i) => !(i === 1 && checkpoints[1] === nowKey))
		});
	});

	trades.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

	// ---------- manager trading records ----------
	const managers = {};
	for (const tr of trades) {
		// only settled trades count toward records
		const graded = tr.sides.every((s) => !['Too early', 'Pending', 'Wash', 'FAAB deal'].includes(s.grade));
		for (const side of tr.sides) {
			const others = tr.sides.filter((o) => o !== side);
			const otherAvg = others.reduce((a, o) => a + o.value, 0) / Math.max(1, others.length);
			for (const m of side.managers) {
				const rec = (managers[m] ??= { name: names[m] || 'Unknown', trades: 0, won: 0, lost: 0, even: 0, net: 0 });
				rec.trades++;
				if (!graded) continue;
				rec.net += side.value - otherAvg;
				if (side.share > 0.53) rec.won++;
				else if (side.share < 0.47) rec.lost++;
				else rec.even++;
			}
		}
	}
	for (const m of Object.values(managers)) m.net = Math.round(m.net * 10) / 10;

	return { trades, managers };
};
