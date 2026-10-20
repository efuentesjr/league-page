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

/*
 * "Follow the asset": when a team re-trades something it received, the
 * original trade is credited with (a fair share of) what it got back.
 *  - players: only if re-traded within FLIP_WEEKS game weeks of arriving
 *  - picks: always (a pick never scores while you hold it)
 *  - chains are followed up to MAX_FLIP_DEPTH trades deep
 *  - dropped players are never followed
 */
export const FLIP_WEEKS = 4;
const MAX_FLIP_DEPTH = 3;

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

// negative points (defenses, kickers) can push a share below 0: that's an F
export const letterFor = (share) => {
	const x = Number.isFinite(share) ? share : 0;
	return (GRADE_SCALE.find(([min]) => x >= min) || GRADE_SCALE[GRADE_SCALE.length - 1])[1];
};

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
export const computeTradeGrades = ({ seasons, nowKey, overrides = {} }) => {
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
	// where did each draft pick go? key season|round|original roster
	const pickMoves = {};
	allTx.forEach((t, order) => {
		for (const [pid, rid] of Object.entries(t.drops || {})) {
			(exits[`${pid}|${rid}`] ??= []).push({ k: t._k, order, tx: t });
		}
		if (t.type === 'trade') {
			for (const dp of t.draft_picks || []) {
				(pickMoves[`${dp.season}|${dp.round}|${dp.roster_id}`] ??= []).push({
					k: t._k,
					order,
					tx: t,
					from: Number(dp.previous_owner_id),
					to: Number(dp.owner_id)
				});
			}
		}
	});

	const nextExit = (pid, rid, fromK, fromOrder) => {
		const list = exits[`${pid}|${rid}`] || [];
		return list.find((e) => e.k > fromK || (e.k === fromK && e.order > fromOrder)) || null;
	};

	const nextPickMove = (dp, rid, fromOrder) =>
		(pickMoves[`${dp.season}|${dp.round}|${dp.roster_id}`] || []).find(
			(m) => m.order > fromOrder && m.from === Number(rid)
		) || null;

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

	// ---------- asset valuation (with follow-the-asset) ----------
	const orderOf = new Map(allTx.map((t, i) => [t, i]));
	const followedSent = {}; // `${tradeID}|${rosterID}` -> Set of followed sent assets
	const followedFrom = {}; // `${tradeID}|${rosterID}` -> Set of earlier trade IDs that followed into it
	let rootTradeID = null;

	const correctedRound = (tx, dp) => {
		const fix = overrides[String(tx.transaction_id)]?.picks?.find(
			(p) =>
				String(p.season) === String(dp.season) &&
				Number(p.originalOwner) === Number(dp.roster_id) &&
				Number(p.fromRound) === Number(dp.round)
		);
		return fix ? { round: fix.toRound, changedFrom: fix.fromRound } : { round: dp.round, changedFrom: null };
	};

	// what a team sent in a trade (players to other teams + picks), for fair shares
	const sentAssets = (tx, rid) => {
		const out = [];
		for (const [pid, from] of Object.entries(tx.drops || {})) {
			if (Number(from) === Number(rid) && tx.adds?.[pid] != null && Number(tx.adds[pid]) !== Number(rid)) {
				out.push(`p:${pid}`);
			}
		}
		for (const dp of tx.draft_picks || []) {
			if (Number(dp.previous_owner_id) === Number(rid)) out.push(`k:${dp.season}|${dp.round}|${dp.roster_id}`);
		}
		return out;
	};

	const round1 = (x) => Math.round(x * 10) / 10;

	/** value of everything `rid` received in `tx`, times `share` */
	const evalFlip = (tx, rid, sentKey, cps, depth) => {
		const order = orderOf.get(tx);
		const sent = sentAssets(tx, rid);
		const share = sent.length ? 1 / sent.length : 1;
		const id = `${tx.transaction_id}|${rid}`;
		(followedSent[id] ??= new Set()).add(sentKey);
		if (rootTradeID && String(rootTradeID) !== String(tx.transaction_id)) {
			(followedFrom[id] ??= new Set()).add(rootTradeID);
		}

		const received = [];
		for (const [pid, to] of Object.entries(tx.adds || {})) {
			if (Number(to) === Number(rid)) received.push(evalPlayer(pid, rid, tx._k, order, cps, depth));
		}
		for (const dp of tx.draft_picks || []) {
			if (Number(dp.owner_id) === Number(rid)) received.push(evalPick(tx, dp, rid, order, cps, depth));
		}
		for (const b of tx.waiver_budget || []) {
			if (Number(b.receiver) === Number(rid)) received.push({ type: 'faab', amount: b.amount, total: 0, at: cps.map(() => 0) });
		}

		const total = received.reduce((t, r) => t + r.total, 0) * share;
		const at = cps.map((_, i) => received.reduce((t, r) => t + r.at[i], 0) * share);
		return {
			total,
			at,
			pending: received.some((r) => r.pending),
			resolved: received.some((r) => r.resolved),
			summary: {
				tradeID: String(tx.transaction_id),
				season: tx._season,
				week: Number(tx.leg || 1),
				to: (tx.roster_ids || []).map(Number).filter((r) => r !== Number(rid)),
				share: round1(share * 100) / 100,
				received: received.map(describe)
			}
		};
	};

	const describe = (r) => {
		const base = { type: r.type, points: round1(r.total) };
		if (r.type === 'player') return { ...base, playerID: r.playerID, flip: r.flip || null };
		if (r.type === 'pick')
			return { ...base, season: r.season, round: r.round, pending: r.pending && !r.resolved, playerID: r.playerID || null, flip: r.flip || null };
		return { type: 'faab', amount: r.amount };
	};

	/** a player `rid` got at (acqK, acqOrder) */
	const evalPlayer = (pid, rid, acqK, acqOrder, cps, depth) => {
		const exit = nextExit(pid, rid, acqK, acqOrder);
		const v = playerValue(pid, rid, acqK, exit ? exit.k : Infinity, cps);
		const out = {
			type: 'player',
			playerID: pid,
			total: v.total,
			at: v.at,
			held: v.total,
			starts: v.weeks,
			still: !exit,
			pending: false,
			resolved: true,
			flip: null
		};
		if (exit && exit.tx.type === 'trade' && depth < MAX_FLIP_DEPTH) {
			const heldWeeks = starterWeeks.filter((w) => w.k >= acqK && w.k < exit.k).length;
			if (heldWeeks <= FLIP_WEEKS) {
				const f = evalFlip(exit.tx, rid, `p:${pid}`, cps, depth + 1);
				out.total += f.total;
				f.at.forEach((x, i) => (out.at[i] += x));
				out.pending = f.pending;
				out.resolved = f.resolved || v.total > 0;
				out.flip = f.summary;
			}
		}
		return out;
	};

	/** a draft pick `rid` got in `tx` */
	const evalPick = (tx, dp, rid, acqOrder, cps, depth) => {
		const { round, changedFrom } = correctedRound(tx, dp);
		const out = {
			type: 'pick',
			season: dp.season,
			round,
			changedFrom,
			from: dp.roster_id,
			total: 0,
			at: cps.map(() => 0),
			pending: false,
			resolved: false,
			playerID: null,
			flip: null
		};

		// traded away before it was used: always follow
		const move = nextPickMove(dp, rid, acqOrder);
		if (move) {
			if (depth < MAX_FLIP_DEPTH) {
				const f = evalFlip(move.tx, rid, `k:${dp.season}|${dp.round}|${dp.roster_id}`, cps, depth + 1);
				Object.assign(out, { total: f.total, at: f.at, pending: f.pending, resolved: f.resolved, flip: f.summary });
			}
			return out;
		}

		const made = resolvePick({ ...dp, round });
		if (!made) {
			out.pending = true;
			return out;
		}
		const pv = evalPlayer(made.playerID, rid, key(dp.season, 0), -1, cps, depth);
		Object.assign(out, {
			total: pv.total,
			at: pv.at,
			playerID: made.playerID,
			starts: pv.starts,
			still: pv.still,
			pending: pv.pending,
			resolved: true,
			flip: pv.flip
		});
		return out;
	};

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

		rootTradeID = String(t.transaction_id);
		const sides = (t.roster_ids || []).map((rid) => {
			const evaluated = [];
			for (const [pid, to] of Object.entries(t.adds || {})) {
				if (Number(to) === Number(rid)) evaluated.push(evalPlayer(pid, rid, tradeK, order, checkpoints, 0));
			}
			for (const dp of t.draft_picks || []) {
				if (Number(dp.owner_id) === Number(rid)) evaluated.push(evalPick(t, dp, rid, order, checkpoints, 0));
			}
			for (const b of t.waiver_budget || []) {
				if (Number(b.receiver) === Number(rid)) {
					evaluated.push({ type: 'faab', amount: b.amount, total: 0, at: checkpoints.map(() => 0), pending: false, resolved: false });
				}
			}

			const assets = evaluated.map((a) => {
				if (a.type === 'faab') return { type: 'faab', amount: a.amount };
				const common = {
					points: round1(a.total),
					starts: a.starts ?? 0,
					still: a.still ?? false,
					flip: a.flip
				};
				if (a.type === 'player') {
					return { type: 'player', playerID: a.playerID, held: round1(a.held), ...common };
				}
				return {
					type: 'pick',
					season: a.season,
					round: a.round,
					changedFrom: a.changedFrom,
					from: a.from,
					pending: a.pending && !a.resolved,
					playerID: a.playerID,
					...common
				};
			});

			const valued = evaluated.filter((a) => a.type !== 'faab');
			return {
				rosterID: Number(rid),
				managers: managersBySeasonRoster[season]?.[rid] || [],
				assets,
				pending: valued.filter((a) => a.pending && !a.resolved).length,
				onlyPending: valued.length > 0 && valued.some((a) => a.pending) && !valued.some((a) => a.resolved),
				value: valued.reduce((x, a) => x + a.total, 0),
				at: checkpoints.map((_, i) => valued.reduce((x, a) => x + a.at[i], 0))
			};
		});

		const weeks = weeksBetween(tradeK, nowKey);
		// sides that can't be judged by points
		const onlyFaab = sides.map((side) => side.assets.length > 0 && side.assets.every((a) => a.type === 'faab'));
		const onlyPending = sides.map((side) => side.onlyPending);
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
			conditional: !!overrides[String(t.transaction_id)]?.conditional,
			note: overrides[String(t.transaction_id)]?.note || null,
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

	// a side whose every sent asset was followed from an earlier trade is a
	// continuation of that trade: show it, but don't count it twice in records
	const txByID = new Map(allTx.map((t) => [String(t.transaction_id), t]));
	for (const tr of trades) {
		const tx = txByID.get(tr.id);
		for (const side of tr.sides) {
			const id = `${tr.id}|${side.rosterID}`;
			const sent = sentAssets(tx, side.rosterID);
			const followed = followedSent[id];
			const earlier = followedFrom[id] ? [...followedFrom[id]] : [];
			side.continues = earlier;
			side.countsInRecords = !(sent.length > 0 && earlier.length > 0 && followed && sent.every((k) => followed.has(k)));
		}
	}

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
				if (!side.countsInRecords) continue; // counted in the earlier trade it continues
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
