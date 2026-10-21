<script>
    import { leagueName, round, waitForAll } from '$lib/utils/helper';
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
    })

    let innerWidth;

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

    .finePrint {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        max-width: 72ch;
        margin: -3.5em auto 4em;
        padding: 0 12px;
        font-size: 0.78em;
        line-height: 1.5;
        text-align: left;
        color: var(--mf-dim);
    }

    .finePrint strong {
        color: var(--mf-text);
        font-weight: 600;
    }

    .finePrintBall {
        flex: none;
        width: 12px;
        height: 12px;
        margin-top: 3px;
        border-radius: 50%;
        background: radial-gradient(circle at 35% 30%, #fff6b3 0%, #ffd400 45%, #c99a00 100%);
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
    }

    .standingsTable {
        max-width: 100%;
        overflow-x: auto;
        margin: 0.5em 0 5em;
    }

    /* tight table: sized to its content, centered */
    .standingsTable :global(.mdc-data-table) {
        display: table;
        width: auto;
        margin: 0 auto;
    }

    .standingsTable :global(.mdc-data-table__header-cell),
    .standingsTable :global(.mdc-data-table__cell) {
        padding: 6px 10px;
    }

    .standingsTable :global(.mdc-data-table__header-cell) {
        height: 44px;
        font-size: 0.85em;
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
                    <Cell class="center rankCell">#</Cell>
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

    <p class="finePrint">
        <span class="finePrintBall" aria-hidden="true"></span>
        <span>
            <strong>Draft lottery balls.</strong> Finishing the regular season 8th, 11th, 12th or 13th earns ping pong
            balls for the draft lottery: 8th gets 1, 11th gets 3, 12th gets 2, 13th gets 1. Balls go with the spot, not the
            team, so they can change hands until the regular season ends. Six more are earned in the Toilet Bowl (1st place 3,
            2nd place 2, 3rd place 1), and non-playoff teams can buy one extra entry for the #1 pick with FAAB.
            See <a href="/constitution#draft-order">Constitution §3.4–3.5</a>.
        </span>
    </p>
{/if}
