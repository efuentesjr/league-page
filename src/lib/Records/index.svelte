<script>
    import { getLeagueRecords, getLeagueTransactions } from '$lib/utils/helper';
    import AllTimeRecords from './AllTimeRecords.svelte';
    import PerSeasonRecords from './PerSeasonRecords.svelte';

    let {leagueData, totals, stale, leagueTeamManagers} = $props();;

    const refreshTransactions = async () => {
        const newTransactions = await getLeagueTransactions(false, true);
        totals = newTransactions.totals;
    }

    let leagueManagerRecords = $state();
    let leagueRosterRecords = $state();
    let leagueWeekHighs = $state();
    let leagueWeekLows = $state();
    let allTimeClosestMatchups = $state();
    let allTimeBiggestBlowouts = $state();
    let mostSeasonLongPoints = $state();
    let leastSeasonLongPoints = $state();
    let seasonWeekRecords = $state();
    let currentYear = $state();
    let lastYear = $state();

    const refreshRecords = async () => {
        const newRecords = await getLeagueRecords(true);

        // update values with new data
        leagueData = newRecords;
    }

    let key = $state("regularSeasonData");

    $effect(() => {
        if(!leagueData || !leagueData[key]) return;

        const selectedLeagueData = leagueData[key];

        leagueManagerRecords = selectedLeagueData.leagueManagerRecords;
        leagueRosterRecords = selectedLeagueData.leagueRosterRecords;
        leagueWeekHighs = selectedLeagueData.leagueWeekHighs;
        leagueWeekLows = selectedLeagueData.leagueWeekLows;
        allTimeClosestMatchups = selectedLeagueData.allTimeClosestMatchups;
        allTimeBiggestBlowouts = selectedLeagueData.allTimeBiggestBlowouts;
        mostSeasonLongPoints = selectedLeagueData.mostSeasonLongPoints;
        leastSeasonLongPoints = selectedLeagueData.leastSeasonLongPoints;
        seasonWeekRecords = selectedLeagueData.seasonWeekRecords;
        currentYear = selectedLeagueData.currentYear;
        lastYear = selectedLeagueData.lastYear;
    });

    if(stale) {
        refreshTransactions();
    }

    if(leagueData.stale) {
        refreshRecords();
    }

    let display = $state("allTime");

</script>

<style>
    .rankingsWrapper {
        margin: 0 auto;
        width: 96%;
        max-width: 1200px;
        padding-bottom: 30px;
        font-family: 'Chakra Petch', 'Roboto', Arial, sans-serif;
    }

    .empty {
        margin: 6em 0 4em;
        text-align: center;
        color: var(--mf-dim);
    }

    /* header panel: same as home Power Rankings */
    .recordsHeader {
        margin: 22px auto 0;
        padding: 20px 20px 18px;
        box-sizing: border-box;
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
        background:
            linear-gradient(var(--mf-grid) 1px, transparent 1px) 0 0 / 100% 28px,
            linear-gradient(90deg, var(--mf-grid) 1px, transparent 1px) 0 0 / 28px 100%,
            radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--mf-plasma) 22%, transparent), transparent 60%),
            var(--mf-bg);
        border: 1px solid var(--mf-line);
        clip-path: polygon(0 0, calc(100% - 22px) 0, 100% 22px, 100% 100%, 22px 100%, 0 calc(100% - 22px));
    }

    .recordsTitle {
        margin: 0;
        font-size: 2rem;
        font-weight: 700;
        line-height: 1;
        letter-spacing: 0.02em;
        color: var(--mf-text);
        text-shadow: 0 0 18px var(--mf-line-strong);
    }

    .recordsSub {
        margin-top: 6px;
        font-size: 0.85rem;
        color: var(--mf-dim);
    }

    .toggles {
        display: flex;
        flex-direction: column;
        gap: 8px;
        align-items: flex-end;
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
        transition: background-color 0.15s ease, color 0.15s ease;
    }

    .segment button + button {
        border-left: 1px solid var(--mf-line-strong);
    }

    .segment button:hover,
    .segment button:focus-visible {
        background: var(--mf-panel-2);
        outline: none;
    }

    .segment button.on {
        background: var(--mf-ion);
        color: var(--mf-on-ion);
    }

    @media (max-width: 600px) {
        .rankingsWrapper {
            width: calc(100% - 16px);
        }
        .toggles {
            align-items: stretch;
            width: 100%;
        }
        .segment button {
            flex: 1;
            padding: 8px 6px;
            font-size: 0.72rem;
        }
        .recordsTitle {
            font-size: 1.6rem;
        }
    }
</style>

<div class="rankingsWrapper">

    <div class="recordsHeader">
        <div>
            <h2 class="recordsTitle">League Records</h2>
            <div class="recordsSub">Every season since the league started</div>
        </div>
        <div class="toggles">
            <div class="segment" role="group" aria-label="Season type">
                <button type="button" class:on={key == "regularSeasonData"} aria-pressed={key == "regularSeasonData"} onclick={() => key = "regularSeasonData"}>Regular Season</button>
                <button type="button" class:on={key == "playoffData"} aria-pressed={key == "playoffData"} onclick={() => key = "playoffData"}>Playoffs</button>
            </div>
            <div class="segment" role="group" aria-label="Time range">
                <button type="button" class:on={display == "allTime"} aria-pressed={display == "allTime"} onclick={() => display = "allTime"}>All-Time</button>
                <button type="button" class:on={display == "season"} aria-pressed={display == "season"} onclick={() => display = "season"}>By Season</button>
            </div>
        </div>
    </div>

    {#if display == "allTime"}
        {#if leagueWeekHighs?.length}
            <AllTimeRecords transactionTotals={totals} {allTimeClosestMatchups} {allTimeBiggestBlowouts} {leagueManagerRecords} {leagueWeekHighs} {leagueWeekLows} {leagueTeamManagers} {mostSeasonLongPoints} {leastSeasonLongPoints} {key} />
        {:else}
            <p class="empty">No records <i>yet</i>...</p>
        {/if}
    {:else}
        <PerSeasonRecords transactionTotals={totals} {leagueRosterRecords} {seasonWeekRecords} {leagueTeamManagers} {currentYear} {lastYear} {key} />
    {/if}
</div>
