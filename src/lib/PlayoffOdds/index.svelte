<!--
	Playoff Odds + What If
	Simulates the rest of the season (see playoffOdds.js) and lets
	people pick winners of remaining games to see how odds change.
-->
<script>
	import { onMount } from 'svelte';
	import LinearProgress from '@smui/linear-progress';
	import {
		getLeagueRosters,
		getLeagueData,
		getNflState,
		getLeagueMatchups,
		getLeagueTeamManagers,
		loadPlayers,
		waitForAll,
		gotoManager
	} from '$lib/utils/helper';
	import { buildSimInputs, simulateSeason, clinchStatus } from '$lib/utils/helperFunctions/playoffOdds';

	const SIMS = 10000;

	let state = 'loading';
	let errorMessage = '';
	let inputs = null;
	let leagueTeamManagers = null;
	let baseline = {};
	let results = [];
	let status = {};
	let simulating = false;

	let picks = {};
	let selectedWeek = null;

	const teamInfo = (rosterID) => {
		const year = leagueTeamManagers?.currentSeason;
		return leagueTeamManagers?.teamManagersMap?.[year]?.[rosterID]?.team || { name: 'Unknown Team', avatar: '' };
	};

	const run = () => {
		simulating = true;
		// let the "simulating" state paint before the work starts
		setTimeout(() => {
			const res = simulateSeason(inputs, { sims: SIMS, picks });
			results = res.sort(
				(a, b) =>
					b.playoffPct - a.playoffPct ||
					b.projectedWins - a.projectedWins ||
					b.pointsFor - a.pointsFor
			);
			status = Object.fromEntries(clinchStatus(inputs, picks).map((c) => [c.rosterID, c]));
			simulating = false;
		}, 20);
	};

	onMount(async () => {
		try {
			const [rostersData, leagueData, nflState, matchupsData, ltm, playersInfo] = await waitForAll(
				getLeagueRosters(),
				getLeagueData(),
				getNflState(),
				getLeagueMatchups(),
				getLeagueTeamManagers(),
				loadPlayers(null)
			);

			leagueTeamManagers = ltm;

			inputs = buildSimInputs({
				rosters: rostersData.rosters,
				players: playersInfo.players,
				leagueData,
				nflState,
				matchupWeeks: matchupsData.matchupWeeks
			});

			if (!inputs.teams.length) {
				state = 'empty';
				return;
			}

			const base = simulateSeason(inputs, { sims: SIMS });
			baseline = Object.fromEntries(base.map((r) => [r.rosterID, r]));
			selectedWeek = inputs.games[0]?.week ?? null;
			state = 'ready';
			run();
		} catch (err) {
			console.error('[Playoff Odds] Could not build simulation:', err);
			errorMessage = 'Could not load league data from Sleeper. Refresh the page to try again.';
			state = 'error';
		}
	});

	$: weeks = inputs ? [...new Set(inputs.games.map((g) => g.week))] : [];
	$: weekGames = inputs ? inputs.games.filter((g) => g.week === selectedWeek) : [];
	$: pickCount = Object.keys(picks).length;
	$: seasonOver = inputs && !inputs.games.length;

	const togglePick = (game, rosterID) => {
		const next = { ...picks };
		if (next[game.key] === rosterID) delete next[game.key];
		else next[game.key] = rosterID;
		picks = next;
		run();
	};

	const clearPicks = () => {
		picks = {};
		run();
	};

	const pickedInWeek = (week, p) => inputs.games.filter((g) => g.week === week && p[g.key] != null).length;

	const fmtPct = (v) => {
		if (v == null) return '–';
		if (v >= 99.95) return '100%';
		if (v > 0 && v < 0.5) return '<1%';
		if (v < 99.95 && v > 99.4) return '>99%';
		return `${Math.round(v)}%`;
	};

	const fmtRecord = (w, l, t = 0) => `${w}–${l}${t ? `–${t}` : ''}`;

	const delta = (rosterID, field) => {
		if (!pickCount || !baseline[rosterID]) return null;
		const r = results.find((x) => x.rosterID === rosterID);
		if (!r) return null;
		const d = Math.round(r[field] - baseline[rosterID][field]);
		return d === 0 ? null : d;
	};

	const openManager = (rosterID) =>
		gotoManager({ leagueTeamManagers, rosterID: parseInt(rosterID), year: leagueTeamManagers.currentSeason });
</script>

