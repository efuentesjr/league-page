<script>
	import { onMount } from 'svelte';
	import LinearProgress from '@smui/linear-progress';
	import { leagueID } from '$lib/utils/leagueInfo';
	import { getLeagueTeamManagers, getLeagueData, loadPlayers, waitForAll, getUpcomingDraft } from '$lib/utils/helper';
	import { getAvatarFromTeamManagers, getTeamNameFromTeamManagers } from '$lib/utils/helperFunctions/universalFunctions';
	import { getTradeGrades } from '$lib/utils/helperFunctions/tradeGradesClient';

	/*
	 * Trade analyzer: pick two teams, choose what each side gives, and compare
	 * dynasty market value (DynastyProcess superflex values, weekly).
	 * Next year's picks are valued by projected slot from Lottery Watch
	 * (early 1-5, mid 6-11, late 12-16 in each round). FAAB counts 1 point per dollar.
	 */
	const YEARS = 3;
	const FAAB_RATE = 1;
	const ORD = ['', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th'];

	let loading = true;
	let error = null;
	let ltm, rounds = 5, cap = 999;
	let rosterIDs = [];
	let rosterPlayers = {}; // rosterID -> [playerID]
	let faabLeft = {}; // rosterID -> balance
	let players = {};
	let values = { players: {}, picks: {}, updated: null };
	let seasons = [];
	let pickOwner = {}; // season -> round -> original roster -> current owner
	let slotOf = null; // rosterID -> projected slot in next draft
	let grades = null;
	let rosterManager = {}; // rosterID -> managerID

	let sideA = '', sideB = '';
	let picked = { A: new Set(), B: new Set() };
	let faab = { A: 0, B: 0 };
	let search = { A: '', B: '' };

	const name = (id) => getTeamNameFromTeamManagers(ltm, id);
	const avatar = (id) => getAvatarFromTeamManagers(ltm, id);

	onMount(async () => {
		try {
			const [teamManagers, league, playersInfo, rosters, traded, drafts, vals] = await waitForAll(
				getLeagueTeamManagers(),
				getLeagueData(),
				loadPlayers(null),
				fetch(`https://api.sleeper.app/v1/league/${leagueID}/rosters`).then((r) => r.json()),
				fetch(`https://api.sleeper.app/v1/league/${leagueID}/traded_picks`).then((r) => r.json()),
				fetch(`https://api.sleeper.app/v1/league/${leagueID}/drafts`).then((r) => r.json()),
				fetch('/api/trade_values').then((r) => r.json())
			);
			ltm = teamManagers;
			players = playersInfo.players || {};
			values = vals || values;
			rounds = Number(league.settings?.draft_rounds) || 5;
			cap = Number(league.settings?.waiver_budget) || 0;

			for (const r of rosters) {
				rosterPlayers[r.roster_id] = (r.players || []).filter(Boolean);
				faabLeft[r.roster_id] = Math.max(0, cap - (Number(r.settings?.waiver_budget_used) || 0));
				rosterManager[r.roster_id] = r.owner_id;
			}
			rosterIDs = rosters.map((r) => r.roster_id).sort((a, b) => name(a).localeCompare(name(b)));

			const done = (drafts || []).filter((d) => d.status === 'complete').map((d) => Number(d.season));
			const start = done.length ? Math.max(...done) + 1 : Number(league.season);
			seasons = Array.from({ length: YEARS }, (_, i) => String(start + i));
			const map = {};
			for (const s of seasons) {
				map[s] = {};
				for (let r = 1; r <= rounds; r++) {
					map[s][r] = {};
					for (const id of rosterIDs) map[s][r][id] = id;
				}
			}
			for (const p of traded || []) if (map[p.season]?.[p.round]) map[p.season][p.round][p.roster_id] = p.owner_id;
			pickOwner = map;
		} catch (err) {
			console.error('[Trade Analyzer]', err);
			error = 'Could not load rosters or values. Refresh to try again.';
		}
		loading = false;

		// slower extras: projected draft slots and trade grade records
		getUpcomingDraft()
			.then((d) => {
				if (String(d?.year) === seasons[0] && d?.draftOrder?.length) {
					slotOf = Object.fromEntries(d.draftOrder.filter(Boolean).map((id, i) => [Number(id), i + 1]));
				}
			})
			.catch(() => {});
		getTradeGrades().then((g) => (grades = g)).catch(() => {});
	});

	/* ---------- valuing ---------- */
	const tierFor = (slot) => (slot <= 5 ? 'Early' : slot <= 11 ? 'Mid' : 'Late');
	const pickValue = (season, round, orig, slots) => {
		const ord = ORD[round] || `${round}th`;
		const P = values.picks || {};
		if (season === seasons[0] && slots?.[orig]) {
			const v = P[`${season} ${tierFor(slots[orig])} ${ord}`];
			if (v != null) return v;
		}
		if (P[`${season} ${ord}`] != null) return P[`${season} ${ord}`];
		// furthest year DynastyProcess doesn't list yet: use the latest year it does
		const years = Object.keys(P).map((k) => Number(k.slice(0, 4))).filter((y) => y && y <= Number(season));
		for (const y of [...new Set(years)].sort((a, b) => b - a)) if (P[`${y} ${ord}`] != null) return P[`${y} ${ord}`];
		return 0;
	};

	const assetsFor = (rid, slots) => {
		if (!rid) return [];
		const list = [];
		for (const pid of rosterPlayers[rid] || []) {
			const p = players[pid];
			if (!p) continue;
			list.push({
				key: `pl:${pid}`,
				kind: 'player',
				label: `${p.fn} ${p.ln}`,
				sub: `${p.pos}${p.t ? ` · ${p.t}` : ''}`,
				pos: p.pos,
				value: values.players?.[pid] ?? 0
			});
		}
		for (const s of seasons) {
			for (let r = 1; r <= rounds; r++) {
				for (const orig of rosterIDs) {
					if (pickOwner[s]?.[r]?.[orig] !== Number(rid)) continue;
					const slot = s === seasons[0] && slots?.[orig];
					list.push({
						key: `pk:${s}:${r}:${orig}`,
						kind: 'pick',
						label: `${s} ${ORD[r]}`,
						sub: `${orig === Number(rid) ? 'Own' : name(orig)}${slot ? ` · projected #${slot}` : ''}`,
						from: orig,
						value: pickValue(s, r, orig, slots)
					});
				}
			}
		}
		return list.sort((a, b) => b.value - a.value);
	};

	$: assetsA = assetsFor(sideA, slotOf);
	$: assetsB = assetsFor(sideB, slotOf);

	const chosen = (assets, set) => assets.filter((a) => set.has(a.key));
	$: givesA = chosen(assetsA, picked.A);
	$: givesB = chosen(assetsB, picked.B);
	$: totalA = givesA.reduce((n, a) => n + a.value, 0) + (Number(faab.A) || 0) * FAAB_RATE;
	$: totalB = givesB.reduce((n, a) => n + a.value, 0) + (Number(faab.B) || 0) * FAAB_RATE;

	// side A *receives* what B gives, and vice versa
	$: getsA = totalB;
	$: getsB = totalA;
	$: hasTrade = (givesA.length || faab.A > 0) && (givesB.length || faab.B > 0);
	$: diffPct = Math.max(getsA, getsB) > 0 ? Math.abs(getsA - getsB) / Math.max(getsA, getsB) : 0;
	$: winner = getsA === getsB ? null : getsA > getsB ? 'A' : 'B';
	$: verdict = !hasTrade
		? null
		: diffPct < 0.1
			? { text: 'Even trade', tone: 'even', detail: `Within ${Math.round(diffPct * 100)}% either way.` }
			: diffPct < 0.25
				? { text: `Slight edge: ${name(winner === 'A' ? sideA : sideB)}`, tone: 'edge', detail: `Gets ${Math.round(diffPct * 100)}% more value.` }
				: { text: `Clear win: ${name(winner === 'A' ? sideA : sideB)}`, tone: 'win', detail: `Gets ${Math.round(diffPct * 100)}% more value.` };

	const toggle = (side, key) => {
		const set = new Set(picked[side]);
		set.has(key) ? set.delete(key) : set.add(key);
		picked = { ...picked, [side]: set };
	};
	const setTeam = (side, val) => {
		picked = { ...picked, [side]: new Set() };
		faab = { ...faab, [side]: 0 };
		search = { ...search, [side]: '' };
	};
	const clampFaab = (side, rid) => {
		const max = faabLeft[rid] || 0;
		const v = Math.max(0, Math.min(max, Math.round(Number(faab[side]) || 0)));
		faab = { ...faab, [side]: v };
	};
	const reset = () => {
		picked = { A: new Set(), B: new Set() };
		faab = { A: 0, B: 0 };
	};

	const filterList = (assets, q) => {
		const t = q.trim().toLowerCase();
		return t ? assets.filter((a) => (a.label + ' ' + a.sub).toLowerCase().includes(t)) : assets;
	};

	const record = (rid) => {
		const m = grades?.managers?.[rosterManager[rid]];
		if (!m || !m.trades) return null;
		return `${m.won}-${m.lost}-${m.even} in graded trades`;
	};
	const fmt = (n) => Math.round(n).toLocaleString();
	$: barA = getsA + getsB > 0 ? (getsA / (getsA + getsB)) * 100 : 50;
</script>

<style>
	.wrap {
		width: 96%;
		max-width: 1200px;
		margin: 0 auto;
		padding: 22px 0 50px;
		font-family: 'Chakra Petch', 'Roboto', Arial, sans-serif;
		color: var(--mf-text);
	}

	.head {
		padding: 20px 20px 18px;
		background:
			linear-gradient(var(--mf-grid) 1px, transparent 1px) 0 0 / 100% 28px,
			linear-gradient(90deg, var(--mf-grid) 1px, transparent 1px) 0 0 / 28px 100%,
			radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--mf-plasma) 22%, transparent), transparent 60%),
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
		letter-spacing: 0.02em;
		text-shadow: 0 0 18px var(--mf-line-strong);
	}

	.sub {
		margin-top: 6px;
		font-size: 0.85rem;
		color: var(--mf-dim);
	}

	/* result */
	.result {
		margin-top: 18px;
		padding: 16px 18px;
		background: var(--mf-panel);
		border: 1px solid var(--mf-line);
		border-left: 3px solid var(--tone, var(--mf-line-strong));
	}

	.result.even { --tone: var(--mf-ion); }
	.result.edge { --tone: #e0b03a; }
	.result.win { --tone: var(--mf-up); }

	.verdict {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 12px;
		flex-wrap: wrap;
	}

	.verdict strong {
		font-size: 1.4rem;
		color: var(--tone, var(--mf-text));
	}

	.verdict span {
		font-size: 0.85rem;
		color: var(--mf-dim);
	}

	.scale {
		display: flex;
		height: 12px;
		margin: 12px 0 6px;
		background: var(--mf-panel-2);
		overflow: hidden;
	}

	.scale .a {
		background: linear-gradient(90deg, color-mix(in srgb, var(--mf-ion) 50%, var(--mf-panel)), var(--mf-ion));
		transition: width 0.3s ease;
	}

	.scale .b {
		flex: 1;
		background: linear-gradient(90deg, var(--mf-plasma), color-mix(in srgb, var(--mf-plasma) 50%, var(--mf-panel)));
	}

	.scaleLabels {
		display: flex;
		justify-content: space-between;
		gap: 10px;
		font-size: 0.8rem;
		color: var(--mf-dim);
	}

	.scaleLabels b {
		color: var(--mf-text);
		font-variant-numeric: tabular-nums;
	}

	.placeholder {
		color: var(--mf-dim);
		font-size: 0.9rem;
	}

	.resetBtn {
		padding: 6px 12px;
		font: inherit;
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--mf-dim);
		background: none;
		border: 1px solid var(--mf-line-strong);
		cursor: pointer;
	}

	.resetBtn:hover {
		color: var(--mf-text);
	}

	/* sides */
	.sides {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 16px;
		margin-top: 16px;
	}

	.side {
		background: var(--mf-panel);
		border: 1px solid var(--mf-line);
		border-top: 2px solid var(--sideColor);
		min-width: 0;
	}

	.side.A { --sideColor: var(--mf-ion); }
	.side.B { --sideColor: var(--mf-plasma); }

	.sideHead {
		display: grid;
		grid-template-columns: 40px minmax(0, 1fr);
		gap: 10px;
		align-items: center;
		padding: 12px;
		background: var(--mf-panel-2);
		border-bottom: 1px solid var(--mf-line);
	}

	.sideHead img,
	.sideHead .blank {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		object-fit: cover;
		border: 1px solid var(--sideColor);
		background: var(--mf-bg);
	}

	select,
	input[type='number'],
	input[type='search'] {
		width: 100%;
		box-sizing: border-box;
		padding: 8px 10px;
		font: inherit;
		font-size: 0.88rem;
		color: var(--mf-text);
		background: var(--mf-bg);
		border: 1px solid var(--mf-line-strong);
	}

	select:focus-visible,
	input:focus-visible {
		outline: 2px solid var(--mf-ion);
	}

	.rec {
		margin-top: 4px;
		font-size: 0.72rem;
		color: var(--mf-dim);
	}

	.gives {
		padding: 10px 12px;
		border-bottom: 1px solid var(--mf-line);
	}

	.label {
		display: flex;
		justify-content: space-between;
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--mf-dim);
		margin-bottom: 6px;
	}

	.label b {
		color: var(--sideColor);
		font-size: 1.05em;
		letter-spacing: 0.04em;
	}

	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 5px;
		min-height: 28px;
	}

	.chip {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 4px 8px;
		font: inherit;
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--mf-text);
		background: color-mix(in srgb, var(--sideColor) 14%, var(--mf-panel-2));
		border: 1px solid color-mix(in srgb, var(--sideColor) 45%, transparent);
		cursor: pointer;
	}

	.chip small {
		color: var(--mf-dim);
		font-weight: 500;
	}

	.chip .x {
		color: var(--mf-dim);
	}

	.empty {
		font-size: 0.8rem;
		color: var(--mf-dim);
		font-style: italic;
		padding-top: 4px;
	}

	.faabRow {
		display: grid;
		grid-template-columns: auto 110px auto;
		align-items: center;
		gap: 8px;
		margin-top: 8px;
		font-size: 0.8rem;
		color: var(--mf-dim);
	}

	.list {
		max-height: 420px;
		overflow-y: auto;
	}

	.searchBox {
		padding: 8px 12px;
		border-bottom: 1px solid var(--mf-line);
	}

	.asset {
		display: grid;
		grid-template-columns: 22px minmax(0, 1fr) auto;
		align-items: center;
		gap: 10px;
		width: 100%;
		padding: 7px 12px;
		font: inherit;
		text-align: left;
		color: var(--mf-text);
		background: none;
		border: 0;
		border-bottom: 1px solid var(--mf-line);
		cursor: pointer;
	}

	.asset:hover,
	.asset:focus-visible {
		background: var(--mf-panel-2);
		outline: none;
	}

	.asset.on {
		background: color-mix(in srgb, var(--sideColor) 12%, var(--mf-panel));
	}

	.box {
		width: 16px;
		height: 16px;
		border: 1px solid var(--mf-line-strong);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.75rem;
		color: var(--mf-on-ion);
	}

	.asset.on .box {
		background: var(--sideColor);
		border-color: var(--sideColor);
	}

	.aName {
		min-width: 0;
		font-size: 0.88rem;
		font-weight: 600;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.aName small {
		display: block;
		font-size: 0.72rem;
		font-weight: 500;
		color: var(--mf-dim);
	}

	.aName .pick {
		color: #e5b52a;
	}

	.aVal {
		font-size: 0.85rem;
		font-weight: 700;
		color: var(--mf-ion);
		font-variant-numeric: tabular-nums;
	}

	.aVal.none {
		color: var(--mf-dim);
		font-weight: 500;
	}

	.note {
		max-width: 85ch;
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

	@media (max-width: 760px) {
		.sides {
			grid-template-columns: minmax(0, 1fr);
		}
	}

	@media (max-width: 600px) {
		.wrap { width: calc(100% - 16px); }
		h1 { font-size: 1.6rem; }
	}
</style>

<div class="wrap">
	<div class="head">
		<h1>Trade Analyzer</h1>
		<div class="sub">Pick two teams and what each side gives up. Values are dynasty superflex market values{values.updated ? `, updated ${values.updated}` : ''}.</div>
	</div>

	{#if loading}
		<div class="loading">
			<p>Loading rosters, picks and values...</p>
			<LinearProgress indeterminate />
		</div>
	{:else if error}
		<p class="loading">{error}</p>
	{:else}
		<div class="result {verdict?.tone ?? ''}">
			{#if verdict}
				<div class="verdict">
					<strong>{verdict.text}</strong>
					<span>{verdict.detail} <button type="button" class="resetBtn" onclick={reset}>Clear</button></span>
				</div>
				<div class="scale" aria-hidden="true"><span class="a" style="width: {barA}%"></span><span class="b"></span></div>
				<div class="scaleLabels">
					<span>{name(sideA)} gets <b>{fmt(getsA)}</b></span>
					<span>{name(sideB)} gets <b>{fmt(getsB)}</b></span>
				</div>
			{:else}
				<div class="placeholder">Choose a team on each side, then tap players, picks or add FAAB to build the trade.</div>
			{/if}
		</div>

		<div class="sides">
			{#each [['A', sideA, assetsA, givesA, totalA], ['B', sideB, assetsB, givesB, totalB]] as [side, rid, assets, gives, total] (side)}
				<div class="side {side}">
					<div class="sideHead">
						{#if rid}<img src={avatar(rid)} alt="" />{:else}<span class="blank"></span>{/if}
						<div>
							<select
								id="team{side}"
								value={rid}
								onchange={(e) => {
									const v = e.currentTarget.value ? Number(e.currentTarget.value) : '';
									if (side === 'A') sideA = v; else sideB = v;
									setTeam(side, v);
								}}
							>
								<option value="">{side === 'A' ? 'Team 1' : 'Team 2'}: choose a team</option>
								{#each rosterIDs as id}
									<option value={id} disabled={id === (side === 'A' ? sideB : sideA)}>{name(id)}</option>
								{/each}
							</select>
							{#if rid && record(rid)}<div class="rec">{record(rid)}</div>{/if}
						</div>
					</div>

					{#if rid}
						<div class="gives">
							<div class="label"><span>{name(rid)} gives</span><b>{fmt(total)}</b></div>
							<div class="chips">
								{#each gives as a (a.key)}
									<button type="button" class="chip" onclick={() => toggle(side, a.key)} aria-label="Remove {a.label}">
										{a.label} <small>{a.value ? fmt(a.value) : '—'}</small><span class="x">×</span>
									</button>
								{:else}
									{#if !faab[side]}<span class="empty">Nothing yet</span>{/if}
								{/each}
							</div>
							<div class="faabRow">
								<label for="faab{side}">FAAB $</label>
								<input
									id="faab{side}"
									type="number"
									min="0"
									max={faabLeft[rid] || 0}
									step="1"
									bind:value={faab[side]}
									onblur={() => clampFaab(side, rid)}
								/>
								<span>of ${faabLeft[rid] ?? 0} available</span>
							</div>
						</div>
						<div class="searchBox">
							<input id="search{side}" type="search" placeholder="Search players or picks" bind:value={search[side]} />
						</div>
						<div class="list">
							{#each filterList(assets, search[side]) as a (a.key)}
								<button type="button" class="asset" class:on={picked[side].has(a.key)} onclick={() => toggle(side, a.key)} aria-pressed={picked[side].has(a.key)}>
									<span class="box">{picked[side].has(a.key) ? '✓' : ''}</span>
									<span class="aName"><span class:pick={a.kind === 'pick'}>{a.label}</span><small>{a.sub}</small></span>
									<span class="aVal" class:none={!a.value}>{a.value ? fmt(a.value) : '—'}</span>
								</button>
							{/each}
						</div>
					{/if}
				</div>
			{/each}
		</div>

		<p class="note">
			Player values come from DynastyProcess's weekly superflex ratings; players without a market value show "—".
			{seasons[0]} picks are valued by projected slot from Lottery Watch (picks 1–5 early, 6–11 mid, 12–16 late in each round){slotOf ? '' : ' once the projection finishes loading'}.
			Later picks use a round value; {seasons[2]} uses the {seasons[1]} values until DynastyProcess publishes them.
			FAAB counts {FAAB_RATE} point per dollar (about an early 3rd per $100). It's a market guide, not a verdict: your Trade Grades judge trades afterward by points actually scored.
		</p>
	{/if}
</div>
