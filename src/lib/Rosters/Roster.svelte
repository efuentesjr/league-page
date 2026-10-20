<script>
	import { gotoManager } from '$lib/utils/helper';
	import RosterRow from "./RosterRow.svelte"
	
	export let roster, leagueTeamManagers, startersAndReserve, players, rosterPositions, division, expanded;

	$: team = leagueTeamManagers.teamManagersMap[leagueTeamManagers.currentSeason][roster.roster_id].team;

	let i = 0;

	const digestData = (passedPlayers, rawPlayers, startingPlayers = false, reserve = false) => {
		let digestedRoster = [];
	
		for(const singlePlayer of rawPlayers) {
			if(!startingPlayers && !reserve && startersAndReserve.includes(singlePlayer)) {
				continue;
			}
			let player = {};
			let slot = "BN"
			if(startingPlayers) {
				slot = rosterPositions[i] == "WRRB_FLEX" ? "WR/RB" : rosterPositions[i];
			}

			if(singlePlayer == "0") {
				player = {
					name: "Empty",
					poss: null,
					team: null,
					avatar: null,
					slot: slot
				}
				i++;
				digestedRoster.push(player);
				continue;
			}

			let injury = null;
			switch (passedPlayers[singlePlayer].is) {
				case "Questionable":
					injury = "Q";
					break;
				case "Out":
					injury = "OUT";
					break;
				case "PUP":
					injury = "PUP";
					break;
				case "IR":
					injury = "IR";
					break;
			
				default:
					break;
			}
			player = {
				name: `${passedPlayers[singlePlayer].fn} ${passedPlayers[singlePlayer].ln}${injury ? `<span class="injury ${injury}">${injury}</span>` : ""}`,
                nickname: roster.metadata && roster.metadata[`p_nick_${singlePlayer}`] ? roster.metadata[`p_nick_${singlePlayer}`] : null,
				poss: passedPlayers[singlePlayer].pos,
				team: passedPlayers[singlePlayer].t,
				avatar: passedPlayers[singlePlayer].pos == "DEF" ? `background-image: url(https://sleepercdn.com/images/team_logos/nfl/${singlePlayer.toLowerCase()}.png)` : `background-image: url(https://sleepercdn.com/content/nfl/players/thumb/${singlePlayer}.jpg), url(https://sleepercdn.com/images/v2/icons/player_default.webp)`,
				slot: slot
			}
			i++;
			digestedRoster.push(player);
		}
		i = 0;

		return digestedRoster;
	}

	$: finalStarters = digestData(players, roster.starters, true);
	let finalBench = [];
	$: if(roster.players) {
		finalBench = digestData(players, roster.players);
	}
	let finalIR = null;
	if(roster.reserve) {
		finalIR = digestData(players, roster.reserve, false, true);
	}

	const buildRecord = (newRoster) => {
		const innerRecord = [];
		// Check to make sure that record exists
		if(!newRoster.metadata || !newRoster.metadata.record) return innerRecord;
		// simplify record
		for (const c of newRoster.metadata.record) {
			switch (c) {
				case "W":
					innerRecord.push("green");
					break;
				case "L":
					innerRecord.push("red");
					break;
			
				default:
					innerRecord.push("gray");
					break;
			}
		}
		return innerRecord;
	}

	$: record = buildRecord(roster);

	let open = false;
	const toggleSelected = () => (open = !open);
	$: open = !!expanded;

	$: wins = record.filter((r) => r === 'green').length;
	$: losses = record.filter((r) => r === 'red').length;
	$: ties = record.length - wins - losses;
	$: benchCount = finalBench.length + (finalIR ? finalIR.length : 0);
</script>

