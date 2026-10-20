<script>
    import { browser } from '$app/environment';
    import { generateGraph, gotoManager, round } from '$lib/utils/helper';
  	import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';
	import LinearProgress from '@smui/linear-progress';
	import RecordTeam from './RecordTeam.svelte';
	import BarChart from '$lib/BarChart.svelte';
	import { getManagerHistory, computeWinStreaks } from '$lib/utils/helperFunctions/managerInsights';

    export let key, tradesData, waiversData, weekRecords, weekLows, seasonLongRecords, seasonLongLows, showTies, winPercentages, fptsHistories, lineupIQs, prefix, blowouts, closestMatchups, allTime=false, leagueTeamManagers;

    const year = allTime ? null : prefix;
    const playoffWord = () => (key == "playoffData" ? "Playoff " : "");

    /* ---------- win streaks (all-time view only) ---------- */
    let history = null;
    let streakError = false;
    if (allTime && browser) {
        getManagerHistory()
            .then((h) => (history = h))
            .catch(() => (streakError = true));
    }
    $: streakData = history ? computeWinStreaks(history, { playoffs: key == "playoffData" }) : null;

    const weekLabel = (point, playoffs) => {
        if (!point) return '';
        return playoffs ? `${point.year} playoffs` : `${point.year} Wk ${point.week}`;
    };
    const streakSpan = (s) => {
        if (!s.start) return '—';
        const playoffs = key == "playoffData";
        const a = weekLabel(s.start, playoffs), b = weekLabel(s.end, playoffs);
        return a === b ? a : `${a} – ${b}`;
    };

    /* ---------- transactions: one row per manager, trades + waivers ---------- */
    const buildTransactions = (tD, wD) => {
        const byKey = new Map();
        const k = (x) => (x.managerID ? `m${x.managerID}` : `r${x.rosterID}`);
        for (const w of wD || []) byKey.set(k(w), { managerID: w.managerID, rosterID: w.rosterID, trades: 0, waivers: w.waivers || 0 });
        for (const t of tD || []) {
            const row = byKey.get(k(t)) || { managerID: t.managerID, rosterID: t.rosterID, trades: 0, waivers: 0 };
            row.trades = t.trades || 0;
            byKey.set(k(t), row);
        }
        return [...byKey.values()];
    };
    $: transactions = buildTransactions(tradesData, waiversData);

    /* ---------- views: each button = one chart + its matching table ---------- */
    const buildViews = (lIQs, wP, fH, tx, streaks, k) => {
        const v = [];
        const hasIQ = !!lIQs?.[0]?.potentialPoints;
        if (hasIQ) v.push({ id: 'iq', short: 'Lineup IQ', table: 'iq',
            graph: generateGraph({ stats: lIQs, x: 'Lineup IQ', stat: '%', header: 'Manager Lineup IQ', field: 'iq', short: 'Lineup IQ' }, year) });
        v.push({ id: 'wins', short: 'Wins', table: 'win',
            graph: generateGraph({ stats: wP, x: 'Wins', stat: '', header: 'Team Wins', field: 'wins', short: 'Wins' }, year, 5) });
        v.push({ id: 'winPct', short: 'Win %', table: 'win',
            graph: generateGraph({ stats: wP, x: 'Win Percentage', stat: '%', header: 'Team Win Percentages', field: 'percentage', short: 'Win %' }, year) });
        v.push({ id: 'points', short: 'Fantasy Points', table: 'points',
            graph: generateGraph({ stats: fH, x: 'Fantasy Points', stat: '', header: 'Team Fantasy Points', field: 'fptsFor', short: 'Fantasy Points' }, year) });
        if (hasIQ) v.push({ id: 'potential', short: 'Potential Points', table: 'iq',
            graph: generateGraph({ stats: lIQs, x: 'Points', stat: '', header: 'Potential Points vs Points', field: 'potentialPoints', secondField: 'fpts', short: 'Potential Points' }, year, 10, 0) });
        if (k == "regularSeasonData" && tx.length) {
            v.push({ id: 'trades', short: 'Trades', table: 'transactions',
                graph: generateGraph({ stats: tx, x: '# of trades', stat: '', header: 'Number of Trades Managers Have Made', field: 'trades', short: 'Trades' }, year) });
            v.push({ id: 'waivers', short: 'Waivers', table: 'transactions',
                graph: generateGraph({ stats: tx, x: '# of Waiver Moves', stat: '', header: 'Waiver Moves Managers Have Made', field: 'waivers', short: 'Waivers' }, year) });
        }
        if (allTime) v.push({ id: 'streaks', short: 'Win Streaks', table: 'streaks',
            graph: streaks?.some((s) => s.streak > 0)
                ? generateGraph({ stats: streaks, x: 'Consecutive wins', stat: '', header: `Longest ${k == "playoffData" ? "Playoff " : ""}Win Streak · Current Teams`, field: 'streak', short: 'Win Streaks' }, year, 2)
                : null });
        return v;
    };

    $: views = buildViews(lineupIQs, winPercentages, fptsHistories, transactions, streakData, key);
    let curView = null;
    $: active = views.find((v) => v.id === curView) || views[0];

    // transactions table follows whichever button is selected
    $: sortedTransactions = [...transactions].sort((a, b) =>
        active?.id === 'trades'
            ? b.trades - a.trades || b.waivers - a.waivers
            : b.waivers - a.waivers || b.trades - a.trades
    );
    $: sortedWins = [...(winPercentages || [])].sort((a, b) =>
        active?.id === 'wins' ? b.wins - a.wins || b.percentage - a.percentage : b.percentage - a.percentage
    );
    $: sortedIQ = [...(lineupIQs || [])].sort((a, b) =>
        active?.id === 'potential' ? b.potentialPoints - a.potentialPoints : b.iq - a.iq
    );
