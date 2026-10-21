<script>
	import { onMount } from 'svelte';
	import LinearProgress from '@smui/linear-progress';
	import { leagueID } from '$lib/utils/leagueInfo';
	import { getLeagueTeamManagers, getLeagueData, getNflState, loadPlayers, waitForAll, gotoManager } from '$lib/utils/helper';
	import { getAvatarFromTeamManagers, getTeamNameFromTeamManagers } from '$lib/utils/helperFunctions/universalFunctions';

	/*
	 * FAAB balances straight from Sleeper: each team's balance is the league
	 * cap minus what Sleeper shows as used (carryover and bonus FAAB set by the
	 * commissioners are already in there). Spending and FAAB trades come from
	 * this season's transactions.
	 */
	let loading = true;
	let error = null;
	let ltm = null;
	let cap = 999;
	let minBid = 0;
	let season = '';
	let teams = [];
	let bids = [];
	let faabTrades = [];

	const name = (id) => getTeamNameFromTeamManagers(ltm, id);
	const avatar = (id) => getAvatarFromTeamManagers(ltm, id);
	const money = (n) => `$${Number(n || 0).toLocaleString()}`;

	onMount(async () => {
		try {
			const [teamManagers, league, nflState, playersInfo] = await waitForAll(
				getLeagueTeamManagers(),
				getLeagueData(),
				getNflState(),
				loadPlayers(null)
			);
			ltm = teamManagers;
			cap = Number(league.settings?.waiver_budget) || 0;
			minBid = Number(league.settings?.waiver_bid_min) || 0;
			season = league.season;
			const players = playersInfo.players || {};

			const lastWeek = String(nflState.season) === String(league.season) ? Math.max(1, Number(nflState.week) || 1) : 18;
			const [rosters, ...weeks] = await waitForAll(
				fetch(`https://api.sleeper.app/v1/league/${leagueID}/rosters`).then((r) => r.json()),
				...Array.from({ length: lastWeek + 1 }, (_, w) =>
					fetch(`https://api.sleeper.app/v1/league/${leagueID}/transactions/${w}`).then((r) => r.json()).catch(() => [])
				)
			);
			const tx = weeks.flat().filter((t) => t && t.status === 'complete');

			const spent = {}, wins = {}, tradedIn = {}, tradedOut = {};
			const bidList = [];
			for (const t of tx) {
				if (t.type === 'waiver' && t.settings?.waiver_bid != null) {
					const rid = t.roster_ids?.[0];
					const bid = Number(t.settings.waiver_bid) || 0;
					spent[rid] = (spent[rid] || 0) + bid;
					wins[rid] = (wins[rid] || 0) + 1;
					const pid = Object.keys(t.adds || {})[0];
					const p = players[pid];
					bidList.push({
						rid,
						bid,
						week: t.leg,
						time: t.status_updated || t.created,
						player: p ? `${p.fn} ${p.ln}` : 'Player',
						pos: p?.pos || '',
						team: p?.t || ''
					});
				}
				for (const m of t.waiver_budget || []) {
					const amt = Number(m.amount) || 0;
					tradedIn[m.receiver] = (tradedIn[m.receiver] || 0) + amt;
					tradedOut[m.sender] = (tradedOut[m.sender] || 0) + amt;
					faabTrades.push({ from: m.sender, to: m.receiver, amount: amt, week: t.leg, time: t.status_updated || t.created });
				}
			}

			teams = rosters
				.map((r) => {
					const used = Number(r.settings?.waiver_budget_used) || 0;
					return {
						id: r.roster_id,
						balance: Math.max(0, cap - used),
						spent: spent[r.roster_id] || 0,
						wins: wins[r.roster_id] || 0,
						net: (tradedIn[r.roster_id] || 0) - (tradedOut[r.roster_id] || 0)
					};
				})
				.sort((a, b) => b.balance - a.balance);
			bids = bidList.sort((a, b) => (b.time || 0) - (a.time || 0));
			faabTrades = faabTrades.sort((a, b) => (b.time || 0) - (a.time || 0));
		} catch (err) {
			console.error('[FAAB Bank]', err);
			error = 'Could not load FAAB from Sleeper. Refresh to try again.';
		}
		loading = false;
	});

	$: maxBalance = Math.max(1, ...teams.map((t) => t.balance));
	$: total = teams.reduce((n, t) => n + t.balance, 0);
	$: totalSpent = teams.reduce((n, t) => n + t.spent, 0);
	$: biggest = [...bids].sort((a, b) => b.bid - a.bid).slice(0, 5);
	$: recent = bids.slice(0, 12);
