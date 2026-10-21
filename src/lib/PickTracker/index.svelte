<script>
	import { onMount } from 'svelte';
	import LinearProgress from '@smui/linear-progress';
	import { leagueID } from '$lib/utils/leagueInfo';
	import { getLeagueTeamManagers, getLeagueData, waitForAll, gotoManager } from '$lib/utils/helper';
	import { getAvatarFromTeamManagers, getTeamNameFromTeamManagers } from '$lib/utils/helperFunctions/universalFunctions';

	/*
	 * Future draft pick ownership, straight from Sleeper's traded_picks.
	 * Shows the next three drafts (the most the constitution lets you trade).
	 * A pick nobody has traded still belongs to its original team.
	 */
	const YEARS_SHOWN = 3;

	let loading = true;
	let error = null;
	let leagueTeamManagers = null;
	let seasons = [];
	let rounds = 5;
	let rosterIDs = [];
	let owner = {}; // owner[season][round][originalRosterID] = current owner roster ID
	let view = 'team';

	const name = (id) => getTeamNameFromTeamManagers(leagueTeamManagers, id);
	const avatar = (id) => getAvatarFromTeamManagers(leagueTeamManagers, id);
	const short = (id) => {
		const n = String(name(id) || '');
		const words = n.replace(/[^\p{L}\p{N}\s]/gu, '').trim().split(/\s+/).filter(Boolean);
		return words.length > 1 ? words.map((w) => w[0]).join('').slice(0, 4).toUpperCase() : n.slice(0, 4).toUpperCase();
	};

	onMount(async () => {
		try {
			const [ltm, league, traded, drafts] = await waitForAll(
				getLeagueTeamManagers(),
				getLeagueData(),
				fetch(`https://api.sleeper.app/v1/league/${leagueID}/traded_picks`).then((r) => r.json()),
				fetch(`https://api.sleeper.app/v1/league/${leagueID}/drafts`).then((r) => r.json())
			);
			leagueTeamManagers = ltm;
			rounds = Number(league.settings?.draft_rounds) || 5;

			// first future draft: the year after the latest completed draft
			const done = (drafts || []).filter((d) => d.status === 'complete').map((d) => Number(d.season));
			const start = done.length ? Math.max(...done) + 1 : Number(league.season);
			seasons = Array.from({ length: YEARS_SHOWN }, (_, i) => String(start + i));

			rosterIDs = Object.keys(ltm.teamManagersMap[ltm.currentSeason]).map(Number).sort((a, b) => a - b);

			const map = {};
			for (const s of seasons) {
				map[s] = {};
				for (let r = 1; r <= rounds; r++) {
					map[s][r] = {};
					for (const id of rosterIDs) map[s][r][id] = id;
				}
			}
			for (const p of traded || []) {
				if (map[p.season]?.[p.round]) map[p.season][p.round][p.roster_id] = p.owner_id;
			}
			owner = map;
		} catch (err) {
			console.error('[Pick Tracker]', err);
			error = 'Could not load picks from Sleeper. Refresh to try again.';
		}
		loading = false;
	});

	// picks each team holds now, and the ones it has traded away
	const capitalWeight = (round) => Math.max(1, rounds + 1 - round);
	$: teams = rosterIDs.map((id) => {
		const held = [];
		const gone = [];
		let capital = 0;
		for (const s of seasons) {
			for (let r = 1; r <= rounds; r++) {
				for (const orig of rosterIDs) {
					const cur = owner[s]?.[r]?.[orig];
					if (cur === id) {
						held.push({ season: s, round: r, from: orig, acquired: orig !== id });
						capital += capitalWeight(r);
					} else if (orig === id && cur !== id) {
						gone.push({ season: s, round: r, to: cur });
					}
				}
			}
		}
		return {
			id,
			held,
			gone,
			capital,
			firsts: held.filter((p) => p.round === 1).length,
			acquired: held.filter((p) => p.acquired).length
		};
	}).sort((a, b) => b.capital - a.capital || b.firsts - a.firsts);

	$: maxCapital = Math.max(1, ...teams.map((t) => t.capital));
	$: totalTraded = seasons.reduce(
		(n, s) => n + rosterIDs.reduce((m, orig) => m + Array.from({ length: rounds }, (_, i) => owner[s]?.[i + 1]?.[orig] !== orig).filter(Boolean).length, 0),
		0
	);
	const bySeason = (list, s) => list.filter((p) => p.season === s).sort((a, b) => a.round - b.round);
	const roundLabel = (r) => ['', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th'][r] || `${r}th`;
</script>

<style>
	.picks {
		width: 96%;
		max-width: 1300px;
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
			radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--mf-plasma) 22%, transparent), transparent 60%),
			var(--mf-bg);
		border: 1px solid var(--mf-line);
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

	.sub strong {
		color: var(--mf-ion);
	}

	.segment {
		display: inline-flex;
		border: 1px solid var(--mf-line-strong);
		clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px));
	}

	.segment button {
		padding: 8px 14px;
		font: inherit;
		font-size: 0.78rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--mf-ion);
		background: var(--mf-panel);
		border: 0;
		cursor: pointer;
	}

	.segment button + button {
		border-left: 1px solid var(--mf-line-strong);
	}

	.segment button.on {
		background: var(--mf-ion);
		color: var(--mf-on-ion);
	}

	.note {
		max-width: 80ch;
		margin: 14px auto 0;
		font-size: 0.8rem;
		line-height: 1.45;
		color: var(--mf-dim);
		text-align: center;
	}

	.loading {
		max-width: 420px;
		margin: 60px auto;
		color: var(--mf-dim);
		text-align: center;
	}

	/* ---------- by team ---------- */
	.teamGrid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 380px), 1fr));
		gap: 14px;
		margin-top: 20px;
	}

	.teamCard {
		background: var(--mf-panel);
		border: 1px solid var(--mf-line);
		border-top: 2px solid var(--mf-ion);
	}

	.teamHead {
		display: grid;
		grid-template-columns: 40px minmax(0, 1fr) auto;
		align-items: center;
		gap: 10px;
		padding: 10px 12px;
		background: var(--mf-panel-2);
		border-bottom: 1px solid var(--mf-line);
		cursor: pointer;
	}

	.teamHead:hover .teamName {
		color: var(--mf-ion);
	}

	.av {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		object-fit: cover;
		border: 1px solid var(--mf-line-strong);
		background: #000;
	}

	.teamName {
		font-weight: 700;
		font-size: 1.02rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.capital {
		height: 4px;
		margin-top: 6px;
		background: color-mix(in srgb, var(--mf-dim) 22%, transparent);
	}

	.capital span {
		display: block;
		height: 100%;
		background: linear-gradient(90deg, var(--mf-plasma), var(--mf-ion));
	}

	.counts {
		text-align: right;
		font-size: 0.75rem;
		color: var(--mf-dim);
		line-height: 1.25;
	}

	.counts strong {
		display: block;
		font-size: 1.15rem;
		color: var(--mf-ion);
	}

	.yearRow {
		display: grid;
		grid-template-columns: 46px minmax(0, 1fr);
		gap: 8px;
		align-items: start;
		padding: 8px 12px;
		border-bottom: 1px solid var(--mf-line);
	}

	.yearRow:last-child {
		border-bottom: 0;
	}

	.year {
		font-weight: 700;
		color: var(--mf-dim);
		padding-top: 4px;
	}

	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 5px;
	}

	.chip {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		padding: 3px 7px;
		font-size: 0.78rem;
		font-weight: 700;
		background: var(--mf-panel-2);
		border: 1px solid var(--mf-line);
		white-space: nowrap;
	}

	.chip.r1 {
		border-color: color-mix(in srgb, #e5b52a 60%, transparent);
		color: #e5b52a;
	}

	.chip.acq {
		background: color-mix(in srgb, var(--mf-ion) 10%, var(--mf-panel-2));
	}

	.chip img {
		width: 16px;
		height: 16px;
		border-radius: 50%;
		object-fit: cover;
	}

	.chip .via {
		font-weight: 500;
		color: var(--mf-dim);
	}

	.chip.gone {
		opacity: 0.55;
		text-decoration: line-through;
		text-decoration-color: var(--mf-down);
	}

	.none {
		font-size: 0.78rem;
		color: var(--mf-dim);
		font-style: italic;
		padding-top: 3px;
	}

	/* ---------- grid ---------- */
	.gridWrap {
		margin-top: 20px;
		overflow-x: auto;
		border: 1px solid var(--mf-line);
		background: var(--mf-panel);
	}

	table {
		border-collapse: collapse;
		min-width: 100%;
		font-size: 0.8rem;
	}

	th,
	td {
		border: 1px solid var(--mf-line);
		padding: 6px 6px;
		text-align: center;
		white-space: nowrap;
	}

	thead th {
		background: var(--mf-panel-2);
		color: var(--mf-dim);
		font-size: 0.72rem;
		letter-spacing: 0.08em;
	}

	thead tr:first-child th {
		color: var(--mf-ion);
		font-size: 0.85rem;
		border-top: 2px solid var(--mf-ion);
	}

	th.teamCol {
		position: sticky;
		left: 0;
		z-index: 1;
		text-align: left;
		background: var(--mf-panel-2);
		min-width: 170px;
	}

	.rowTeam {
		display: flex;
		align-items: center;
		gap: 8px;
		color: var(--mf-text);
		font-size: 0.82rem;
		letter-spacing: 0;
	}

	.rowTeam img {
		width: 22px;
		height: 22px;
		border-radius: 50%;
		object-fit: cover;
	}

	td.own {
		color: var(--mf-dim);
		opacity: 0.45;
	}

	td.moved {
		background: color-mix(in srgb, var(--mf-ion) 9%, transparent);
	}

	td.moved img {
		width: 22px;
		height: 22px;
		border-radius: 50%;
		object-fit: cover;
		vertical-align: middle;
		border: 1px solid var(--mf-ion);
	}

	td.yearStart,
	th.yearStart {
		border-left: 2px solid var(--mf-line-strong);
	}

	@media (max-width: 600px) {
		.picks {
			width: calc(100% - 16px);
		}
		h1 {
			font-size: 1.6rem;
		}
	}
</style>

<div class="picks">
	<div class="head">
		<div>
			<h1>Pick Tracker</h1>
			<div class="sub">
				Who owns every pick in the {seasons[0] ?? ''}–{seasons[seasons.length - 1] ?? ''} drafts
				{#if !loading && !error}· <strong>{totalTraded}</strong> picks have changed hands{/if}
			</div>
		</div>
		<div class="segment" role="group" aria-label="View">
			<button type="button" class:on={view === 'team'} aria-pressed={view === 'team'} onclick={() => (view = 'team')}>By team</button>
			<button type="button" class:on={view === 'grid'} aria-pressed={view === 'grid'} onclick={() => (view = 'grid')}>Full grid</button>
		</div>
	</div>

	{#if loading}
		<div class="loading">
			<p>Loading picks from Sleeper...</p>
			<LinearProgress indeterminate />
		</div>
	{:else if error}
		<p class="loading">{error}</p>
	{:else if view === 'team'}
		<p class="note">
			Teams are sorted by draft capital: a 1st counts {rounds}, a 2nd {rounds - 1}, down to 1 for a {roundLabel(rounds)}.
			Highlighted picks came from another team (their logo shows whose pick it is). Crossed-out picks were traded away.
		</p>
		<div class="teamGrid">
			{#each teams as t (t.id)}
				<div class="teamCard">
					<div class="teamHead" role="link" tabindex="0" onclick={() => gotoManager({ leagueTeamManagers, rosterID: t.id })} onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && gotoManager({ leagueTeamManagers, rosterID: t.id })}>
						<img class="av" src={avatar(t.id)} alt="" />
						<div style="min-width: 0">
							<div class="teamName">{name(t.id)}</div>
							<div class="capital" title="Draft capital"><span style="width: {(t.capital / maxCapital) * 100}%"></span></div>
						</div>
						<div class="counts"><strong>{t.held.length}</strong>picks · {t.firsts} 1st{t.firsts === 1 ? '' : 's'}</div>
					</div>
					{#each seasons as s}
						<div class="yearRow">
							<span class="year">{s}</span>
							<div class="chips">
								{#each bySeason(t.held, s) as p}
									<span class="chip" class:r1={p.round === 1} class:acq={p.acquired} title={p.acquired ? `${name(p.from)}'s ${roundLabel(p.round)}` : `Own ${roundLabel(p.round)}`}>
										{roundLabel(p.round)}
										{#if p.acquired}<img src={avatar(p.from)} alt="" /><span class="via">{short(p.from)}</span>{/if}
									</span>
								{/each}
								{#each bySeason(t.gone, s) as p}
									<span class="chip gone" title={`Own ${roundLabel(p.round)}, now owned by ${name(p.to)}`}>{roundLabel(p.round)}</span>
								{/each}
								{#if !bySeason(t.held, s).length && !bySeason(t.gone, s).length}
									<span class="none">No picks</span>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			{/each}
		</div>
	{:else}
		<p class="note">Each row is a team's own picks. A logo means that pick now belongs to another team. Faded dashes are still with the original team.</p>
		<div class="gridWrap">
			<table>
				<thead>
					<tr>
						<th class="teamCol" rowspan="2">Original team</th>
						{#each seasons as s}
							<th class="yearStart" colspan={rounds}>{s}</th>
						{/each}
					</tr>
					<tr>
						{#each seasons as s}
							{#each Array.from({ length: rounds }, (_, i) => i + 1) as r}
								<th class:yearStart={r === 1}>R{r}</th>
							{/each}
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each rosterIDs as id}
						<tr>
							<th class="teamCol"><span class="rowTeam"><img src={avatar(id)} alt="" />{name(id)}</span></th>
							{#each seasons as s}
								{#each Array.from({ length: rounds }, (_, i) => i + 1) as r}
									{@const cur = owner[s]?.[r]?.[id]}
									{#if cur === id}
										<td class="own" class:yearStart={r === 1}>–</td>
									{:else}
										<td class="moved" class:yearStart={r === 1} title={`${name(id)}'s ${s} ${roundLabel(r)} belongs to ${name(cur)}`}>
											<img src={avatar(cur)} alt={name(cur)} />
										</td>
									{/if}
								{/each}
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
