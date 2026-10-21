<script>
	import { onMount } from 'svelte';
	import LinearProgress from '@smui/linear-progress';
	import { getManagerHistory } from '$lib/utils/helperFunctions/managerInsights';
	import { getRivalryTier, RIVALRY_TIERS, RIVALRY_POINTS } from '$lib/utils/helperFunctions/playoffRounds';

	/*
	 * Every rivalry between two current managers, scored with the same
	 * 10-tier system as the Rivalry page (shared game history).
	 */
	const PREVIEW = 25;

	let loading = true;
	let error = null;
	let rivalries = [];
	let managers = []; // [{ id, name, team, avatar }]
	let filter = '';
	let showAll = false;

	onMount(async () => {
		try {
			const history = await getManagerHistory();
			const tm = history.teamManagers;
			const current = tm.teamManagersMap[tm.currentSeason] || {};

			const seen = new Set();
			for (const [rosterID, entry] of Object.entries(current)) {
				const id = entry.managers?.[0];
				if (!id || seen.has(id)) continue;
				seen.add(id);
				managers.push({
					id,
					rosterID: Number(rosterID),
					name: tm.users?.[id]?.display_name || 'Manager',
					team: entry.team?.name || 'Team',
					avatar: entry.team?.avatar
				});
			}
			managers.sort((a, b) => a.team.localeCompare(b.team));

			const list = [];
			for (let i = 0; i < managers.length; i++) {
				for (let j = i + 1; j < managers.length; j++) {
					const a = managers[i], b = managers[j];
					const k = a.id < b.id ? `${a.id}|${b.id}` : `${b.id}|${a.id}`;
					const p = history.pairs?.[k] || { reg: 0, qf: 0, sf: 0, ch: 0 };
					const meetings = [
						...Array(p.ch).fill({ depth: 3 }),
						...Array(p.sf).fill({ depth: 2 }),
						...Array(p.qf).fill({ depth: 1 })
					];
					const tier = getRivalryTier(meetings, p.reg);
					if (!tier) continue;
					const winsA = history.beats?.[a.id]?.[b.id] || 0;
					const winsB = history.beats?.[b.id]?.[a.id] || 0;
					const ties = history.ties?.[a.id]?.[b.id] || 0;
					// list the leader first
					const [x, y, wx, wy] = winsB > winsA ? [b, a, winsB, winsA] : [a, b, winsA, winsB];
					list.push({ a: x, b: y, winsA: wx, winsB: wy, ties, ...p, tier });
				}
			}
			list.sort((m, n) => n.tier.score - m.tier.score || m.tier.tier - n.tier.tier);
			rivalries = list;
			managers = managers;
		} catch (err) {
			console.error('[Hottest Rivalries]', err);
			error = 'Could not load game history from Sleeper. Refresh to try again.';
		}
		loading = false;
	});

	$: filtered = filter ? rivalries.filter((r) => r.a.id === filter || r.b.id === filter) : rivalries;
	$: shown = filter || showAll ? filtered : filtered.slice(0, PREVIEW);
	$: tierCounts = Object.values(RIVALRY_TIERS)
		.filter((t) => t.tier)
		.sort((a, b) => a.tier - b.tier)
		.map((t) => ({ ...t, count: rivalries.filter((r) => r.tier.tier === t.tier).length }));
	$: focus = managers.find((m) => m.id === filter);

	const link = (r) => `/rivalry?player_one=${r.a.id}&player_two=${r.b.id}`;
	const record = (r) => `${r.winsA}–${r.winsB}${r.ties ? `–${r.ties}` : ''}`;
	const rankOf = (r) => rivalries.indexOf(r) + 1;
</script>