</script>

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
			radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--mf-up) 14%, transparent), transparent 60%),
			var(--mf-bg);
		border: 1px solid var(--mf-line);
		border-top: 2px solid var(--mf-up);
		clip-path: polygon(0 0, calc(100% - 22px) 0, 100% 22px, 100% 100%, 22px 100%, 0 calc(100% - 22px));
	}

	h1 {
		margin: 0;
		font-size: 2rem;
		font-weight: 700;
		line-height: 1;
		letter-spacing: 0.02em;
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
		font-variant-numeric: tabular-nums;
	}

	.stat span {
		font-size: 0.64rem;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--mf-dim);
	}

	.cols {
		display: grid;
		grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
		gap: 18px;
		margin-top: 20px;
		align-items: start;
	}

	.panel {
		background: var(--mf-panel);
		border: 1px solid var(--mf-line);
	}

	.panelHead {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
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
		letter-spacing: 0.04em;
		text-transform: none;
		font-weight: 500;
	}

	.bank {
		display: grid;
		grid-template-columns: 26px 34px minmax(0, 1fr) auto;
		align-items: center;
		gap: 10px;
		padding: 8px 14px;
		border-bottom: 1px solid var(--mf-line);
		cursor: pointer;
	}

	.bank:last-child {
		border-bottom: 0;
	}

	.bank:hover {
		background: var(--mf-panel-2);
	}

	.pos {
		font-weight: 700;
		color: var(--mf-dim);
		text-align: center;
		font-variant-numeric: tabular-nums;
	}

	.av {
		width: 34px;
		height: 34px;
		border-radius: 50%;
		object-fit: cover;
		border: 1px solid var(--mf-line-strong);
		background: #000;
	}

	.info {
		min-width: 0;
	}

	.nm {
		font-weight: 700;
		font-size: 0.95rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.meter {
		height: 5px;
		margin-top: 5px;
		background: color-mix(in srgb, var(--mf-dim) 22%, transparent);
	}

	.meter span {
		display: block;
		height: 100%;
		background: linear-gradient(90deg, color-mix(in srgb, var(--mf-up) 70%, var(--mf-panel)), var(--mf-up));
		box-shadow: 0 0 8px color-mix(in srgb, var(--mf-up) 45%, transparent);
	}

	.meta {
		margin-top: 4px;
		font-size: 0.72rem;
		color: var(--mf-dim);
	}

	.meta .plus { color: var(--mf-up); }
	.meta .minus { color: var(--mf-down); }

	.bal {
		font-size: 1.15rem;
		font-weight: 700;
		color: var(--mf-up);
		font-variant-numeric: tabular-nums;
		text-align: right;
	}

	.feed {
		display: flex;
		flex-direction: column;
	}

	.item {
		display: grid;
		grid-template-columns: 26px minmax(0, 1fr) auto;
		align-items: center;
		gap: 10px;
		padding: 8px 14px;
		border-bottom: 1px solid var(--mf-line);
		font-size: 0.85rem;
	}

	.item:last-child {
		border-bottom: 0;
	}

	.item img {
		width: 26px;
		height: 26px;
		border-radius: 50%;
		object-fit: cover;
	}

	.item .what {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.item .what small {
		display: block;
		font-size: 0.72rem;
		color: var(--mf-dim);
	}

	.item .amt {
		font-weight: 700;
		color: var(--mf-ion);
		font-variant-numeric: tabular-nums;
	}

	.item .amt.trade {
		color: var(--mf-up);
	}

	.stack {
		display: flex;
		flex-direction: column;
		gap: 18px;
	}

	.empty {
		padding: 14px;
		font-size: 0.82rem;
		color: var(--mf-dim);
		font-style: italic;
	}

	.note {
		max-width: 80ch;
		margin: 16px auto 0;
		font-size: 0.78rem;
		line-height: 1.45;
		color: var(--mf-dim);
		text-align: center;
	}

	.loading {
		max-width: 420px;
		margin: 60px auto;
		text-align: center;
		color: var(--mf-dim);
	}

	@media (max-width: 820px) {
		.cols {
			grid-template-columns: minmax(0, 1fr);
		}
	}

	@media (max-width: 600px) {
		.wrap { width: calc(100% - 16px); }
		h1 { font-size: 1.6rem; }
		.stats { width: 100%; }
		.stat { flex: 1; min-width: 0; }
	}
</style>

<div class="wrap">
	<div class="head">
		<div>
			<h1>FAAB Bank</h1>
			<div class="sub">Every team's Free Agent Acquisition Budget, live from Sleeper{season ? ` · ${season} season` : ''}</div>
		</div>
		{#if !loading && !error}
			<div class="stats">
				<div class="stat" style="--tone: var(--mf-up)"><strong>{money(total)}</strong><span>In the bank</span></div>
				<div class="stat"><strong>{money(totalSpent)}</strong><span>Spent on waivers</span></div>
				<div class="stat" style="--tone: var(--mf-dim)"><strong>{money(cap)}</strong><span>Cap</span></div>
			</div>
		{/if}
	</div>

	{#if loading}
		<div class="loading">
			<p>Counting the money...</p>
			<LinearProgress indeterminate />
		</div>
	{:else if error}
		<p class="loading">{error}</p>
	{:else}
		<div class="cols">
			<div class="panel">
				<div class="panelHead"><span>Balances</span><small>tap a team for its page</small></div>
				{#each teams as t, i (t.id)}
					<div class="bank" role="link" tabindex="0" onclick={() => gotoManager({ leagueTeamManagers: ltm, rosterID: t.id })} onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && gotoManager({ leagueTeamManagers: ltm, rosterID: t.id })}>
						<span class="pos">{i + 1}</span>
						<img class="av" src={avatar(t.id)} alt="" />
						<div class="info">
							<div class="nm">{name(t.id)}</div>
							<div class="meter"><span style="width: {(t.balance / maxBalance) * 100}%"></span></div>
							<div class="meta">
								{money(t.spent)} spent on {t.wins} claim{t.wins === 1 ? '' : 's'}
								{#if t.net > 0}· <span class="plus">+{money(t.net)} via trades</span>{/if}
								{#if t.net < 0}· <span class="minus">−{money(-t.net)} via trades</span>{/if}
							</div>
						</div>
						<span class="bal">{money(t.balance)}</span>
					</div>
				{/each}
			</div>

			<div class="stack">
				<div class="panel">
					<div class="panelHead"><span>Biggest splashes</span><small>{season}</small></div>
					<div class="feed">
						{#each biggest as b}
							<div class="item">
								<img src={avatar(b.rid)} alt="" />
								<span class="what">{b.player}<small>{name(b.rid)} · {b.pos}{b.team ? ` · ${b.team}` : ''} · Week {b.week}</small></span>
								<span class="amt">{money(b.bid)}</span>
							</div>
						{:else}
							<div class="empty">No winning bids yet this season.</div>
						{/each}
					</div>
				</div>

				<div class="panel">
					<div class="panelHead"><span>Recent claims</span></div>
					<div class="feed">
						{#each recent as b}
							<div class="item">
								<img src={avatar(b.rid)} alt="" />
								<span class="what">{b.player}<small>{name(b.rid)} · Week {b.week}</small></span>
								<span class="amt">{money(b.bid)}</span>
							</div>
						{:else}
							<div class="empty">No claims yet.</div>
						{/each}
					</div>
				</div>

				<div class="panel">
					<div class="panelHead"><span>FAAB in trades</span></div>
					<div class="feed">
						{#each faabTrades as f}
							<div class="item">
								<img src={avatar(f.to)} alt="" />
								<span class="what">{name(f.to)}<small>from {name(f.from)} · Week {f.week}</small></span>
								<span class="amt trade">+{money(f.amount)}</span>
							</div>
						{:else}
							<div class="empty">No FAAB has been traded this season.</div>
						{/each}
					</div>
				</div>
			</div>
		</div>

		<p class="note">
			Balances are the {money(cap)} cap minus what Sleeper shows each team has used, so carryover and bonus FAAB set by the
			commissioners are included. FAAB carries over between seasons up to {money(cap)}.
			{#if minBid}Minimum bid: {money(minBid)}.{/if} Spending and trades cover the {season} season.
		</p>
	{/if}
</div>
