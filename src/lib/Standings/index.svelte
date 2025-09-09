<script>
    import { leagueName } from '$lib/utils/helper';
    import { getTeamFromTeamManagers } from '$lib/utils/helperFunctions/universalFunctions';
    import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';
    import LinearProgress from '@smui/linear-progress';
    import { onMount } from 'svelte';
    import Standing from './Standing.svelte';

    // Props from the page loader
    export let standingsData;
    export let leagueTeamManagersData;

    // Least important -> most important (sorted last has highest priority)
    // Adjust to match your league tiebreakers
    const sortOrder = ["fptsAgainst", "divisionTies", "divisionWins", "fpts", "ties", "wins"];

    // Column order from left to right (fields should match normalized keys below)
    const columnOrder = [
        { name: "W", field: "wins" },
        { name: "T", field: "ties" },
        { name: "L", field: "losses" },
        { name: "Div W", field: "divisionWins" },
        { name: "Div T", field: "divisionTies" },
        { name: "Div L", field: "divisionLosses" },
        { name: "FPTS", field: "fpts" },
        { name: "FPTS Against", field: "fptsAgainst" },
        { name: "Streak", field: "streak" }
    ];

    let loading = true;
    let preseason = false;
    let errorMsg = "";
    let standings = [];
    let year = "";
    let leagueTeamManagers = [];

    // Normalize camelCase / snake_case so the component works with either
    function normalizeStanding(s = {}) {
        return {
            ...s,
            rosterID: s.rosterID ?? s.roster_id ?? s.rosterId ?? null,
            wins: s.wins ?? s.win ?? 0,
            ties: s.ties ?? s.tie ?? 0,
            losses: s.losses ?? s.loss ?? 0,
            divisionWins: s.divisionWins ?? s.division_wins ?? 0,
            divisionTies: s.divisionTies ?? s.division_ties ?? 0,
            divisionLosses: s.divisionLosses ?? s.division_losses ?? 0,
            fpts: s.fpts ?? s.fpts_for ?? s.points_for ?? 0,
            fptsAgainst: s.fptsAgainst ?? s.fpts_against ?? s.points_against ?? 0,
            streak: s.streak ?? s.form ?? ""
        };
    }

    onMount(async () => {
        try {
            const asyncStandingsData = await standingsData;
            leagueTeamManagers = (await leagueTeamManagersData) ?? [];

            // If no data object or no standingsInfo => treat as preseason
            if (!asyncStandingsData || !asyncStandingsData.standingsInfo) {
                preseason = true;
                return;
            }

            const { standingsInfo, yearData } = asyncStandingsData;
            year = yearData ?? "";

            // Build an array whether standingsInfo is an array or an object map
            let finalStandings = Array.isArray(standingsInfo)
                ? standingsInfo
                : Object.values(standingsInfo ?? {});

            // Normalize keys so sorting/columns work even if API uses snake_case
            finalStandings = finalStandings.map(normalizeStanding);

            // No rows? Preseason.
            if (!finalStandings.length) {
                preseason = true;
                return;
            }

            // Apply multi-key sort (stable enough for our needs)
            for (const sortType of sortOrder) {
                if (!(sortType in finalStandings[0])) continue;
                finalStandings = [...finalStandings].sort(
                    (a, b) => (b?.[sortType] ?? 0) - (a?.[sortType] ?? 0)
                );
            }

            standings = finalStandings;
        } catch (e) {
            errorMsg = e?.message ?? String(e);
        } finally {
            loading = false;
        }
    });

    let innerWidth;
</script>

<svelte:window bind:innerWidth={innerWidth} />

<style>
    .loading {
        display: block;
        width: 85%;
        max-width: 500px;
        margin: 80px auto;
        text-align: center;
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
        text-align: center;
    }

    .standingsTable {
        max-width: 100%;
        overflow-x: auto;
        margin: 0.5em 0 5em;
    }
</style>

<h1>{year ?? ''} {leagueName} Standings</h1>

{#if loading}
    <div class="loading">
        <p>Loading Standings...</p>
        <LinearProgress indeterminate />
    </div>
{:else if preseason}
    <div class="loading">
        <p>Preseason, No Standings Yet</p>
    </div>
{:else if errorMsg}
    <div class="loading">
        <p class="center">Couldn’t load standings: {errorMsg}</p>
    </div>
{:else}
    <div class="standingsTable">
        <DataTable table$aria-label="League Standings">
            <Head>
                <Row>
                    <Cell class="center">Team</Cell>
                    {#each columnOrder as column}
                        <Cell class="center wrappable">{column.name}</Cell>
                    {/each}
