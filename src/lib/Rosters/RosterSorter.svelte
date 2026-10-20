<script>
	import Roster from './Roster.svelte';
	
	export let rosters, leagueTeamManagers, startersAndReserve, leagueData, players;

	const rosterPositions = leagueData.roster_positions;


	const numDivisions = leagueData.settings.divisions || 1;

	const divisions = [];

	for(let i = 0; i < numDivisions; i++) {
		divisions.push({
			name: leagueData.metadata ? leagueData.metadata[`division_${i + 1}`] : null,
			rosters: [],
		})
	}

	for(const rosterID in rosters) {
        const roster = rosters[rosterID];
        const division = !roster.settings.division || roster.settings.division > numDivisions ? 0 : roster.settings.division - 1;
		divisions[division].rosters.push(roster);
	}

	let expanded = false;
</script>

<style>
	/* page header: same panel as the home Power Rankings */
	.rostersHeader {
		width: 96%;
		max-width: 1700px;
		margin: 22px auto 0;
		padding: 20px 20px 18px;
		box-sizing: border-box;
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 16px;
		flex-wrap: wrap;
		font-family: 'Chakra Petch', 'Roboto', Arial, sans-serif;
		background:
			linear-gradient(var(--mf-grid) 1px, transparent 1px) 0 0 / 100% 28px,
			linear-gradient(90deg, var(--mf-grid) 1px, transparent 1px) 0 0 / 28px 100%,
			radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--mf-plasma) 22%, transparent), transparent 60%),
			var(--mf-bg);
		border: 1px solid var(--mf-line);
		clip-path: polygon(0 0, calc(100% - 22px) 0, 100% 22px, 100% 100%, 22px 100%, 0 calc(100% - 22px));
	}

	.rostersTitle {
		margin: 0;
		font-size: 2rem;
		font-weight: 700;
		line-height: 1;
		letter-spacing: 0.02em;
		color: var(--mf-text);
		text-shadow: 0 0 18px var(--mf-line-strong);
	}

	.rostersSub {
		margin-top: 6px;
		font-size: 0.85rem;
		color: var(--mf-dim);
	}

	.rostersSub strong {
		color: var(--mf-ion);
	}

	.expandAll {
		padding: 9px 16px;
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
		transition: background-color 0.15s ease, color 0.15s ease;
	}

	.expandAll:hover,
	.expandAll:focus-visible {
		background: var(--mf-ion);
		color: var(--mf-on-ion);
		outline: none;
	}

	.divisionBlock {
		width: 96%;
		max-width: 1700px;
		margin: 34px auto 0;
	}

	.divisionHead {
		display: flex;
		align-items: center;
		gap: 16px;
		margin-bottom: 16px;
		padding-bottom: 8px;
		border-bottom: 1px solid var(--mf-line);
	}

	.banner {
		flex-shrink: 0;
		height: 84px;
		width: 160px;
		background-repeat: no-repeat;
		background-position: center;
		background-size: cover;
		background-color: #000;
		border: 1px solid var(--mf-line-strong);
		box-shadow: 0 0 14px var(--mf-ion-glow);
		clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px));
	}

	.banner-D-1 { background-image: url("/division-1-banner.png"); }
	.banner-D-2 { background-image: url("/division-2-banner.png"); }
	.banner-D-3 { background-image: url("/division-3-banner.png"); }
	.banner-D-4 { background-image: url("/division-4-banner.png"); }

	.divisionName {
		margin: 0;
		font-family: 'Chakra Petch', 'Roboto', Arial, sans-serif;
		font-size: 1.5rem;
		font-weight: 700;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--mf-text);
	}

	.divisionCount {
		margin-left: auto;
		font-family: 'Chakra Petch', 'Roboto', Arial, sans-serif;
		font-size: 0.8rem;
		color: var(--mf-dim);
	}

	.division {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 330px), 1fr));
		gap: 16px;
		align-items: start;
	}

	.rostersPage {
		padding-bottom: 50px;
	}

	@media (max-width: 600px) {
		.rostersHeader,
		.divisionBlock {
			width: calc(100% - 16px);
		}
		.rostersTitle {
			font-size: 1.6rem;
		}
		.banner {
			height: 64px;
			width: 120px;
		}
		.divisionName {
			font-size: 1.2rem;
		}
	}
</style>

<div class="rostersPage">
	<div class="rostersHeader">
		<div>
			<h2 class="rostersTitle">Rosters</h2>
			<div class="rostersSub"><strong>{divisions.reduce((n, d) => n + d.rosters.length, 0)}</strong> teams{numDivisions > 1 ? ` · ${numDivisions} divisions` : ''} · tap a team for its manager page</div>
		</div>
		<button type="button" class="expandAll" onclick={() => {expanded = !expanded}}>
			{expanded ? 'Hide' : 'Show'} all benches
		</button>
	</div>

	{#each divisions as division, ix}
		<section class="divisionBlock">
			{#if division.name || numDivisions > 1}
				<div class="divisionHead">
					{#if division.name}
						<div class="banner banner-D-{ix + 1}" role="img" aria-label="{division.name} division"></div>
					{/if}
					<h3 class="divisionName">{division.name || `Division ${ix + 1}`}</h3>
					<span class="divisionCount">{division.rosters.length} teams</span>
				</div>
			{/if}
			<div class="division">
				{#each division.rosters as roster}
					<Roster division={ix + 1} {expanded} {rosterPositions} {roster} {leagueTeamManagers} {players} {startersAndReserve} />
				{/each}
			</div>
		</section>
	{/each}
</div>