<style>
	/* ============================================================
	   TEAM ROSTER CARD — same panel language as Power Rankings
	   ============================================================ */
	.team {
		--divColor: var(--mf-ion);
		width: 100%;
		max-width: 400px;
		margin: 0 auto;
		box-sizing: border-box;
		font-family: 'Chakra Petch', 'Roboto', Arial, sans-serif;
		color: var(--mf-text);
		background:
			linear-gradient(var(--mf-grid) 1px, transparent 1px) 0 0 / 100% 24px,
			linear-gradient(90deg, var(--mf-grid) 1px, transparent 1px) 0 0 / 24px 100%,
			var(--mf-bg);
		border: 1px solid var(--mf-line);
		clip-path: polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px));
	}

	.div-2 { --divColor: var(--mf-plasma); }
	.div-3 { --divColor: #00ceb8; }
	.div-4 { --divColor: #ffae58; }

	.teamHeader {
		display: grid;
		grid-template-columns: 48px minmax(0, 1fr);
		align-items: center;
		gap: 12px;
		padding: 12px 18px 10px 12px;
		background:
			radial-gradient(ellipse at 0% 0%, color-mix(in srgb, var(--divColor) 28%, transparent), transparent 70%),
			var(--mf-panel);
		border-bottom: 1px solid var(--mf-line);
		border-top: 2px solid var(--divColor);
		cursor: pointer;
	}

	.teamHeader:hover .teamName,
	.teamHeader:focus-visible .teamName {
		color: var(--mf-ion);
	}

	.teamHeader:focus-visible {
		outline: 2px solid var(--mf-ion);
		outline-offset: -2px;
	}

	.teamAvatar {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		border: 1px solid var(--divColor);
		box-shadow: 0 0 10px color-mix(in srgb, var(--divColor) 55%, transparent);
		object-fit: cover;
	}

	.teamName {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 700;
		line-height: 1.1;
		letter-spacing: 0.01em;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		transition: color 0.15s ease;
	}

	.teamMeta {
		margin-top: 4px;
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 0.78rem;
		color: var(--mf-dim);
	}

	.teamMeta strong {
		color: var(--mf-text);
		font-variant-numeric: tabular-nums;
	}

	/* record: one tick per game, oldest → newest */
	.record {
		display: flex;
		gap: 2px;
		flex: 1;
		max-width: 160px;
	}

	.result {
		flex: 1;
		height: 6px;
		max-width: 12px;
		background: var(--mf-line);
	}

	.result.green { background: var(--mf-up); box-shadow: 0 0 4px color-mix(in srgb, var(--mf-up) 60%, transparent); }
	.result.red { background: var(--mf-down); }

	.sectionLabel {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 6px 14px;
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--mf-dim);
		background: var(--mf-panel-2);
		border-bottom: 1px solid var(--mf-line);
	}

	.rows {
		display: flex;
		flex-direction: column;
	}

	.benchToggle {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		padding: 10px 14px;
		box-sizing: border-box;
		font: inherit;
		font-size: 0.8rem;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--mf-ion);
		background: linear-gradient(90deg, color-mix(in srgb, var(--mf-ion) 12%, transparent), transparent 70%), var(--mf-panel-2);
		border: 0;
		border-top: 1px solid var(--mf-line);
		cursor: pointer;
	}

	.benchToggle:hover,
	.benchToggle:focus-visible {
		background-color: var(--mf-panel);
		outline: none;
		box-shadow: inset 0 0 0 1px var(--mf-line-strong);
	}

	.benchCount {
		color: var(--mf-dim);
		font-weight: 500;
		letter-spacing: 0.04em;
	}

	.chevron {
		display: inline-block;
		margin-left: 6px;
		transition: transform 0.2s ease;
	}

	.open .chevron {
		transform: rotate(180deg);
	}

	/* smooth open/close without measuring heights */
	.benchWrap {
		display: grid;
		grid-template-rows: 0fr;
		transition: grid-template-rows 0.45s ease;
	}

	.benchWrap.open {
		grid-template-rows: 1fr;
	}

	.benchInner {
		overflow: hidden;
		min-height: 0;
	}

	.benchInner .sectionLabel:first-child {
		border-top: 1px solid var(--mf-line);
	}
</style>

<div class="team div-{division}" class:open>
	<div
		class="teamHeader"
		role="link"
		tabindex="0"
		onclick={() => gotoManager({leagueTeamManagers, rosterID: roster.roster_id})}
		onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && gotoManager({leagueTeamManagers, rosterID: roster.roster_id})}
	>
		<img alt="" class="teamAvatar" src="{team ? team.avatar : 'https://sleepercdn.com/images/v2/icons/player_default.webp'}" />
		<div>
			<h3 class="teamName">{team?.name ? team.name : 'No Manager'}</h3>
			<div class="teamMeta">
				{#if record.length}
					<span><strong>{wins}-{losses}{ties ? `-${ties}` : ''}</strong></span>
					<div class="record" aria-label="Game by game results">
						{#each record as result}
							<span class="result {result}"></span>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>

	<div class="sectionLabel"><span>Starters</span><span>{finalStarters.length}</span></div>
	<div class="rows">
		{#each finalStarters as starter}
			<RosterRow player={starter} />
		{/each}
	</div>

	<button type="button" class="benchToggle" aria-expanded={open} onclick={toggleSelected}>
		<span>{open ? 'Hide bench' : 'Show bench'}<span class="chevron" aria-hidden="true">▾</span></span>
		<span class="benchCount">{benchCount} players</span>
	</button>

	<div class="benchWrap" class:open>
		<div class="benchInner">
			<div class="sectionLabel"><span>Bench</span><span>{finalBench.length}</span></div>
			<div class="rows">
				{#each finalBench as bench}
					<RosterRow player={bench} />
				{/each}
			</div>
			{#if finalIR}
				<div class="sectionLabel"><span>Injured reserve</span><span>{finalIR.length}</span></div>
				<div class="rows">
					{#each finalIR as ir}
						<RosterRow player={ir} />
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>
