<!--
	Trade Partners
	Who trades with whom (grid + partnerships), with commissioner-only
	tools that flag patterns worth a closer look for collusion.
-->
<script>
	import { onMount } from 'svelte';
	import LinearProgress from '@smui/linear-progress';
	import { getLeagueTeamManagers, loadPlayers, waitForAll, gotoManager } from '$lib/utils/helper';
	import { getTradeGrades, gradeTone, tradeWhen } from '$lib/utils/helperFunctions/tradeGradesClient';
	import { getManagerHistory } from '$lib/utils/helperFunctions/managerInsights';
	import { GHOST_MANAGERS } from '$lib/utils/helperFunctions/playoffRounds';

	// ---- flag thresholds (tune here) ----
	const FREQ_SEASON = 3; // trades between one pair in a season
	const SHARE_MIN_TRADES = 3; // a manager needs this many trades in a season...
	const SHARE_PCT = 0.4; // ...and this share with one partner
	const ONEWAY_MIN = 2; // graded trades between a pair, all won by the same side
	const ONEWAY_EDGE = 100; // combined points edge
	const LOPSIDED_SHARE = 0.9; // one side got this share of a trade's value
	const LOPSIDED_MARGIN = 150; // ...by at least this many points (hindsight, so low priority)
	const BOOMERANG_DAYS = 365;
	const DUMP_SELLER_PCT = 0.35; // seller's win % at the time (min 4 games)
	const DUMP_BUYER_PCT = 0.5;

	let state = 'loading';
	let data = null;
	let ltm = null;
	let players = {};
	let history = null;
	let seasonFilter = 'all';
	let selectedPair = null;

	// commissioner tools
	let commish = false;
	let showUnlock = false;
	let codeInput = '';
	let unlockError = '';
	let unlocking = false;
	let showLow = false;

	onMount(async () => {
		try {
			const [grades, teamManagers, playerData] = await waitForAll(getTradeGrades(), getLeagueTeamManagers(), loadPlayers(null));
			data = grades;
			ltm = teamManagers;
			players = playerData.players || {};
			state = 'ready';
		} catch (err) {
			console.error('[Trade Partners] Could not load:', err);
			state = 'error';
		}
		try {
			const saved = localStorage.getItem('bioCode:commissioner');
			if (saved) await unlock(saved, true);
		} catch {
			/* private mode */
		}
	});

	const unlock = async (code, silent = false) => {
		unlocking = true;
		unlockError = '';
		try {
			const res = await fetch('/api/commish', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ code })
			});
			if (!res.ok) throw new Error('That code is not the commissioner code.');
			commish = true;
			showUnlock = false;
			try {
				localStorage.setItem('bioCode:commissioner', String(code).trim());
			} catch {
				/* ignore */
			}
			if (!history) getManagerHistory().then((h) => (history = h)).catch(() => {});
		} catch (err) {
			if (!silent) unlockError = err.message;
		}
		unlocking = false;
	};

	const lock = () => {
		commish = false;
		try {
			localStorage.removeItem('bioCode:commissioner');
		} catch {
			/* ignore */
		}
	};

	// ---------- names ----------
	const managerName = (id) => ltm?.users?.[id]?.display_name || data?.managers?.[id]?.name || GHOST_MANAGERS[id] || 'Former manager';
	const managerAvatar = (id) => (ltm?.users?.[id]?.avatar ? `https://sleepercdn.com/avatars/thumbs/${ltm.users[id].avatar}` : '/managers/question.jpg');
	const isFormer = (id) => {
		const cur = ltm?.teamManagersMap?.[ltm?.currentSeason] || {};
		return !Object.values(cur).some((t) => (t.managers || []).includes(id));
	};
	const playerName = (id) => {
		const p = players[id];
		return p ? `${p.fn} ${p.ln}` : 'Unknown player';
	};
	const assetText = (a) => {
		if (a.type === 'player') return playerName(a.playerID);
		if (a.type === 'pick') return `${a.season} R${a.round} pick${a.pending ? '' : a.playerID ? ` → ${playerName(a.playerID)}` : ''}`;
		return `$${a.amount} FAAB`;
	};
	const sideManager = (side) => String(side.managers?.[0] ?? `r${side.rosterID}`);
	const pairKey = (a, b) => (a < b ? `${a}|${b}` : `${b}|${a}`);
	const isSettled = (t) => t.sides.every((s) => !['Too early', 'Pending', 'Wash', 'FAAB deal'].includes(s.grade));
	const when = (t) => tradeWhen(t);
	const signed = (v) => `${v > 0 ? '+' : ''}${Math.round(v)}`;

	// ---------- partnerships ----------
	$: seasons = data ? [...new Set(data.trades.map((t) => t.season))].sort((a, b) => b - a) : [];
	$: shown = data ? data.trades.filter((t) => seasonFilter === 'all' || t.season === seasonFilter) : [];

	$: pairs = (() => {
		const map = {};
		for (const t of shown) {
			const sides = t.sides;
			for (let i = 0; i < sides.length; i++) {
				for (let j = i + 1; j < sides.length; j++) {
					const a = sideManager(sides[i]), b = sideManager(sides[j]);
					if (a === b) continue;
					const k = pairKey(a, b);
					const p = (map[k] ??= { key: k, a: k.split('|')[0], b: k.split('|')[1], trades: [], settled: 0, edge: 0, winsA: 0, winsB: 0 });
					p.trades.push(t);
					if (isSettled(t)) {
						const sa = sideManager(sides[i]) === p.a ? sides[i] : sides[j];
						const sb = sa === sides[i] ? sides[j] : sides[i];
						p.settled++;
						p.edge += sa.value - sb.value; // + means A came out ahead
						if (sa.share > 0.53) p.winsA++;
						else if (sb.share > 0.53) p.winsB++;
					}
				}
			}
		}
		return Object.values(map).sort((x, y) => y.trades.length - x.trades.length || Math.abs(y.edge) - Math.abs(x.edge));
	})();

	$: tradeCount = (() => {
		const c = {};
		for (const t of shown) for (const s of t.sides) c[sideManager(s)] = (c[sideManager(s)] || 0) + 1;
		return c;
	})();

	// grid: managers who traded in this period, current managers first
	$: gridManagers = Object.keys(tradeCount).sort((x, y) => isFormer(x) - isFormer(y) || tradeCount[y] - tradeCount[x]);
	$: pairByKey = Object.fromEntries(pairs.map((p) => [p.key, p]));
	$: maxPair = Math.max(1, ...pairs.map((p) => p.trades.length));

	$: favorite = (() => {
		const fav = {};
		for (const p of pairs) {
			for (const [me, them] of [[p.a, p.b], [p.b, p.a]]) {
				if (!fav[me] || p.trades.length > fav[me].count) fav[me] = { partner: them, count: p.trades.length };
			}
		}
		return fav;
	})();

	$: selected = selectedPair ? pairByKey[selectedPair] : null;
	const choose = (k) => {
		selectedPair = selectedPair === k ? null : k;
		if (selectedPair) setTimeout(() => document.getElementById('pairDetail')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30);
	};

	// ---------- commissioner flags ----------
	const recordAt = (managerID, season, week) => {
		const games = (history?.timeline?.[managerID] || []).filter((g) => !g.playoff && Number(g.year) === Number(season) && g.week < week);
		const w = games.filter((g) => g.r === 'W').length + games.filter((g) => g.r === 'T').length / 2;
		return { games: games.length, pct: games.length ? w / games.length : null, w: games.filter((g) => g.r === 'W').length, l: games.filter((g) => g.r === 'L').length };
	};

	$: flags = commish && data ? buildFlags(shown, pairs, history) : [];

	const buildFlags = (trades, pairList, hist) => {
		const out = [];
		// 1. frequent partners in a season
		const bySeason = {};
		for (const t of trades) {
			for (let i = 0; i < t.sides.length; i++) {
				for (let j = i + 1; j < t.sides.length; j++) {
					const k = pairKey(sideManager(t.sides[i]), sideManager(t.sides[j]));
					((bySeason[t.season] ??= {})[k] ??= []).push(t);
				}
			}
		}
		for (const [season, map] of Object.entries(bySeason)) {
			const perManager = {};
			for (const [k, list] of Object.entries(map)) {
				const [a, b] = k.split('|');
				perManager[a] = (perManager[a] || 0) + list.length;
				perManager[b] = (perManager[b] || 0) + list.length;
				if (list.length >= FREQ_SEASON) {
					out.push({ level: 'medium', type: 'Frequent partners', pair: k, text: `${managerName(a)} and ${managerName(b)} traded ${list.length} times in ${season}.` });
				}
			}
			for (const [k, list] of Object.entries(map)) {
				const [a, b] = k.split('|');
				for (const [me, them] of [[a, b], [b, a]]) {
					const total = perManager[me];
					if (total >= SHARE_MIN_TRADES && list.length >= 2 && list.length / total > SHARE_PCT && list.length < FREQ_SEASON) {
						out.push({ level: 'low', type: 'Go-to partner', pair: k, text: `${Math.round((list.length / total) * 100)}% of ${managerName(me)}'s ${season} trades (${list.length} of ${total}) were with ${managerName(them)}.` });
					}
				}
			}
		}
		// 2. one-way value across a pair's graded trades
		for (const p of pairList) {
			if (p.settled >= ONEWAY_MIN && Math.abs(p.edge) >= ONEWAY_EDGE && (p.winsA === p.settled || p.winsB === p.settled)) {
				const [win, lose] = p.edge > 0 ? [p.a, p.b] : [p.b, p.a];
				out.push({ level: 'high', type: 'One-way value', pair: p.key, text: `${managerName(win)} has won all ${p.settled} graded trades with ${managerName(lose)} (${signed(Math.abs(p.edge))} pts combined).` });
			}
		}
		// 3. single lopsided result
		for (const t of trades) {
			if (!isSettled(t) || t.sides.length !== 2) continue;
			const [hi, lo] = [...t.sides].sort((x, y) => y.value - x.value);
			if (hi.share >= LOPSIDED_SHARE && hi.value - lo.value >= LOPSIDED_MARGIN) {
				out.push({ level: 'low', type: 'Lopsided result', pair: pairKey(sideManager(hi), sideManager(lo)), trade: t.id, text: `${when(t)}: ${managerName(sideManager(hi))} got ${Math.round(hi.share * 100)}% of the value from ${managerName(sideManager(lo))} (${signed(hi.value - lo.value)} pts).` });
			}
		}
		// 4. boomerang: same player sent back to his original team
		const moves = [];
		for (const t of trades) {
			if (t.sides.length < 2) continue;
			for (const s of t.sides) {
				for (const a of s.assets) {
					if (a.type !== 'player') continue;
					const from = t.sides.find((o) => o !== s && t.sides.length === 2) || null;
					if (from) moves.push({ pid: a.playerID, to: sideManager(s), from: sideManager(from), t });
				}
			}
		}
		moves.sort((x, y) => (x.t.timestamp || 0) - (y.t.timestamp || 0));
		const boomerangs = {};
		for (let i = 0; i < moves.length; i++) {
			for (let j = i + 1; j < moves.length; j++) {
				const m1 = moves[i], m2 = moves[j];
				if (m1.pid !== m2.pid || m2.from !== m1.to || m2.to !== m1.from) continue;
				const days = ((m2.t.timestamp || 0) - (m1.t.timestamp || 0)) / 86400000;
				if (days >= 0 && days <= BOOMERANG_DAYS) {
					const g = (boomerangs[`${m1.t.id}>${m2.t.id}|${m1.from}>${m1.to}`] ??= { m1, m2, days, names: [] });
					g.names.push(playerName(m1.pid));
				}
				break;
			}
		}
		// a same-day swap-back is an undone trade; don't also flag the redo that follows it
		const undoIDs = new Set(Object.values(boomerangs).filter((g) => g.days < 1).map((g) => g.m2.t.id));
		const seenUndo = new Set();
		for (const g of Object.values(boomerangs)) {
			if (undoIDs.has(g.m1.t.id)) continue;
			const sameDay = g.days < 1;
			if (sameDay) {
				const k = `${g.m1.t.id}>${g.m2.t.id}`;
				if (seenUndo.has(k)) continue;
				seenUndo.add(k);
				g.names = Object.values(boomerangs).filter((x) => `${x.m1.t.id}>${x.m2.t.id}` === k).flatMap((x) => x.names);
			}
			out.push({
				level: 'high',
				type: sameDay ? 'Undone trade' : 'Boomerang',
				pair: pairKey(g.m1.from, g.m1.to),
				trade: g.m2.t.id,
				text: sameDay
					? `${managerName(g.m1.from)} and ${managerName(g.m1.to)} traded ${g.names.join(', ')} and swapped back the same day (${when(g.m1.t)}).`
					: `${g.names.join(', ')} went ${managerName(g.m1.from)} → ${managerName(g.m1.to)} (${when(g.m1.t)}) and back (${when(g.m2.t)}), ${Math.round(g.days)} days apart.`
			});
		}
		// 5. dumping: a struggling team sends players to a winning team for picks/FAAB only
		// 6. thin return: players out, only FAAB or late picks back
		for (const t of trades) {
			if (t.sides.length !== 2) continue;
			for (const [buyer, seller] of [[t.sides[0], t.sides[1]], [t.sides[1], t.sides[0]]]) {
				const buyerGotPlayers = buyer.assets.some((a) => a.type === 'player');
				const sellerGotPlayers = seller.assets.some((a) => a.type === 'player');
				if (!buyerGotPlayers || sellerGotPlayers) continue;
				const sellerAssets = seller.assets;
				const thin = sellerAssets.length === 0 || sellerAssets.every((a) => (a.type === 'faab' && a.amount <= 50) || (a.type === 'pick' && a.round >= 4));
				if (hist && t.week >= 5) {
					const rs = recordAt(sideManager(seller), t.season, t.week);
					const rb = recordAt(sideManager(buyer), t.season, t.week);
					if (rs.games >= 4 && rs.pct <= DUMP_SELLER_PCT && rb.pct != null && rb.pct >= DUMP_BUYER_PCT) {
						out.push({ level: 'high', type: 'Possible dump', pair: pairKey(sideManager(buyer), sideManager(seller)), trade: t.id, text: `${when(t)}: ${managerName(sideManager(seller))} (${rs.w}–${rs.l}) sent ${buyer.assets.filter((a) => a.type === 'player').map((a) => playerName(a.playerID)).join(', ')} to ${managerName(sideManager(buyer))} (${rb.w}–${rb.l}) for picks/FAAB only.` });
						continue;
					}
				}
				if (thin) {
					out.push({ level: 'low', type: 'Thin return', pair: pairKey(sideManager(buyer), sideManager(seller)), trade: t.id, text: `${when(t)}: ${managerName(sideManager(seller))} sent ${buyer.assets.filter((a) => a.type === 'player').map((a) => playerName(a.playerID)).join(', ')} for ${sellerAssets.length ? sellerAssets.map(assetText).join(', ') : 'nothing'}.` });
				}
			}
		}
		const rank = { high: 0, medium: 1, low: 2 };
		return out.sort((x, y) => rank[x.level] - rank[y.level]);
	};

	$: flagCount = (() => {
		const c = {};
		for (const f of flags) if (f.pair) c[f.pair] = (c[f.pair] || 0) + 1;
		return c;
	})();
	$: highCount = flags.filter((f) => f.level === 'high').length;
