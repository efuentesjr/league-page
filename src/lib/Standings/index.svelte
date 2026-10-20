<script>
    import { leagueName, round, getLeagueData, getLeagueRosters, getNflState, getLeagueMatchups, loadPlayers, waitForAll } from '$lib/utils/helper';
    import { buildSimInputs, simulateSeason } from '$lib/utils/helperFunctions/playoffOdds';
	import { getTeamFromTeamManagers } from '$lib/utils/helperFunctions/universalFunctions';
  	import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';
	import LinearProgress from '@smui/linear-progress';
    import { onMount } from 'svelte';
    import Standing from './Standing.svelte';

    export let standingsData, leagueTeamManagersData;

    // Least important to most important (i.e. the most important [usually wins] goes last)
    // Edit this to match your leagues settings
    const sortOrder = ["fptsAgainst", "divisionTies", "divisionWins", "fpts", "ties", "wins"];

    // Column order from left to right
    let columnOrder = [{name: "W", field: "wins"}, {name: "T", field: "ties"}, {name: "L", field: "losses"}, {name: "Div W", field: "divisionWins"}, {name: "Div T", field: "divisionTies"}, {name: "Div L", field: "divisionLosses"}, {name: "FPTS", field: "fpts"}, {name: "FPTS Against", field: "fptsAgainst"}, {name: "Streak", field: "streak"}]

    let loading = true;
    let preseason = false;

    // Small numbered balls shown next to a standing.
    // Key = place in the standings, value = number on the ball. Edit freely.
    const standingBalls = {
        8: 1,
        11: 3,
        12: 2,
        13: 1,
    };

    // teams 1 through playoffTeams make the playoffs (from Sleeper's league settings)
    let playoffTeams = 8;
    let standings, year, leagueTeamManagers;
    onMount(async () => {
        const asyncStandingsData = await standingsData;
        if(!asyncStandingsData) {
            loading = false;
            preseason = true;
            return;
        }
        const {standingsInfo, yearData} = asyncStandingsData;
        leagueTeamManagers = await leagueTeamManagersData;

        try {
            const leagueData = await getLeagueData();
            playoffTeams = Number(leagueData?.settings?.playoff_teams) || playoffTeams;
        } catch (err) {
            console.error('[Standings] Could not read playoff teams, using 8:', err);
        }
        year = yearData;

        let finalStandings = Object.keys(standingsInfo).map((key) => standingsInfo[key]);

        for(const sortType of sortOrder) {
            if(!finalStandings[0][sortType] && finalStandings[0][sortType] != 0) {
                continue;
            }
            finalStandings = [...finalStandings].sort((a,b) => b[sortType] - a[sortType]);
        }

        standings = finalStandings;
        loading = false;

        addPlayoffOdds();
    })

    let innerWidth;

    // Playoff % column, from the same simulator as the Playoff Odds page
    const fmtPct = (v) => {
        if (v >= 99.95) return '100%';
        if (v > 99.4) return '>99%';
        if (v > 0 && v < 0.5) return '<1%';
        return `${Math.round(v)}%`;
    };

    const addPlayoffOdds = async () => {
        try {
            const [rostersData, leagueData, nflState, matchupsData, playersInfo] = await waitForAll(
                getLeagueRosters(),
                getLeagueData(),
                getNflState(),
                getLeagueMatchups(),
                loadPlayers(null)
            );
            const inputs = buildSimInputs({
                rosters: rostersData.rosters,
                players: playersInfo.players,
                leagueData,
                nflState,
                matchupWeeks: matchupsData.matchupWeeks
            });
            if (!inputs.games.length) return; // regular season is over
            const odds = Object.fromEntries(
                simulateSeason(inputs, { sims: 10000 }).map((r) => [String(r.rosterID), r.playoffPct])
            );
            standings = standings.map((s) => ({ ...s, playoffPct: fmtPct(odds[String(s.rosterID)] ?? 0) }));
            if (!columnOrder.find((c) => c.field === 'playoffPct')) {
                columnOrder = [...columnOrder, { name: 'Playoff %', field: 'playoffPct' }];
            }
        } catch (err) {
            console.error('[Standings] Could not add playoff odds:', err);
        }
    };

</script>

<svelte:window bind:innerWidth={innerWidth} />

<style>
    .loading {
        display: block;
        width: 85%;
        max-width: 500px;
        margin: 80px auto;
    }

    :global(.center) {
        text-align: center;
    }

    :global(.wrappable) {
        white-space: normal;
        line-height: 1.2em;
    }

    h1 {
        font-size: 2.2em;
        line-height: 1.3em;
        margin: 1.5em 0 2em;
    }

    :global(.playoffLine td) {
        padding: 0 !important;
        height: auto !important;
    }

    .playoffLineInner {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 4px 12px;
        font-size: 0.7em;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: #3d8bfd;
    }

    .playoffLineInner::before,
    .playoffLineInner::after {
        content: '';
        flex: 1;
        border-top: 2px dashed currentColor;
    }

    .standingsTable {
        max-width: 100%;
        overflow-x: scroll;
        margin: 0.5em 0 5em;
    }
</style>

<h1>{year ?? ''} {leagueName} Standings</h1>

{#if loading}
    <!-- promise is pending -->
    <div class="loading">
        <p>Loading Standings...</p>
        <LinearProgress indeterminate />
    </div>
{:else if preseason}
<div class="loading">
    <p>Preseason, No Standings Yet</p>
</div>
{:else}
    <div class="standingsTable">
        <DataTable table$aria-label="League Standings" >
            <Head> <!-- Team name  -->
                <Row>
                    <Cell class="center">#</Cell>
                    <Cell class="center">Team</Cell>
                    {#each columnOrder as column}
                        <Cell class="center wrappable">{column.name}</Cell>
                    {/each}
                </Row>
            </Head>
            <Body>
                <!-- 	Standing	 -->
                {#each standings as standing, index}
                    <Standing rank={index + 1} ball={standingBalls[index + 1]} {columnOrder} {standing} {leagueTeamManagers} team={getTeamFromTeamManagers(leagueTeamManagers, standing.rosterID)} />

                    {#if index + 1 === playoffTeams && standings.length > playoffTeams}
                        <Row class="playoffLine">
                            <Cell colspan={columnOrder.length + 2}>
                                <div class="playoffLineInner">
                                    <span>▲ Playoffs · Top {playoffTeams}</span>
                                </div>
                            </Cell>
                        </Row>
                    {/if}
                {/each}
            </Body>
        </DataTable>
    </div>
{/if}