<section class="odds">
	<header class="oddsHeader">
		<h1>Playoff Odds</h1>
		{#if state === 'ready'}
			<p class="sub">
				{SIMS.toLocaleString()} simulated seasons using Sleeper projections and how each team has
				actually scored. Top {inputs.playoffTeams} make the playoffs.
			</p>
		{/if}
	</header>

	{#if state === 'loading'}
		<div class="loading">
			<p>Simulating the season…</p>
			<LinearProgress indeterminate />
		</div>
	{:else if state === 'error'}
		<p class="message">{errorMessage}</p>
	{:else if state === 'empty'}
		<p class="message">No teams found for this season yet.</p>
	{:else}
		<!-- WHAT IF -->
		{#if !seasonOver}
			<div class="whatIf">
				<div class="whatIfHead">
					<h2>What if?</h2>
					<p>Pick winners and watch everyone's odds change.</p>
					{#if pickCount}
						<button class="clear" type="button" onclick={clearPicks}>
							Clear {pickCount} pick{pickCount > 1 ? 's' : ''}
						</button>
					{/if}
				</div>

				<div class="weekChips" role="tablist" aria-label="Week">
					{#each weeks as week}
						{@const picked = pickedInWeek(week, picks)}
						<button
							type="button"
							role="tab"
							class="chip"
							class:active={week === selectedWeek}
							aria-selected={week === selectedWeek}
							onclick={() => (selectedWeek = week)}
						>
							Week {week}{week === inputs.currentWeek ? ' (live)' : ''}
							{#if picked}<span class="chipCount">{picked}</span>{/if}
						</button>
					{/each}
				</div>

				<div class="games">
					{#each weekGames as game (game.key)}
						<div class="game">
							{#each [game.a, game.b] as side, i}
								{@const team = teamInfo(side.id)}
								{@const chosen = picks[game.key] === side.id}
								{@const lost = picks[game.key] != null && !chosen}
								<button
									type="button"
									class="side"
									class:right={i === 1}
									class:chosen
									class:lost
									aria-pressed={chosen}
									onclick={() => togglePick(game, side.id)}
								>
									<img src={team.avatar} alt="" />
									<span class="sideName">{team.name}</span>
									<span class="sideProj">{Math.round(side.mu)}</span>
								</button>
								{#if i === 0}<span class="vs" aria-hidden="true">vs</span>{/if}
							{/each}
						</div>
					{/each}
				</div>
				<p class="hint">Numbers are each team's expected score. Tap a team again to undo.</p>
			</div>
		{/if}

		<!-- ODDS TABLE -->
		<div class="board" class:busy={simulating}>
			<div class="boardHead" aria-hidden="true">
				<span>Team</span>
				<span>Record</span>
				<span>Playoffs</span>
				<span class="colSeeds">Finish 1st → {inputs.teams.length}th</span>
				<span class="colRound">Semis</span>
				<span class="colRound">Final</span>
				<span class="colRound">Title</span>
			</div>

			{#each results as r (r.rosterID)}
				{@const team = teamInfo(r.rosterID)}
				{@const st = status[r.rosterID]}
				{@const d = delta(r.rosterID, 'playoffPct')}
				<div class="row" class:out={st?.eliminated}>
					<button type="button" class="teamCell" onclick={() => openManager(r.rosterID)}>
						<img src={team.avatar} alt="" />
						<span class="teamName">{team.name}</span>
						{#if st?.clinched}
							<span class="badge in">Clinched</span>
						{:else if st?.eliminated}
							<span class="badge outBadge">Eliminated</span>
						{/if}
					</button>

					<div class="recordCell">
						<span class="now">{fmtRecord(r.record.wins, r.record.losses, r.record.ties)}</span>
						<span class="proj">proj {Math.round(r.projectedWins)}–{Math.round(r.projectedLosses)}</span>
					</div>

					<div class="playoffCell">
						<span class="pct">
							{fmtPct(r.playoffPct)}
							{#if d}<span class="delta" class:up={d > 0} class:down={d < 0}>{d > 0 ? '▲' : '▼'}{Math.abs(d)}</span>{/if}
						</span>
						<span class="meter"><span style="width: {r.playoffPct}%"></span></span>
					</div>

					<div class="seeds" title="Chance of each final standings spot">
						{#each r.seedPct as p, place}
							<span
								class="seed"
								class:cut={place === inputs.playoffTeams - 1}
								style="--p: {Math.min(1, p / 40)}"
								title="{place + 1}{place === 0 ? 'st' : place === 1 ? 'nd' : place === 2 ? 'rd' : 'th'}: {fmtPct(p)}"
							></span>
						{/each}
					</div>

					<span class="round">{fmtPct(r.semifinalPct)}</span>
					<span class="round">{fmtPct(r.finalPct)}</span>
					<span class="round title">{fmtPct(r.champPct)}</span>
				</div>
			{/each}
		</div>

		<p class="footnote">
			Semis = wins Round 1 · Final = reaches the Championship · Title = wins it all.
			Clinched and Eliminated are mathematical locks based on wins alone.
		</p>
	{/if}
</section>

<style>
	.odds {
		width: 96%;
		max-width: 1080px;
		margin: 2em auto 5em;
		font-family: 'Chakra Petch', 'Roboto', sans-serif;
		color: var(--mf-text);
		container-type: inline-size;
	}

	.oddsHeader h1 {
		margin: 0.6em 0 0.15em;
		font-size: 2.6rem;
		font-weight: 700;
		text-align: center;
		text-shadow: 0 0 18px var(--mf-ion-glow);
	}

	.sub {
		max-width: 60ch;
		margin: 0 auto 2em;
		text-align: center;
		font-family: 'Roboto', sans-serif;
		font-size: 0.92rem;
		color: var(--mf-dim);
	}

	.loading {
		width: 85%;
		max-width: 500px;
		margin: 80px auto;
	}

	.message {
		text-align: center;
		color: var(--mf-dim);
		margin: 4em 0;
	}

	/* ---------- What if ---------- */

	.whatIf {
		margin-bottom: 2em;
		padding: 18px 18px 14px;
		background: var(--mf-panel);
		border: 1px solid var(--mf-line);
		box-shadow: 0 0 26px -14px var(--mf-ion-glow);
		clip-path: polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 0 100%);
	}

	.whatIfHead {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 4px 14px;
		margin-bottom: 12px;
	}

	.whatIfHead h2 {
		margin: 0;
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--mf-ion);
	}

	.whatIfHead p {
		margin: 0;
		flex: 1;
		font-family: 'Roboto', sans-serif;
		font-size: 0.88rem;
		color: var(--mf-dim);
	}

	.clear {
		font: inherit;
		font-weight: 700;
		font-size: 0.85rem;
		padding: 6px 12px;
		color: var(--mf-on-ion);
		background: var(--mf-ion);
		border: none;
		cursor: pointer;
		clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px));
	}

	.weekChips {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin-bottom: 14px;
	}

	.chip {
		position: relative;
		font: inherit;
		font-size: 0.85rem;
		font-weight: 600;
		padding: 5px 11px;
		color: var(--mf-dim);
		background: transparent;
		border: 1px solid var(--mf-line);
		cursor: pointer;
	}

	.chip:hover {
		color: var(--mf-text);
		border-color: var(--mf-line-strong);
	}

	.chip.active {
		color: var(--mf-ion);
		border-color: var(--mf-ion);
		box-shadow: inset 0 0 12px -4px var(--mf-ion-glow);
	}

	.chipCount {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 16px;
		height: 16px;
		margin-left: 5px;
		padding: 0 4px;
		font-size: 0.7rem;
		color: var(--mf-on-ion);
		background: var(--mf-ion);
		border-radius: 8px;
	}

	.games {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 8px 14px;
	}

	.game {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
		align-items: center;
		gap: 6px;
	}

	.vs {
		font-size: 0.75rem;
		color: var(--mf-dim);
	}

	.side {
		display: grid;
		grid-template-columns: 26px minmax(0, 1fr) auto;
		align-items: center;
		gap: 7px;
		min-width: 0;
		padding: 6px 8px;
		font: inherit;
		color: var(--mf-text);
		text-align: left;
		background: var(--mf-panel-2);
		border: 1px solid var(--mf-line);
		cursor: pointer;
		transition: border-color 0.15s ease, opacity 0.15s ease;
	}

	.side.right {
		grid-template-columns: auto minmax(0, 1fr) 26px;
		text-align: right;
	}

	.side.right img {
		order: 3;
	}

	.side.right .sideProj {
		order: 1;
	}

	.side.right .sideName {
		order: 2;
	}

	.side:hover {
		border-color: var(--mf-line-strong);
	}

	.side.chosen {
		border-color: var(--mf-ion);
		background: color-mix(in srgb, var(--mf-ion) 16%, var(--mf-panel-2));
		box-shadow: 0 0 14px -4px var(--mf-ion-glow);
	}

	.side.lost {
		opacity: 0.45;
	}

	.side img {
		width: 26px;
		height: 26px;
		border-radius: 50%;
		object-fit: cover;
	}

	.sideName {
		min-width: 0;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		font-size: 0.88rem;
		font-weight: 600;
	}

	.sideProj {
		font-size: 0.8rem;
		font-variant-numeric: tabular-nums;
		color: var(--mf-dim);
	}

	.hint {
		margin: 10px 0 0;
		font-family: 'Roboto', sans-serif;
		font-size: 0.78rem;
		color: var(--mf-dim);
	}

	/* ---------- Odds board ---------- */

	.board {
		background:
			linear-gradient(var(--mf-grid) 1px, transparent 1px) 0 0 / 100% 28px,
			var(--mf-panel);
		border: 1px solid var(--mf-line);
		box-shadow: 0 0 26px -14px var(--mf-ion-glow);
		transition: opacity 0.15s ease;
	}

	.board.busy {
		opacity: 0.6;
	}

	.boardHead,
	.row {
		display: grid;
		grid-template-columns: minmax(0, 2.4fr) 0.9fr 1.3fr 1.6fr 0.55fr 0.55fr 0.55fr;
		align-items: center;
		gap: 12px;
		padding: 0 14px;
	}

	.boardHead {
		padding-top: 10px;
		padding-bottom: 10px;
		font-size: 0.78rem;
		font-weight: 700;
		color: var(--mf-ion);
		background: var(--mf-panel-2);
		border-bottom: 1px solid var(--mf-line-strong);
	}

	.boardHead .colRound {
		text-align: center;
	}

	.row {
		min-height: 56px;
		border-top: 1px solid var(--mf-line);
	}

	.row:first-of-type {
		border-top: none;
	}

	.row.out {
		opacity: 0.55;
	}

	.teamCell {
		display: flex;
		align-items: center;
		gap: 10px;
		min-width: 0;
		padding: 0;
		font: inherit;
		color: inherit;
		text-align: left;
		background: none;
		border: none;
		cursor: pointer;
	}

	.teamCell img {
		flex: none;
		width: 34px;
		height: 34px;
		border-radius: 50%;
		object-fit: cover;
		border: 1px solid var(--mf-line-strong);
	}

	.teamName {
		min-width: 0;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		font-weight: 600;
	}

	.teamCell:hover .teamName {
		color: var(--mf-ion);
	}

	.badge {
		flex: none;
		padding: 2px 6px;
		font-size: 0.68rem;
		font-weight: 700;
		border: 1px solid currentColor;
	}

	.badge.in {
		color: var(--mf-ion);
		box-shadow: 0 0 10px -2px var(--mf-ion-glow);
	}

	.badge.outBadge {
		color: var(--mf-dim);
	}

	.recordCell {
		display: flex;
		flex-direction: column;
		line-height: 1.15;
	}

	.now {
		font-weight: 700;
		font-variant-numeric: tabular-nums;
	}

	.proj {
		font-size: 0.75rem;
		color: var(--mf-dim);
	}

	.playoffCell {
		display: flex;
		flex-direction: column;
		gap: 5px;
	}

	.pct {
		font-size: 1.05rem;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
		color: var(--mf-ion);
	}

	.delta {
		margin-left: 6px;
		font-size: 0.75rem;
	}

	.delta.up {
		color: var(--mf-up);
	}

	.delta.down {
		color: var(--mf-down);
	}

	.meter {
		position: relative;
		height: 4px;
		background: color-mix(in srgb, var(--mf-dim) 22%, transparent);
		overflow: hidden;
	}

	.meter span {
		position: absolute;
		inset: 0 auto 0 0;
		background: linear-gradient(90deg, var(--mf-plasma), var(--mf-ion));
		box-shadow: 0 0 8px var(--mf-ion-glow);
		transition: width 0.4s ease;
	}

	.seeds {
		display: grid;
		grid-template-columns: repeat(16, minmax(0, 1fr));
		gap: 2px;
		height: 18px;
	}

	.seed {
		background: color-mix(in srgb, var(--mf-ion) calc(var(--p) * 100%), color-mix(in srgb, var(--mf-dim) 12%, transparent));
	}

	.seed.cut {
		box-shadow: 2px 0 0 0 var(--mf-plasma);
	}

	.round {
		text-align: center;
		font-variant-numeric: tabular-nums;
		color: var(--mf-text);
	}

	.round.title {
		font-weight: 700;
		color: #d9a62e;
	}

	.footnote {
		margin: 12px 4px 0;
		font-family: 'Roboto', sans-serif;
		font-size: 0.78rem;
		color: var(--mf-dim);
	}

	@media (prefers-reduced-motion: reduce) {
		.meter span,
		.board {
			transition: none;
		}
	}

	/* ---------- narrow: phones / small windows ---------- */

	@container (max-width: 760px) {
		.games {
			grid-template-columns: minmax(0, 1fr);
		}

		.boardHead {
			display: none;
		}

		.row {
			grid-template-columns: minmax(0, 1fr) auto auto;
			grid-template-areas:
				'team team team'
				'record playoff title'
				'seeds seeds seeds';
			gap: 6px 14px;
			padding: 12px 12px;
		}

		.teamCell {
			grid-area: team;
		}

		.recordCell {
			grid-area: record;
		}

		.playoffCell {
			grid-area: playoff;
			min-width: 110px;
		}

		.seeds {
			grid-area: seeds;
			height: 10px;
		}

		.round {
			display: none;
		}

		.round.title {
			display: block;
			grid-area: title;
		}

		.round.title::before {
			content: 'Title ';
			font-weight: 400;
			font-size: 0.75rem;
			color: var(--mf-dim);
		}
	}
</style>