<style>
	.wrap {
		width: 96%;
		max-width: 1100px;
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
			radial-gradient(ellipse at 50% 0%, color-mix(in srgb, #e2452b 18%, transparent), transparent 60%),
			var(--mf-bg);
		border: 1px solid var(--mf-line);
		border-top: 2px solid #e2452b;
		clip-path: polygon(0 0, calc(100% - 22px) 0, 100% 22px, 100% 100%, 22px 100%, 0 calc(100% - 22px));
	}

	h1 {
		margin: 0;
		font-size: 2rem;
		font-weight: 700;
		line-height: 1;
		letter-spacing: 0.02em;
		text-shadow: 0 0 18px color-mix(in srgb, #e2452b 45%, transparent);
	}

	.sub {
		margin-top: 6px;
		font-size: 0.85rem;
		color: var(--mf-dim);
	}

	select {
		min-width: 220px;
		padding: 9px 12px;
		font: inherit;
		font-size: 0.85rem;
		color: var(--mf-text);
		background: var(--mf-panel);
		border: 1px solid var(--mf-line-strong);
		cursor: pointer;
	}

	select:focus-visible {
		outline: 2px solid var(--mf-ion);
	}

	.tiers {
		display: grid;
		grid-template-columns: repeat(10, minmax(0, 1fr));
		gap: 4px;
		margin-top: 16px;
	}

	.tierChip {
		padding: 7px 4px 6px;
		text-align: center;
		background: var(--mf-panel);
		border: 1px solid var(--mf-line);
		border-top: 2px solid var(--c);
	}

	.tierChip b {
		display: block;
		font-size: 1.15rem;
		color: var(--c);
		font-variant-numeric: tabular-nums;
	}

	.tierChip span {
		display: block;
		font-size: 0.62rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--mf-dim);
		line-height: 1.15;
	}

	.how {
		margin: 12px auto 0;
		max-width: 80ch;
		font-size: 0.78rem;
		line-height: 1.45;
		color: var(--mf-dim);
		text-align: center;
	}

	.focusHead {
		margin: 22px 4px 8px;
		font-size: 1.2rem;
		font-weight: 700;
	}

	.list {
		display: flex;
		flex-direction: column;
		gap: 7px;
		margin-top: 18px;
	}

	.row {
		display: grid;
		grid-template-columns: 46px minmax(0, 1fr) auto;
		align-items: stretch;
		min-height: 66px;
		color: inherit;
		text-decoration: none;
		background:
			linear-gradient(90deg, color-mix(in srgb, var(--c) 22%, transparent), transparent 45%),
			var(--mf-panel);
		border: 1px solid var(--mf-line);
		transition: border-color 0.15s ease, background-color 0.15s ease;
	}

	.row:hover,
	.row:focus-visible {
		border-color: var(--mf-line-strong);
		background-color: var(--mf-panel-2);
		outline: none;
	}

	.rank {
		display: flex;
		align-items: center;
		justify-content: center;
		padding-right: 6px;
		font-size: 1.25rem;
		font-weight: 700;
		color: #fff;
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.7);
		background: linear-gradient(160deg, var(--c), color-mix(in srgb, var(--c) 30%, #000));
		clip-path: polygon(0 0, 100% 0, 82% 100%, 0 100%);
	}

	.matchup {
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 4px;
		min-width: 0;
		padding: 8px 12px;
	}

	.teams {
		display: flex;
		align-items: center;
		gap: 8px;
		min-width: 0;
		font-weight: 700;
		font-size: 0.98rem;
	}

	.teams img {
		width: 30px;
		height: 30px;
		border-radius: 50%;
		object-fit: cover;
		flex: none;
		border: 1px solid var(--mf-line-strong);
		background: #000;
	}

	.teams .nm {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		min-width: 0;
	}

	.vs {
		flex: none;
		font-size: 0.68rem;
		font-weight: 700;
		letter-spacing: 0.1em;
		color: var(--mf-dim);
	}

	.detail {
		font-size: 0.74rem;
		color: var(--mf-dim);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.side {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		justify-content: center;
		gap: 3px;
		padding: 8px 14px;
		text-align: right;
	}

	.tierName {
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--c);
		white-space: nowrap;
	}

	.score {
		font-size: 1.2rem;
		font-weight: 700;
		color: var(--mf-text);
		font-variant-numeric: tabular-nums;
		line-height: 1;
	}

	.score small {
		font-size: 0.6em;
		font-weight: 500;
		color: var(--mf-dim);
	}

	.rec {
		font-size: 0.72rem;
		color: var(--mf-dim);
		white-space: nowrap;
	}

	.more {
		display: block;
		margin: 16px auto 0;
		padding: 9px 18px;
		font: inherit;
		font-size: 0.8rem;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--mf-ion);
		background: color-mix(in srgb, var(--mf-ion) 10%, transparent);
		border: 1px solid var(--mf-ion);
		cursor: pointer;
		clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px));
	}

	.more:hover,
	.more:focus-visible {
		background: var(--mf-ion);
		color: var(--mf-on-ion);
		outline: none;
	}

	.loading {
		max-width: 420px;
		margin: 60px auto;
		text-align: center;
		color: var(--mf-dim);
	}

	@media (max-width: 760px) {
		.tiers {
			grid-template-columns: repeat(5, minmax(0, 1fr));
		}
	}

	@media (max-width: 600px) {
		.wrap {
			width: calc(100% - 16px);
		}
		h1 {
			font-size: 1.6rem;
		}
		select {
			width: 100%;
		}
		.row {
			grid-template-columns: 38px minmax(0, 1fr) auto;
		}
		.teams {
			font-size: 0.86rem;
			gap: 6px;
		}
		.teams img {
			width: 24px;
			height: 24px;
		}
		.side {
			padding: 8px 10px;
		}
	}