</script>

<style>
    /* ============================================================
       RECORDS — same panel language as the home page
       ============================================================ */
    .recordsScope {
        font-family: 'Chakra Petch', 'Roboto', Arial, sans-serif;
        color: var(--mf-text);
    }

    .sectionTitle {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 12px;
        margin: 2.2em 4px 1em;
        padding-bottom: 10px;
        border-bottom: 1px solid var(--mf-line);
    }

    .sectionTitle h4 {
        margin: 0;
        font-size: 1.7rem;
        font-weight: 700;
        line-height: 1;
        letter-spacing: 0.02em;
        color: var(--mf-text);
        text-shadow: 0 0 18px var(--mf-line-strong);
    }

    .sectionTitle span {
        font-size: 0.82rem;
        color: var(--mf-dim);
    }

    .fullFlex {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(min(100%, 460px), 1fr));
        gap: 18px;
        margin: 0 auto 2em;
        align-items: start;
    }

    /* --- tables --- */
    .recordsScope :global(.recordTable),
    .recordsScope :global(.rankingTable) {
        width: 100%;
        margin: 0;
        border-radius: 0;
        background: var(--mf-panel);
        border: 1px solid var(--mf-line);
        box-shadow: none;
        overflow-x: auto;
    }

    .recordsScope :global(.rankingTable) {
        display: block;
        max-width: 760px;
        margin: 0 auto;
    }

    .recordsScope :global(table) {
        width: 100%;
        background: transparent;
        table-layout: auto;
        white-space: normal;
    }

    .recordsScope :global(.mdc-data-table__row),
    .recordsScope :global(.mdc-data-table__header-row) {
        background: transparent;
    }

    .recordsScope :global(.mdc-data-table__cell),
    .recordsScope :global(.mdc-data-table__header-cell) {
        font-family: 'Chakra Petch', 'Roboto', Arial, sans-serif;
        color: var(--mf-text);
        border-bottom-color: var(--mf-line);
    }

    .recordsScope :global(.mdc-data-table__header-cell) {
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--mf-dim);
    }

    .recordsScope :global(.mdc-data-table__header-cell.headerPrimary) {
        padding: 12px 14px;
        font-size: 0.95rem;
        letter-spacing: 0.04em;
        text-transform: none;
        text-align: left;
        color: var(--mf-text);
        background: linear-gradient(90deg, color-mix(in srgb, var(--mf-ion) 16%, transparent), transparent 70%), var(--mf-panel-2);
        border-top: 2px solid var(--mf-ion);
    }

    .recordsScope :global(.mdc-data-table__body .mdc-data-table__row:hover) {
        background: var(--mf-panel-2);
    }

    .recordsScope :global(.mdc-data-table__body .mdc-data-table__cell) {
        font-variant-numeric: tabular-nums;
    }

    /* rank column: gold / silver / bronze for the top three */
    .recordsScope :global(.mdc-data-table__body .mdc-data-table__cell) {
        white-space: normal;
        overflow: visible;
        text-overflow: clip;
    }

    .recordsScope :global(.rank) {
        width: 1%;
        white-space: nowrap !important;
        padding-right: 4px !important;
        font-weight: 700;
        color: var(--mf-ion);
    }
    .recordsScope :global(.mdc-data-table__body .mdc-data-table__row:nth-child(1) .rank) { color: #e5b52a; }
    .recordsScope :global(.mdc-data-table__body .mdc-data-table__row:nth-child(2) .rank) { color: #c9d3e0; }
    .recordsScope :global(.mdc-data-table__body .mdc-data-table__row:nth-child(3) .rank) { color: #d08a4e; }

    .recordsScope :global(.statCell) {
        font-weight: 700;
        color: var(--mf-ion);
    }

    .italic {
        display: block;
        font-style: italic;
        font-size: 0.8em;
        font-weight: 400;
        color: var(--mf-dim);
    }

    .subTitle {
        font-style: italic;
        font-size: 0.75em;
        font-weight: 400;
        color: var(--mf-dim);
        line-height: 1.2em;
        white-space: normal;
    }

    :global(.cellName) {
        cursor: pointer;
        line-height: 1.2em;
        padding-left: 8px;
    }

    :global(.differentialName) {
        padding: 0.7em 0;
    }

    .vs {
        padding-left: 0.6em;
        margin: 0.4em 0;
        font-size: 0.75em;
        font-weight: 700;
        letter-spacing: 0.1em;
        color: var(--mf-dim);
        text-transform: uppercase;
    }

    /* --- view tabs --- */
    .viewTabs {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 6px;
        margin: 0 auto 1.4em;
        max-width: 900px;
    }

    .viewTab {
        padding: 7px 14px;
        font: inherit;
        font-size: 0.78rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--mf-ion);
        background: var(--mf-panel);
        border: 1px solid var(--mf-line-strong);
        cursor: pointer;
        clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px));
        transition: background-color 0.15s ease, color 0.15s ease;
    }

    .viewTab:hover,
    .viewTab:focus-visible {
        background: var(--mf-panel-2);
        outline: none;
    }

    .viewTab.selected {
        background: var(--mf-ion);
        color: var(--mf-on-ion);
        border-color: var(--mf-ion);
    }

    .viewTab.new::after {
        content: 'NEW';
        margin-left: 6px;
        padding: 0 4px;
        font-size: 0.62rem;
        color: var(--mf-plasma);
        border: 1px solid currentColor;
    }

    .viewTab.selected.new::after {
        color: var(--mf-on-ion);
    }

    .rankingPanel {
        margin: 1.6em auto 4em;
    }

    .loadingStreaks {
        max-width: 420px;
        margin: 2em auto;
        text-align: center;
        font-size: 0.85rem;
        color: var(--mf-dim);
    }

    .streakNum {
        font-size: 1.1em;
        font-weight: 700;
        color: var(--mf-ion);
    }

    .liveTag {
        display: inline-block;
        margin-left: 6px;
        padding: 0 5px;
        font-size: 0.62rem;
        font-weight: 700;
        letter-spacing: 0.1em;
        color: var(--mf-up);
        border: 1px solid currentColor;
        vertical-align: 2px;
    }

    .spanText {
        font-size: 0.85em;
        color: var(--mf-dim);
    }

    .finePrint {
        max-width: 760px;
        margin: 0.8em auto 0;
        font-size: 0.75rem;
        line-height: 1.45;
        color: var(--mf-dim);
        text-align: center;
    }

    @media (max-width: 510px) {
        .recordsScope :global(.mdc-data-table__cell),
        .recordsScope :global(.mdc-data-table__header-cell) {
            font-size: 0.78em;
            padding: 2px 8px;
        }
        .recordsScope :global(.mdc-data-table__header-cell.headerPrimary) {
            font-size: 0.85rem;
            padding: 10px 10px;
        }
        .sectionTitle h4 {
            font-size: 1.35rem;
        }
        .viewTab {
            padding: 6px 10px;
            font-size: 0.7rem;
        }
    }

    @media (max-width: 380px) {
        .recordsScope :global(.mdc-data-table__cell),
        .recordsScope :global(.mdc-data-table__header-cell) {
            font-size: 0.7em;
            padding: 2px 5px;
        }
    }
