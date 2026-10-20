<!--
	Trade Report Card
	Every trade graded on starting-lineup points since the trade,
	re-graded every time (so trades keep aging).
-->
<script>
	import { onMount } from 'svelte';
	import LinearProgress from '@smui/linear-progress';
	import { getLeagueTeamManagers, loadPlayers, waitForAll, gotoManager } from '$lib/utils/helper';
	import { getTradeGrades, gradeTone } from '$lib/utils/helperFunctions/tradeGradesClient';
	import { MIN_WEEKS } from '$lib/utils/helperFunctions/tradeGrades';

	let state = 'loading';
	let data = null;
	let ltm = null;
	let players = {};
	let seasonFilter = 'all';

	onMount(async () => {
		try {
			const [grades, teamManagers, playerData] = await waitForAll(
				getTradeGrades(),
				getLeagueTeamManagers(),
				loadPlayers(null)
			);
			data = grades;
			ltm = teamManagers;
			players = playerData.players || {};
			state = 'ready';
		} catch (err) {
			console.error('[Trade Grades] Could not load:', err);
			state = 'error';
		}
	});

	const team = (rosterID, season) => {
		const year = ltm?.teamManagersMap?.[season] ? season : ltm?.currentSeason;
		return ltm?.teamManagersMap?.[year]?.[rosterID]?.team || { name: 'Unknown Team', avatar: '' };
	};

	const playerName = (id) => {
		const p = players[id];
		return p ? `${p.fn} ${p.ln}` : 'Unknown player';
	};

	const assetLabel = (a) => {
		if (a.type === 'player') return { name: playerName(a.playerID), detail: `${a.points} pts${a.still ? '' : ' (gone)'}` };
		if (a.type === 'pick') {
			const label = `${a.season} round ${a.round} pick`;
			if (a.pending) return { name: label, detail: 'pending' };
			return { name: `${label} → ${playerName(a.playerID)}`, detail: `${a.points} pts${a.still ? '' : ' (gone)'}` };
		}
		return { name: `$${a.amount} FAAB`, detail: '' };
	};

	const isSettled = (t) => t.sides.every((s) => !['Too early', 'Pending', 'Wash', 'FAAB deal'].includes(s.grade));

	$: seasons = data ? [...new Set(data.trades.map((t) => t.season))] : [];
	$: shown = data ? data.trades.filter((t) => seasonFilter === 'all' || t.season === seasonFilter) : [];

	// biggest gap between best and worst side, settled trades only
	$: fleeces = data
		? data.trades
				.filter(isSettled)
				.map((t) => {
					const sorted = [...t.sides].sort((a, b) => b.value - a.value);
					return { t, winner: sorted[0], loser: sorted[sorted.length - 1], margin: sorted[0].value - sorted[sorted.length - 1].value };
				})
				.sort((a, b) => b.margin - a.margin)
				.slice(0, 5)
		: [];

	$: records = data
		? Object.entries(data.managers)
				.map(([id, m]) => ({ id, ...m }))
				.filter((m) => m.trades > 0)
				.sort((a, b) => b.net - a.net)
		: [];
	$: maxNet = Math.max(1, ...records.map((m) => Math.abs(m.net)));

	const openManager = (managerID) => gotoManager({ leagueTeamManagers: ltm, managerID });
	const signed = (v) => `${v > 0 ? '+' : ''}${Math.round(v)}`;
</script>