</style>

<div class="wrap">
	<div class="head">
		<div>
			<h1>Hottest Rivalries</h1>
			<div class="sub">Every pairing of current managers, scored from every game since the league moved to Sleeper</div>
		</div>
		<label>
			<span class="sr-only" style="position:absolute;left:-9999px">Show rivalries for</span>
			<select id="rivalryFilter" bind:value={filter}>
				<option value="">All managers</option>
				{#each managers as m}
					<option value={m.id}>{m.team} ({m.name})</option>
				{/each}
			</select>
		</label>
	</div>

	{#if loading}
		<div class="loading">
			<p>Going through every game since the league started...</p>
			<LinearProgress indeterminate />
		</div>
	{:else if error}
		<p class="loading">{error}</p>
	{:else}
		<div class="tiers" aria-label="Rivalries per tier">
			{#each tierCounts as t}
				<div class="tierChip" style="--c: {t.color}"><b>{t.count}</b><span>{t.name}</span></div>
			{/each}
		</div>
		<p class="how">
			Rivalry points: {RIVALRY_POINTS.regular} per regular-season game, {RIVALRY_POINTS.quarterfinal} per Quarterfinal,
			{RIVALRY_POINTS.semifinal} per Semifinal, {RIVALRY_POINTS.championship} per Championship. Any title-game meeting is at
			least Title Clash, and any playoff meeting is at least Grudge Match. Tap a rivalry for the full head-to-head.
		</p>

		{#if focus}
			<div class="focusHead">{focus.team}'s rivals</div>
		{/if}

		<div class="list">
			{#each shown as r (r.a.id + r.b.id)}
				<a class="row" href={link(r)} style="--c: {r.tier.color}">
					<span class="rank">{rankOf(r)}</span>
					<span class="matchup">
						<span class="teams">
							<img src={r.a.avatar} alt="" /><span class="nm">{r.a.team}</span>
							<span class="vs">VS</span>
							<img src={r.b.avatar} alt="" /><span class="nm">{r.b.team}</span>
						</span>
						<span class="detail">{r.tier.reason.split(' · ').slice(1).join(' · ')}</span>
					</span>
					<span class="side">
						<span class="tierName">{r.tier.name}</span>
						<span class="score">{r.tier.score}<small> pts</small></span>
						<span class="rec">{r.winsA === r.winsB ? `Series tied ${record(r)}` : `Head-to-head ${record(r)}`}</span>
					</span>
				</a>
			{/each}
		</div>

		{#if !filter && !showAll && filtered.length > PREVIEW}
			<button type="button" class="more" onclick={() => (showAll = true)}>Show all {filtered.length} rivalries</button>
		{/if}
	{/if}
</div>