</style>

<div class="recordsScope">
<div class="sectionTitle">
    <h4>{prefix} Records</h4>
    <span>{key == "playoffData" ? "Playoffs" : "Regular season"}</span>
</div>

<div class="fullFlex">
    {#if weekRecords && weekRecords.length}
        <DataTable class="recordTable">
            <Head>
                <Row class="rTableHeader">
                    <Cell class="header headerPrimary" colspan=4>{prefix} {key == "playoffData" ? "Playoff " : ""}Single Week Scoring Records</Cell>
                </Row>
                <Row>
                    <Cell class="header rank"></Cell>
                    <Cell class="header">Manager</Cell>
                    <Cell class="header">Week</Cell>
                    <Cell class="header">Total Points</Cell>
                </Row>
            </Head>
            <Body>
                {#each weekRecords as leagueWeekRecord, ix}
                    <Row>
                        <Cell class="rank">{ix + 1}</Cell>
                        <Cell class="cellName" onclick={() => gotoManager({year: leagueWeekRecord.year || prefix, leagueTeamManagers, rosterID: leagueWeekRecord.rosterID})}>
                            <RecordTeam {leagueTeamManagers} rosterID={leagueWeekRecord.rosterID} year={allTime ? leagueWeekRecord.year : prefix} />
                        </Cell>
                        <Cell>{allTime ? leagueWeekRecord.year + " " : "" }{key == "regularSeasonData" ? "Week " : ""}{leagueWeekRecord.week}</Cell>
                        <Cell>{round(leagueWeekRecord.fpts)}</Cell>
                    </Row>
                {/each}
            </Body>
        </DataTable>
    {/if}

    {#if weekLows && weekLows.length}
        <DataTable class="recordTable">
            <Head>
                <Row>
                    <Cell class="header headerPrimary" colspan=4>{prefix} {key == "playoffData" ? "Playoff " : ""}Single Week Scoring Lows</Cell>
                </Row>
                <Row>
                    <Cell class="header rank"></Cell>
                    <Cell class="header">Manager</Cell>
                    <Cell class="header">Week</Cell>
                    <Cell class="header">Total Points</Cell>
                </Row>
            </Head>
            <Body>
                {#each weekLows as leagueWeekLow, ix}
                    <Row>
                        <Cell class="rank">{ix + 1}</Cell>
                        <Cell class="cellName" onclick={() => gotoManager({year: leagueWeekLow.year || prefix, leagueTeamManagers, rosterID: leagueWeekLow.rosterID})}>
                            <RecordTeam {leagueTeamManagers} rosterID={leagueWeekLow.rosterID} year={allTime ? leagueWeekLow.year : prefix} />
                        </Cell>
                        <Cell>{allTime ? leagueWeekLow.year + " " : "" }{key == "regularSeasonData" ? "Week " : ""}{leagueWeekLow.week}</Cell>
                        <Cell>{round(leagueWeekLow.fpts)}</Cell>
                    </Row>
                {/each}
            </Body>
        </DataTable>
    {/if}

    {#if allTime && key == "regularSeasonData"}
        <DataTable class="recordTable">
            <Head>
                <Row>
                    <Cell class="header headerPrimary" colspan=5>All-Time Highest Season Points<span class="italic">Ranked by PPG</span></Cell>
                </Row>
                <Row>
                    <Cell class="header rank"></Cell>
                    <Cell class="header">Manager</Cell>
                    <Cell class="header">Year</Cell>
                    <Cell class="header">Total Points</Cell>
                    <Cell class="header">PPG</Cell>
                </Row>
            </Head>
            <Body>
                {#each seasonLongRecords as mostSeasonLongPoint, ix}
                    <Row>
                        <Cell class="rank">{ix + 1}</Cell>
                        <Cell class="cellName" onclick={() => gotoManager({year: mostSeasonLongPoint.year, leagueTeamManagers, rosterID: mostSeasonLongPoint.rosterID})}>
                            <RecordTeam {leagueTeamManagers} rosterID={mostSeasonLongPoint.rosterID} year={mostSeasonLongPoint.year} />
                        </Cell>
                        <Cell>{mostSeasonLongPoint.year}</Cell>
                        <Cell>{round(mostSeasonLongPoint.fpts)}</Cell>
                        <Cell>{mostSeasonLongPoint.fptsPerGame}</Cell>
                    </Row>
                {/each}
            </Body>
        </DataTable>
    {/if}
    
    {#if allTime && key == "regularSeasonData"}
        <DataTable class="recordTable">
            <Head>
                <Row>
                    <Cell class="header headerPrimary" colspan=5>All-Time Lowest Season Points<span class="italic">Ranked by PPG</span></Cell>
                </Row>
                <Row>
                    <Cell class="header rank"></Cell>
                    <Cell class="header">Manager</Cell>
                    <Cell class="header">Year</Cell>
                    <Cell class="header">Total Points</Cell>
                    <Cell class="header">PPG</Cell>
                </Row>
            </Head>
            <Body>
                {#each seasonLongLows as leastSeasonLongPoint, ix}
                    <Row>
                        <Cell class="rank">{ix + 1}</Cell>
                        <Cell class="cellName" onclick={() => gotoManager({year: leastSeasonLongPoint.year, leagueTeamManagers, rosterID: leastSeasonLongPoint.rosterID})}>
                            <RecordTeam {leagueTeamManagers} rosterID={leastSeasonLongPoint.rosterID} year={leastSeasonLongPoint.year} />
                        </Cell>
                        <Cell>{leastSeasonLongPoint.year}</Cell>
                        <Cell>{round(leastSeasonLongPoint.fpts)}</Cell>
                        <Cell>{leastSeasonLongPoint.fptsPerGame}</Cell>
                    </Row>
                {/each}
            </Body>
        </DataTable>
    {/if}

    {#if blowouts && blowouts.length}
        <DataTable class="recordTable">
            <Head>
                <Row>
                    <Cell class="header headerPrimary" colspan=4>{prefix} Largest {key == "playoffData" ? "Playoff " : ""}Blowouts</Cell>
                </Row>
                <Row>
                    <Cell class="header rank"></Cell>
                    <Cell class="header">Matchup</Cell>
                    <Cell class="header">Week</Cell>
                    <Cell class="header">Differential</Cell>
                </Row>
            </Head>
            <Body>
                {#each blowouts as blowout, ix}
                    <Row>
                        <Cell class="rank">{ix + 1}</Cell>
                        <Cell class="cellName differentialName">
                            <div class="vsRecord">
                                <div onclick={() => gotoManager({year: blowout.year || prefix, leagueTeamManagers, rosterID: blowout.home.rosterID})}>
                                    <RecordTeam {leagueTeamManagers} rosterID={blowout.home.rosterID} year={allTime ? blowout.year : prefix} compressed={true} points={round(blowout.home.fpts)} />
                                </div>
                                <p class="vs">
                                    vs
                                </p>
                                <div onclick={() => gotoManager({year: blowout.year || prefix, leagueTeamManagers, rosterID: blowout.away.rosterID})}>
                                    <RecordTeam {leagueTeamManagers} rosterID={blowout.away.rosterID} year={allTime ? blowout.year : prefix} compressed={true} points={round(blowout.away.fpts)} />
                                </div>
                            </div>
                        </Cell>
                        <Cell>{allTime ? blowout.year + " " : "" }{key == "regularSeasonData" ? "Week " : ""}{blowout.week}</Cell>
                        <Cell>{round(blowout.differential)}</Cell>
                    </Row>
                {/each}
            </Body>
        </DataTable>
    {/if}

    {#if closestMatchups && closestMatchups.length}
        <DataTable class="recordTable">
            <Head>
                <Row>
                    <Cell class="header headerPrimary" colspan=4>{prefix} Narrowest {key == "playoffData" ? "Playoff " : ""}Wins</Cell>
                </Row>
                <Row>
                    <Cell class="header rank"></Cell>
                    <Cell class="header">Matchup</Cell>
                    <Cell class="header">Week</Cell>
                    <Cell class="header">Differential</Cell>
                </Row>
            </Head>
            <Body>
                {#each closestMatchups as closestMatchup, ix}
                    <Row>
                        <Cell class="rank">{ix + 1}</Cell>
                        <Cell class="cellName differentialName">
                            <div class="vsRecord">
                                <div onclick={() => gotoManager({year: closestMatchup.year || prefix, leagueTeamManagers, rosterID: closestMatchup.home.rosterID})}>
                                    <RecordTeam {leagueTeamManagers} rosterID={closestMatchup.home.rosterID} year={allTime ? closestMatchup.year : prefix} compressed={true} points={round(closestMatchup.home.fpts)} />
                                </div>
                                <p class="vs">
                                    vs
                                </p>
                                <div onclick={() => gotoManager({year: closestMatchup.year || prefix, leagueTeamManagers, rosterID: closestMatchup.away.rosterID})}>
                                    <RecordTeam {leagueTeamManagers} rosterID={closestMatchup.away.rosterID} year={allTime ? closestMatchup.year : prefix} compressed={true} points={round(closestMatchup.away.fpts)} />
                                </div>
                            </div>
                        </Cell>
                        <Cell>{allTime ? closestMatchup.year + " " : "" }{key == "regularSeasonData" ? "Week " : ""}{closestMatchup.week}</Cell>
                        <Cell>{round(closestMatchup.differential)}</Cell>
                    </Row>
                {/each}
            </Body>
        </DataTable>
    {/if}
</div>


<div class="sectionTitle">
    <h4>{prefix} {playoffWord()}Rankings</h4>
    <span>Pick a stat: the chart and table update together</span>
</div>

<div class="viewTabs" role="tablist">
    {#each views as view}
        <button type="button" role="tab" class="viewTab" class:selected={active?.id === view.id} class:new={view.id === 'streaks'} aria-selected={active?.id === view.id} onclick={() => (curView = view.id)}>
            {view.short}
        </button>
    {/each}
</div>

{#if active?.graph}
    {#key active.id + key}
        <BarChart graphs={[active.graph]} curGraph={0} {leagueTeamManagers} />
    {/key}
{/if}

<div class="rankingPanel">
    {#if active?.table === 'iq'}
        <DataTable class="rankingTable">
            <Head>
                <Row>
                    <Cell class="header headerPrimary" colspan=5>
                        {prefix} {playoffWord()}Lineup IQ Rankings
                        <div class="subTitle">How well managers get the most out of their roster</div>
                    </Cell>
                </Row>
                <Row>
                    <Cell class="header"></Cell>
                    <Cell class="header">Manager</Cell>
                    <Cell class="header">Lineup IQ</Cell>
                    <Cell class="header">Points</Cell>
                    <Cell class="header">Potential</Cell>
                </Row>
            </Head>
            <Body>
                {#each sortedIQ as lineupIQ, ix}
                    <Row>
                        <Cell class="rank">{ix + 1}</Cell>
                        <Cell class="cellName" onclick={() => gotoManager({year: lineupIQ.year || prefix, leagueTeamManagers, managerID: lineupIQ.managerID, rosterID: lineupIQ.rosterID})}>
                            <RecordTeam {leagueTeamManagers} managerID={lineupIQ.managerID} rosterID={lineupIQ.rosterID} year={allTime ? lineupIQ.year : prefix} />
                        </Cell>
                        <Cell class={active.id === 'iq' ? 'statCell' : ''}>{lineupIQ.iq}%</Cell>
                        <Cell>{round(lineupIQ.fpts)}</Cell>
                        <Cell class={active.id === 'potential' ? 'statCell' : ''}>{round(lineupIQ.potentialPoints)}</Cell>
                    </Row>
                {/each}
            </Body>
        </DataTable>
    {:else if active?.table === 'win'}
        <DataTable class="rankingTable">
            <Head>
                <Row>
                    <Cell class="header headerPrimary" colspan=6>{prefix} {playoffWord()}{active.id === 'wins' ? 'Wins' : 'Win Percentage'} Rankings</Cell>
                </Row>
                <Row>
                    <Cell class="header"></Cell>
                    <Cell class="header">Manager</Cell>
                    <Cell class="header">Win %</Cell>
                    <Cell class="header">Wins</Cell>
                    {#if showTies}
                        <Cell class="header">Ties</Cell>
                    {/if}
                    <Cell class="header">Losses</Cell>
                </Row>
            </Head>
            <Body>
                {#each sortedWins as winPercentage, ix}
                    <Row>
                        <Cell class="rank">{ix + 1}</Cell>
                        <Cell class="cellName" onclick={() => gotoManager({year: winPercentage.year || prefix, leagueTeamManagers, rosterID: winPercentage.rosterID, managerID: winPercentage.managerID})}>
                            <RecordTeam {leagueTeamManagers} managerID={winPercentage.managerID} rosterID={winPercentage.rosterID} year={allTime ? winPercentage.year : prefix} />
                        </Cell>
                        <Cell class={active.id === 'winPct' ? 'statCell' : ''}>{winPercentage.percentage}%</Cell>
                        <Cell class={active.id === 'wins' ? 'statCell' : ''}>{winPercentage.wins}</Cell>
                        {#if showTies}
                            <Cell>{winPercentage.ties}</Cell>
                        {/if}
                        <Cell>{winPercentage.losses}</Cell>
                    </Row>
                {/each}
            </Body>
        </DataTable>
    {:else if active?.table === 'points'}
        <DataTable class="rankingTable">
            <Head>
                <Row>
                    <Cell class="header headerPrimary" colspan=5>{prefix} {playoffWord()}Fantasy Points Rankings</Cell>
                </Row>
                <Row>
                    <Cell class="header"></Cell>
                    <Cell class="header">Manager</Cell>
                    <Cell class="header">Points For</Cell>
                    <Cell class="header">Against</Cell>
                    <Cell class="header">Per Game</Cell>
                </Row>
            </Head>
            <Body>
                {#each fptsHistories as fptsHistory, ix}
                    <Row>
                        <Cell class="rank">{ix + 1}</Cell>
                        <Cell class="cellName" onclick={() => gotoManager({year: fptsHistory.year || prefix, leagueTeamManagers, rosterID: fptsHistory.rosterID, managerID: fptsHistory.managerID})}>
                            <RecordTeam {leagueTeamManagers} managerID={fptsHistory.managerID} rosterID={fptsHistory.rosterID} year={allTime ? fptsHistory.year : prefix} />
                        </Cell>
                        <Cell class="statCell">{round(fptsHistory.fptsFor)}</Cell>
                        <Cell>{round(fptsHistory.fptsAgainst)}</Cell>
                        <Cell>{round(fptsHistory.fptsPerGame)}</Cell>
                    </Row>
                {/each}
            </Body>
        </DataTable>
    {:else if active?.table === 'transactions'}
        <DataTable class="rankingTable">
            <Head>
                <Row>
                    <Cell class="header headerPrimary" colspan=4>{prefix} Transaction Totals<span class="italic">Sorted by {active.id === 'trades' ? 'trades' : 'waiver moves'}</span></Cell>
                </Row>
                <Row>
                    <Cell class="header"></Cell>
                    <Cell class="header">Manager</Cell>
                    <Cell class="header">Trades</Cell>
                    <Cell class="header">Waivers</Cell>
                </Row>
            </Head>
            <Body>
                {#each sortedTransactions as transaction, ix (transaction.managerID || transaction.rosterID)}
                    <Row>
                        <Cell class="rank">{ix + 1}</Cell>
                        <Cell class="cellName" onclick={() => gotoManager({year: transaction.year || prefix, leagueTeamManagers, rosterID: transaction.rosterID, managerID: transaction.managerID})}>
                            <RecordTeam {leagueTeamManagers} managerID={transaction.managerID} rosterID={transaction.rosterID} year={allTime ? transaction.year : prefix} />
                        </Cell>
                        <Cell class={active.id === 'trades' ? 'statCell' : ''}>{transaction.trades}</Cell>
                        <Cell class={active.id === 'waivers' ? 'statCell' : ''}>{transaction.waivers}</Cell>
                    </Row>
                {/each}
            </Body>
        </DataTable>
    {:else if active?.table === 'streaks'}
        {#if streakError}
            <p class="loadingStreaks">Couldn't load game history from Sleeper. Refresh to try again.</p>
        {:else if !streakData}
            <div class="loadingStreaks">
                <p>Going through every game since the league started...</p>
                <LinearProgress indeterminate />
            </div>
        {:else}
            <DataTable class="rankingTable">
                <Head>
                    <Row>
                        <Cell class="header headerPrimary" colspan=5>
                            Longest {playoffWord()}Win Streaks
                            <span class="italic">Current teams · all seasons</span>
                        </Cell>
                    </Row>
                    <Row>
                        <Cell class="header"></Cell>
                        <Cell class="header">Team</Cell>
                        <Cell class="header">Longest</Cell>
                        <Cell class="header">When</Cell>
                        <Cell class="header">Now</Cell>
                    </Row>
                </Head>
                <Body>
                    {#each streakData as s, ix (s.managerID)}
                        <Row>
                            <Cell class="rank">{ix + 1}</Cell>
                            <Cell class="cellName" onclick={() => gotoManager({leagueTeamManagers, rosterID: s.rosterID})}>
                                <RecordTeam {leagueTeamManagers} rosterID={s.rosterID} year={leagueTeamManagers.currentSeason} />
                            </Cell>
                            <Cell><span class="streakNum">{s.streak}</span>{#if s.active}<span class="liveTag">LIVE</span>{/if}</Cell>
                            <Cell><span class="spanText">{streakSpan(s)}</span></Cell>
                            <Cell>{s.current ? `W${s.current}` : '—'}</Cell>
                        </Row>
                    {/each}
                </Body>
            </DataTable>
            <p class="finePrint">
                Consecutive {key == "playoffData" ? "championship-bracket" : "regular-season"} wins by each current team's manager, carried across seasons.
                A loss or tie ends a streak. LIVE means the streak is still going. "Now" is the current run.
                {#if key != "playoffData"}This week's games count once they're final.{/if}
            </p>
        {/if}
    {/if}
</div>
</div>