</script>

<section class="wrap">
	<header class="head">
		<div>
			<h1>Trade Partners</h1>
			<div class="sub">Who trades with whom, every trade since the league began. Tap a square or a partnership to see the deals.</div>
		</div>
		{#if state === 'ready'}
			<div class="stats">
				<div class="stat"><strong>{shown.length}</strong><span>Trades</span></div>
				<div class="stat"><strong>{pairs.length}</strong><span>Partnerships</span></div>
				{#if pairs[0]}
					<div class="stat" style="--tone: #d9a62e"><strong>{pairs[0].trades.length}</strong><span>Most with one partner</span></div>
				{/if}
			</div>
		{/if}
	</header>

	{#if state === 'loading'}
		<div class="loading"><p>Loading every trade…</p><LinearProgress indeterminate /></div>
	{:else if state === 'error'}
		<p class="loading">Could not load trades. Refresh to try again.</p>
	{:else}
		<div class="toolbar">
			<div class="chips" role="tablist" aria-label="Season">
				<button type="button" class="chip" class:active={seasonFilter === 'all'} onclick={() => { seasonFilter = 'all'; selectedPair = null; }}>All-time</button>
				{#each seasons as s}
					<button type="button" class="chip" class:active={seasonFilter === s} onclick={() => { seasonFilter = s; selectedPair = null; }}>{s}</button>
				{/each}
			</div>
			{#if commish}
				<button type="button" class="commishBtn on" onclick={lock}>Commissioner tools on · Lock</button>
			{:else}
				<button type="button" class="commishBtn" onclick={() => (showUnlock = !showUnlock)}>Commissioner tools</button>
			{/if}
		</div>

		{#if showUnlock && !commish}
			<form class="unlock" onsubmit={(e) => { e.preventDefault(); unlock(codeInput); }}>
				<input type="password" autocomplete="off" placeholder="Commissioner code" bind:value={codeInput} />
				<button type="submit" disabled={unlocking}>{unlocking ? 'Checking…' : 'Unlock'}</button>
				{#if unlockError}<span class="err">{unlockError}</span>{/if}
			</form>
		{/if}

		{#if commish}
			<div class="panel watch">
				<div class="panelHead"><span>Trade Watch</span><small>{flags.length} flag{flags.length === 1 ? '' : 's'}{highCount ? ` · ${highCount} high` : ''} · commissioner only</small></div>
				<p class="watchNote">
					Patterns worth a closer look, not proof of anything. Points-based checks only count trades that have been graded
					(at least 3 weeks old, picks used).{history ? '' : ' Loading game records for the dump check…'}
				</p>
				{#if flags.length}
					<div class="flags">
						{#each flags.filter((f) => showLow || f.level !== 'low') as f}
							<button type="button" class="flag {f.level}" onclick={() => f.pair && choose(f.pair)}>
								<span class="lvl">{f.level}</span>
								<span class="ftype">{f.type}</span>
								<span class="ftext">{f.text}</span>
							</button>
						{/each}
					</div>
					{#if flags.some((f) => f.level === 'low')}
						<button type="button" class="moreBtn" onclick={() => (showLow = !showLow)}>
							{showLow ? 'Hide' : 'Show'} {flags.filter((f) => f.level === 'low').length} lower-priority flags
						</button>
					{/if}
				{:else}
					<p class="empty">Nothing flagged for this period.</p>
				{/if}
			</div>
		{/if}

		<div class="cols">
			<div class="panel gridPanel">
				<div class="panelHead"><span>Who trades with whom</span><small>number of trades</small></div>
				<div class="gridScroll">
					<table class="grid" style="--n: {gridManagers.length}">
						<thead>
							<tr>
								<th></th>
								{#each gridManagers as m}
									<th title={managerName(m)}><img class="gAv" class:former={isFormer(m)} src={managerAvatar(m)} alt={managerName(m)} /></th>
								{/each}
							</tr>
						</thead>
						<tbody>
							{#each gridManagers as row}
								<tr>
									<th class="rowHead" title={managerName(row)}>
										<img class="gAv" class:former={isFormer(row)} src={managerAvatar(row)} alt="" />
										<span>{managerName(row)}</span>
									</th>
									{#each gridManagers as col}
										{@const p = row === col ? null : pairByKey[pairKey(row, col)]}
										{#if row === col}
											<td class="self"></td>
										{:else if p}
											<td>
												<button
													type="button"
													class="cell"
													class:sel={selectedPair === p.key}
													class:flagged={commish && flagCount[p.key]}
													style="--heat: {p.trades.length / maxPair}"
													title="{managerName(row)} & {managerName(col)}: {p.trades.length} trade{p.trades.length === 1 ? '' : 's'}"
													onclick={() => choose(p.key)}
												>{p.trades.length}</button>
											</td>
										{:else}
											<td class="none"></td>
										{/if}
									{/each}
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
				<p class="gridNote">Dimmed faces are former managers.{commish ? ' Red outline = flagged pair.' : ''}</p>
			</div>

			<div class="panel">
				<div class="panelHead"><span>Top partnerships</span><small>net edge = graded points</small></div>
				{#each pairs.slice(0, 15) as p (p.key)}
					<button type="button" class="pairRow" class:sel={selectedPair === p.key} onclick={() => choose(p.key)}>
						<span class="duo">
							<img src={managerAvatar(p.a)} alt="" /><img src={managerAvatar(p.b)} alt="" />
						</span>
						<span class="pairNames">
							<span>{managerName(p.a)} &amp; {managerName(p.b)}</span>
							<small>
								{#if p.settled}
									{Math.abs(p.edge) < 20 ? 'Even overall' : `${managerName(p.edge > 0 ? p.a : p.b)} ${signed(Math.abs(p.edge))} pts`}
									· {p.settled} graded
								{:else}
									No graded trades yet
								{/if}
							</small>
						</span>
						{#if commish && flagCount[p.key]}<span class="flagDot" title="{flagCount[p.key]} flag(s)">{flagCount[p.key]}</span>{/if}
						<span class="count">{p.trades.length}</span>
					</button>
				{/each}
			</div>
		</div>

		{#if selected}
			<div class="panel detail" id="pairDetail">
				<div class="panelHead">
					<span>{managerName(selected.a)} &amp; {managerName(selected.b)}</span>
					<button type="button" class="close" onclick={() => (selectedPair = null)}>Close</button>
				</div>
				<div class="detailTop">
					<div class="who">
						<img src={managerAvatar(selected.a)} alt="" />
						<div>
							<strong>{managerName(selected.a)}</strong>
							<small>{tradeCount[selected.a] || 0} trades · favorite partner: {favorite[selected.a] ? managerName(favorite[selected.a].partner) : '—'}</small>
						</div>
					</div>
					<div class="vs">
						<strong>{selected.trades.length}</strong>
						<span>trade{selected.trades.length === 1 ? '' : 's'}</span>
						{#if selected.settled}<small>{selected.winsA}–{selected.winsB} in graded trades</small>{/if}
					</div>
					<div class="who right">
						<div>
							<strong>{managerName(selected.b)}</strong>
							<small>{tradeCount[selected.b] || 0} trades · favorite partner: {favorite[selected.b] ? managerName(favorite[selected.b].partner) : '—'}</small>
						</div>
						<img src={managerAvatar(selected.b)} alt="" />
					</div>
				</div>
				{#if commish && flags.some((f) => f.pair === selected.key)}
					<div class="flags inDetail">
						{#each flags.filter((f) => f.pair === selected.key) as f}
							<div class="flag {f.level}"><span class="lvl">{f.level}</span><span class="ftype">{f.type}</span><span class="ftext">{f.text}</span></div>
						{/each}
					</div>
				{/if}
				{#each selected.trades as t (t.id)}
					<div class="trade">
						<div class="tradeWhen">{when(t)}{t.sides.length > 2 ? ` · ${t.sides.length}-team trade` : ''}</div>
						<div class="tradeSides" style="--sides: {t.sides.length}">
							{#each t.sides as s}
								<div class="tSide">
									<div class="tWho">
										<span>{managerName(sideManager(s))} got</span>
										<span class="grade {gradeTone(s.grade)}">{s.grade}</span>
									</div>
									{#each s.assets as a}
										<div class="asset">{assetText(a)}{#if a.type !== 'faab' && a.points != null}<small> · {a.points} pts</small>{/if}</div>
									{:else}
										<div class="asset none">nothing</div>
									{/each}
								</div>
							{/each}
						</div>
					</div>
				{/each}
				<p class="detailNote">Points are starting-lineup points after the trade, same as <a href="/trade-grades">Trade Grades</a>.</p>
			</div>
		{/if}
	{/if}
</section>

<style>
	.wrap {
		width: 96%;
		max-width: 1150px;
		margin: 0 auto;
		padding: 22px 0 50px;
		font-family: 'Chakra Petch', 'Roboto', Arial, sans-serif;
		color: var(--mf-text);
	}

	.head {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 16px;
		flex-wrap: wrap;
		padding: 20px 20px 18px;
		background:
			linear-gradient(var(--mf-grid) 1px, transparent 1px) 0 0 / 100% 28px,
			linear-gradient(90deg, var(--mf-grid) 1px, transparent 1px) 0 0 / 28px 100%,
			radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--mf-ion) 14%, transparent), transparent 60%),
			var(--mf-bg);
		border: 1px solid var(--mf-line);
		border-top: 2px solid var(--mf-ion);
		clip-path: polygon(0 0, calc(100% - 22px) 0, 100% 22px, 100% 100%, 22px 100%, 0 calc(100% - 22px));
	}

	h1 {
		margin: 0;
		font-size: 2rem;
		font-weight: 700;
		line-height: 1;
		text-shadow: 0 0 18px var(--mf-line-strong);
	}

	.sub {
		margin-top: 6px;
		font-size: 0.85rem;
		color: var(--mf-dim);
	}

	.stats {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}

	.stat {
		min-width: 96px;
		padding: 8px 12px;
		text-align: center;
		background: var(--mf-panel);
		border: 1px solid var(--mf-line);
		border-top: 2px solid var(--tone, var(--mf-ion));
	}

	.stat strong {
		display: block;
		font-size: 1.3rem;
		line-height: 1.1;
		color: var(--tone, var(--mf-ion));
	}

	.stat span {
		font-size: 0.62rem;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--mf-dim);
	}

	.loading {
		width: 85%;
		max-width: 500px;
		margin: 60px auto;
		color: var(--mf-dim);
	}

	.toolbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 10px;
		flex-wrap: wrap;
		margin: 16px 0 0;
	}

	.chips {
		display: flex;
		gap: 6px;
		flex-wrap: wrap;
	}

	.chip,
	.commishBtn,
	.unlock button,
	.close {
		padding: 6px 12px;
		font: inherit;
		font-size: 0.74rem;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--mf-dim);
		background: var(--mf-panel);
		border: 1px solid var(--mf-line);
		cursor: pointer;
	}

	.chip.active {
		color: var(--mf-on-ion);
		background: var(--mf-ion);
		border-color: var(--mf-ion);
	}

	.commishBtn {
		color: #d9a62e;
		border-color: color-mix(in srgb, #d9a62e 45%, var(--mf-line));
	}

	.commishBtn.on {
		color: #1a1203;
		background: #d9a62e;
	}

	.unlock {
		display: flex;
		gap: 8px;
		align-items: center;
		flex-wrap: wrap;
		margin-top: 10px;
	}

	.unlock input {
		padding: 7px 10px;
		font: inherit;
		color: var(--mf-text);
		background: var(--mf-bg);
		border: 1px solid var(--mf-line-strong);
		letter-spacing: 0.1em;
	}

	.err {
		font-size: 0.82rem;
		color: var(--mf-down);
	}

	.panel {
		margin-top: 18px;
		background: var(--mf-panel);
		border: 1px solid var(--mf-line);
	}

	.panelHead {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 10px;
		padding: 10px 14px;
		font-size: 0.78rem;
		font-weight: 700;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--mf-dim);
		background: var(--mf-panel-2);
		border-bottom: 1px solid var(--mf-line);
		border-top: 2px solid var(--mf-ion);
	}

	.panelHead small {
		font-size: 0.9em;
		font-weight: 500;
		letter-spacing: 0.04em;
		text-transform: none;
	}

	.cols {
		display: grid;
		grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
		gap: 18px;
		align-items: start;
	}

	.cols .panel {
		margin-top: 18px;
	}

	/* ---------- grid ---------- */
	.gridScroll {
		overflow-x: auto;
		padding: 10px;
	}

	.grid {
		border-collapse: separate;
		border-spacing: 3px;
	}

	.grid th {
		padding: 0;
		font-weight: 500;
	}

	.gAv {
		width: 26px;
		height: 26px;
		border-radius: 50%;
		object-fit: cover;
		border: 1px solid var(--mf-line-strong);
		vertical-align: middle;
	}

	.gAv.former {
		opacity: 0.4;
		filter: grayscale(1);
	}

	.rowHead {
		display: flex;
		align-items: center;
		gap: 6px;
		min-width: 130px;
		max-width: 150px;
		padding-right: 6px !important;
		text-align: left;
		font-size: 0.74rem;
		white-space: nowrap;
	}

	.rowHead span {
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.grid td {
		width: 28px;
		height: 28px;
		padding: 0;
	}

	.grid td.self {
		background: repeating-linear-gradient(45deg, transparent 0 4px, var(--mf-line) 4px 5px);
	}

	.grid td.none {
		background: color-mix(in srgb, var(--mf-bg) 70%, transparent);
	}

	.cell {
		width: 100%;
		height: 100%;
		min-height: 28px;
		padding: 0;
		font: inherit;
		font-size: 0.78rem;
		font-weight: 700;
		color: var(--mf-text);
		background: color-mix(in srgb, var(--mf-ion) calc(18% + var(--heat) * 72%), var(--mf-bg));
		border: 1px solid transparent;
		cursor: pointer;
	}

	.cell:hover,
	.cell.sel {
		border-color: #fff;
	}

	.cell.flagged {
		box-shadow: inset 0 0 0 2px var(--mf-down);
	}

	.gridNote {
		margin: 0;
		padding: 0 14px 12px;
		font-size: 0.74rem;
		color: var(--mf-dim);
	}

	/* ---------- partnerships ---------- */
	.pairRow {
		display: grid;
		grid-template-columns: 50px minmax(0, 1fr) auto auto;
		align-items: center;
		gap: 10px;
		width: 100%;
		padding: 8px 14px;
		font: inherit;
		color: inherit;
		text-align: left;
		background: none;
		border: 0;
		border-bottom: 1px solid var(--mf-line);
		cursor: pointer;
	}

	.pairRow:hover,
	.pairRow.sel {
		background: var(--mf-panel-2);
	}

	.duo {
		position: relative;
		height: 30px;
	}

	.duo img {
		position: absolute;
		top: 0;
		width: 30px;
		height: 30px;
		border-radius: 50%;
		object-fit: cover;
		border: 1px solid var(--mf-line-strong);
		background: #000;
	}

	.duo img:last-child {
		left: 18px;
	}

	.pairNames {
		display: flex;
		flex-direction: column;
		min-width: 0;
		font-size: 0.86rem;
		font-weight: 600;
	}

	.pairNames span {
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.pairNames small {
		font-size: 0.72rem;
		font-weight: 400;
		color: var(--mf-dim);
	}

	.count {
		min-width: 30px;
		font-size: 1.2rem;
		font-weight: 700;
		text-align: right;
		color: var(--mf-ion);
	}

	.flagDot {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 18px;
		height: 18px;
		font-size: 0.7rem;
		font-weight: 700;
		color: #fff;
		background: var(--mf-down);
		border-radius: 9px;
	}

	/* ---------- trade watch ---------- */
	.watch .panelHead {
		border-top-color: #d9a62e;
	}

	.watchNote,
	.detailNote {
		margin: 10px 14px;
		font-family: 'Roboto', sans-serif;
		font-size: 0.8rem;
		color: var(--mf-dim);
	}

	.detailNote a {
		color: var(--mf-ion);
	}

	.flags {
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding: 0 14px 14px;
	}

	.flags.inDetail {
		padding-top: 12px;
	}

	.flag {
		display: grid;
		grid-template-columns: 64px 130px minmax(0, 1fr);
		align-items: center;
		gap: 10px;
		padding: 8px 10px;
		font: inherit;
		color: inherit;
		text-align: left;
		background: var(--mf-panel-2);
		border: 1px solid var(--mf-line);
		border-left: 3px solid var(--lvl);
		cursor: pointer;
	}

	.flag.high { --lvl: var(--mf-down); }
	.flag.medium { --lvl: #d9a62e; }
	.flag.low { --lvl: var(--mf-plasma); }

	.lvl {
		font-size: 0.62rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--lvl);
	}

	.ftype {
		font-size: 0.8rem;
		font-weight: 700;
	}

	.ftext {
		font-family: 'Roboto', sans-serif;
		font-size: 0.84rem;
		line-height: 1.35;
	}

	.moreBtn {
		margin: 0 14px 14px;
		padding: 6px 12px;
		font: inherit;
		font-size: 0.74rem;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--mf-dim);
		background: transparent;
		border: 1px dashed var(--mf-line-strong);
		cursor: pointer;
	}

	.empty {
		margin: 0;
		padding: 0 14px 14px;
		font-style: italic;
		color: var(--mf-dim);
	}

	/* ---------- pair detail ---------- */
	.detailTop {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
		align-items: center;
		gap: 14px;
		padding: 14px;
		border-bottom: 1px solid var(--mf-line);
	}

	.who {
		display: flex;
		align-items: center;
		gap: 10px;
		min-width: 0;
	}

	.who.right {
		justify-content: flex-end;
		text-align: right;
	}

	.who img {
		width: 44px;
		height: 44px;
		border-radius: 50%;
		object-fit: cover;
		border: 2px solid var(--mf-ion);
	}

	.who strong {
		display: block;
		font-size: 1rem;
	}

	.who small {
		font-size: 0.72rem;
		color: var(--mf-dim);
	}

	.vs {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.vs strong {
		font-size: 2rem;
		line-height: 1;
		color: var(--mf-ion);
	}

	.vs span,
	.vs small {
		font-size: 0.7rem;
		color: var(--mf-dim);
	}

	.trade {
		padding: 12px 14px;
		border-bottom: 1px solid var(--mf-line);
	}

	.tradeWhen {
		margin-bottom: 8px;
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--mf-dim);
	}

	.tradeSides {
		display: grid;
		grid-template-columns: repeat(var(--sides), minmax(0, 1fr));
		gap: 10px;
	}

	.tSide {
		padding: 8px 10px;
		background: var(--mf-panel-2);
		border: 1px solid var(--mf-line);
	}

	.tWho {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 8px;
		margin-bottom: 6px;
		font-size: 0.8rem;
		font-weight: 700;
	}

	.grade {
		padding: 1px 7px;
		font-size: 0.72rem;
		border: 1px solid currentColor;
	}

	.grade.great { color: var(--mf-up); }
	.grade.good { color: var(--mf-ion); }
	.grade.meh { color: #d9a62e; }
	.grade.bad { color: var(--mf-down); }
	.grade.muted { color: var(--mf-dim); }

	.asset {
		font-family: 'Roboto', sans-serif;
		font-size: 0.84rem;
		line-height: 1.5;
	}

	.asset small {
		color: var(--mf-dim);
	}

	.asset.none {
		font-style: italic;
		color: var(--mf-dim);
	}

	@media (max-width: 900px) {
		.cols {
			grid-template-columns: minmax(0, 1fr);
		}
	}

	@media (max-width: 600px) {
		.flag {
			grid-template-columns: 52px minmax(0, 1fr);
		}
		.flag .ftext {
			grid-column: 1 / -1;
		}
		.detailTop {
			grid-template-columns: minmax(0, 1fr) auto;
		}
		.who.right {
			grid-column: 1 / -1;
			justify-content: flex-start;
			flex-direction: row-reverse;
			text-align: left;
		}
		.tradeSides {
			grid-template-columns: minmax(0, 1fr);
		}
		.rowHead {
			min-width: 34px;
		}
		.rowHead span {
			display: none;
		}
	}
</style>