<section class="report">
	<header>
		<h1>Trade Report Card</h1>
		<p class="sub">
			Every trade graded on the <strong>starting-lineup points</strong> each side got from what it received,
			counted from the trade until that player left the team. Grades update every week, so old trades keep
			aging. Draft picks stay pending until they're used; trades younger than {MIN_WEEKS} weeks are "too early".
		</p>
	</header>

	{#if state === 'loading'}
		<div class="loading">
			<p>Grading every trade…</p>
			<LinearProgress indeterminate />
		</div>
	{:else if state === 'error'}
		<p class="message">Couldn't load trade grades from Sleeper. Refresh the page to try again.</p>
	{:else}
		<!-- TRADING RECORDS -->
		<div class="panel">
			<h2>Trading records</h2>
			<p class="panelSub">Net points gained (or given away) across settled trades, all seasons.</p>
			<div class="records">
				{#each records as m (m.id)}
					<button type="button" class="recordRow" onclick={() => openManager(m.id)}>
						<span class="recName">{m.name}</span>
						<span class="recWL">{m.won}–{m.lost}{m.even ? `–${m.even}` : ''} <small>({m.trades} trades)</small></span>
						<span class="recNet" class:pos={m.net > 0} class:neg={m.net < 0}>{signed(m.net)} pts</span>
						<span class="netBar">
							<span class="netMid"></span>
							<span
								class="netFill"
								class:neg={m.net < 0}
								style="width: {(Math.abs(m.net) / maxNet) * 50}%; {m.net < 0 ? 'right: 50%' : 'left: 50%'}"
							></span>
						</span>
					</button>
				{/each}
			</div>
			<p class="fine">W–L counts trades where a side got more (or less) than 53% of the value. Even trades and unsettled ones don't count.</p>
		</div>

		<!-- BIGGEST FLEECES -->
		{#if fleeces.length}
			<div class="panel">
				<h2>Biggest fleeces</h2>
				<div class="fleeces">
					{#each fleeces as f, i}
						<div class="fleece">
							<span class="fleeceRank">{i + 1}</span>
							<div class="fleeceBody">
								<div class="fleeceLine">
									<strong>{team(f.winner.rosterID, f.t.season).name}</strong>
									<span class="grade tone-great">{f.winner.grade}</span>
									<span class="vsTxt">over</span>
									<strong>{team(f.loser.rosterID, f.t.season).name}</strong>
									<span class="grade tone-{gradeTone(f.loser.grade)}">{f.loser.grade}</span>
								</div>
								<div class="fleeceDetail">
									{f.t.season} week {f.t.week}: {Math.round(f.winner.value)} pts vs {Math.round(f.loser.value)} pts
									<span class="dim">(+{Math.round(f.margin)})</span>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- ALL TRADES -->
		<div class="panel">
			<h2>Every trade</h2>
			<div class="chips">
				<button type="button" class="chip" class:active={seasonFilter === 'all'} onclick={() => (seasonFilter = 'all')}>All</button>
				{#each seasons as season}
					<button type="button" class="chip" class:active={seasonFilter === season} onclick={() => (seasonFilter = season)}>{season}</button>
				{/each}
			</div>

			<div class="trades">
				{#each shown as t (t.id)}
					<article class="trade">
						<div class="tradeMeta">
							{t.season} · week {t.week}
							{#if t.weeks}<span class="dim">· graded over {t.weeks} week{t.weeks === 1 ? '' : 's'}</span>{/if}
						</div>
						<div class="sides" style="--n: {t.sides.length}">
							{#each t.sides as side}
								{@const tm = team(side.rosterID, t.season)}
								<div class="side">
									<div class="sideHead">
										<img src={tm.avatar} alt="" />
										<span class="sideName">{tm.name}</span>
										<span class="grade tone-{gradeTone(side.grade)}">{side.grade}</span>
									</div>
									<div class="sideValue">
										{#if side.grade !== 'FAAB deal'}{side.value} pts{/if}
									</div>
									<ul class="assets">
										{#each side.assets as a}
											{@const lbl = assetLabel(a)}
											<li><span>{lbl.name}</span>{#if lbl.detail}<em>{lbl.detail}</em>{/if}</li>
										{:else}
											<li class="dim">Nothing received</li>
										{/each}
									</ul>
								</div>
							{/each}
						</div>
						{#if t.history.length > 1}
							<div class="history">
								{#each t.history as h}
									<span><span class="dim">{h.label}:</span> {h.grades.join(' / ')}</span>
								{/each}
							</div>
						{/if}
					</article>
				{/each}
			</div>
		</div>
	{/if}
</section>

<style>
	.report {
		width: 96%;
		max-width: 980px;
		margin: 2em auto 5em;
		color: var(--mf-text);
		container-type: inline-size;
	}

	h1 {
		margin: 0.6em 0 0.2em;
		font-size: 2.6rem;
		font-weight: 700;
		text-align: center;
		text-shadow: 0 0 18px var(--mf-ion-glow);
	}

	.sub {
		max-width: 68ch;
		margin: 0 auto 2em;
		font-size: 0.92rem;
		line-height: 1.5;
		text-align: center;
		color: var(--mf-dim);
	}

	.sub strong {
		color: var(--mf-text);
	}

	.loading {
		width: 85%;
		max-width: 500px;
		margin: 60px auto;
	}

	.message {
		text-align: center;
		color: var(--mf-dim);
	}

	.panel {
		margin-bottom: 2em;
		padding: 18px;
		background: var(--mf-panel);
		border: 1px solid var(--mf-line);
		box-shadow: 0 0 26px -14px var(--mf-ion-glow);
	}

	.panel h2 {
		margin: 0 0 4px;
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--mf-ion);
	}

	.panelSub,
	.fine {
		margin: 0 0 12px;
		font-size: 0.85rem;
		color: var(--mf-dim);
	}

	.fine {
		margin: 10px 0 0;
		font-size: 0.78rem;
	}

	.dim {
		color: var(--mf-dim);
	}

	/* records */

	.recordRow {
		display: grid;
		grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr) 0.8fr 1.4fr;
		align-items: center;
		gap: 12px;
		width: 100%;
		min-height: 42px;
		padding: 0 4px;
		font: inherit;
		color: inherit;
		text-align: left;
		background: none;
		border: none;
		border-top: 1px solid var(--mf-line);
		cursor: pointer;
	}

	.recordRow:hover .recName {
		color: var(--mf-ion);
	}

	.recName {
		font-family: 'Chakra Petch', 'Roboto', sans-serif;
		font-weight: 600;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.recWL {
		font-variant-numeric: tabular-nums;
	}

	.recWL small {
		color: var(--mf-dim);
	}

	.recNet {
		font-family: 'Chakra Petch', 'Roboto', sans-serif;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
	}

	.recNet.pos {
		color: var(--mf-up);
	}

	.recNet.neg {
		color: var(--mf-down);
	}

	.netBar {
		position: relative;
		height: 6px;
		background: color-mix(in srgb, var(--mf-dim) 18%, transparent);
	}

	.netMid {
		position: absolute;
		left: 50%;
		top: -3px;
		bottom: -3px;
		width: 1px;
		background: var(--mf-dim);
	}

	.netFill {
		position: absolute;
		top: 0;
		bottom: 0;
		background: var(--mf-up);
	}

	.netFill.neg {
		background: var(--mf-down);
	}

	/* fleeces */

	.fleece {
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 10px 0;
		border-top: 1px solid var(--mf-line);
	}

	.fleeceRank {
		flex: none;
		width: 30px;
		font-family: 'Chakra Petch', 'Roboto', sans-serif;
		font-size: 1.6rem;
		font-weight: 700;
		color: var(--mf-ion);
		text-align: center;
	}

	.fleeceLine {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 6px 8px;
	}

	.vsTxt {
		color: var(--mf-dim);
	}

	.fleeceDetail {
		margin-top: 2px;
		font-size: 0.85rem;
		color: var(--mf-dim);
	}

	/* grades */

	.grade {
		display: inline-block;
		padding: 1px 7px;
		font-family: 'Chakra Petch', 'Roboto', sans-serif;
		font-size: 0.85rem;
		font-weight: 700;
		border: 1px solid currentColor;
	}

	.tone-great {
		color: var(--mf-up);
		box-shadow: 0 0 10px -3px currentColor;
	}

	.tone-good {
		color: var(--mf-ion);
	}

	.tone-meh {
		color: #e2722b;
	}

	.tone-bad {
		color: var(--mf-down);
	}

	.tone-muted {
		color: var(--mf-dim);
	}

	/* every trade */

	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin: 6px 0 12px;
	}

	.chip {
		font: inherit;
		font-size: 0.85rem;
		font-weight: 600;
		padding: 5px 11px;
		color: var(--mf-dim);
		background: transparent;
		border: 1px solid var(--mf-line);
		cursor: pointer;
	}

	.chip.active {
		color: var(--mf-ion);
		border-color: var(--mf-ion);
	}

	.trade {
		padding: 12px 0 14px;
		border-top: 1px solid var(--mf-line);
	}

	.tradeMeta {
		margin-bottom: 8px;
		font-size: 0.8rem;
		color: var(--mf-text);
	}

	.sides {
		display: grid;
		grid-template-columns: repeat(var(--n), minmax(0, 1fr));
		gap: 12px;
	}

	.side {
		min-width: 0;
		padding: 10px;
		background: var(--mf-panel-2);
		border: 1px solid var(--mf-line);
	}

	.sideHead {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.sideHead img {
		flex: none;
		width: 28px;
		height: 28px;
		border-radius: 50%;
		object-fit: cover;
	}

	.sideName {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		font-family: 'Chakra Petch', 'Roboto', sans-serif;
		font-weight: 600;
	}

	.sideValue {
		margin: 6px 0 4px;
		font-family: 'Chakra Petch', 'Roboto', sans-serif;
		font-weight: 700;
		color: var(--mf-ion);
	}

	.assets {
		margin: 0;
		padding: 0;
		list-style: none;
		font-size: 0.85rem;
	}

	.assets li {
		display: flex;
		justify-content: space-between;
		gap: 8px;
		padding: 2px 0;
	}

	.assets li span {
		min-width: 0;
		overflow-wrap: anywhere;
	}

	.assets em {
		flex: none;
		font-style: normal;
		color: var(--mf-dim);
		font-variant-numeric: tabular-nums;
	}

	.history {
		display: flex;
		flex-wrap: wrap;
		gap: 4px 16px;
		margin-top: 8px;
		font-size: 0.8rem;
	}

	@container (max-width: 640px) {
		.recordRow {
			grid-template-columns: minmax(0, 1fr) auto;
			grid-template-areas: 'name net' 'wl bar';
			gap: 2px 12px;
			padding: 8px 4px;
		}

		.recName {
			grid-area: name;
		}

		.recNet {
			grid-area: net;
			text-align: right;
		}

		.recWL {
			grid-area: wl;
			font-size: 0.85rem;
		}

		.netBar {
			grid-area: bar;
			width: 110px;
		}

		.sides {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
