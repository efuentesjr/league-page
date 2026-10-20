<script>
  	import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';
	import LinearProgress from '@smui/linear-progress';
    import { onMount } from 'svelte';
    import DraftRow from './DraftRow.svelte';
    import { chooseProspects } from '$lib/utils/helperFunctions/rookieProjection';
    import { gotoManager } from '$lib/utils/helper'
	import { getAvatarFromTeamManagers, getTeamNameFromTeamManagers } from '$lib/utils/helperFunctions/universalFunctions';
    
    export let draftData, leagueTeamManagers, previous = false, year, players, startOpen = true;

    let open = startOpen;
    const roundsCount = draftData.draft?.length || 0;
    const teamsCount = draftData.draftOrder?.filter(Boolean).length || 0;

    const {draftOrder, draft, accuracy, reversalRound, draftType, orderInfo} = draftData;

    const groupLabel = (info) => {
        if (!info) return '';
        if (info.group === 'lottery') return `Lottery · ${info.firstPickPct >= 0.5 ? Math.round(info.firstPickPct) : '<1'}% #1`;
        if (info.group === 'nonPlayoff') return 'No balls · random draw';
        if (info.group === 'finalist') return 'Finalist · 15–16 draw';
        return 'Playoffs · 10–14 draw';
    };

    let progress = 0;
    let closed = false;

    onMount(loadAccuracy);

    // Projected rookies for the upcoming board (commissioner's mock before the
    // NFL draft, automatic DynastyProcess projection after it).
    let prospects = previous ? null : chooseProspects(year, null, players);
    onMount(async () => {
        if (previous) return;
        try {
            const res = await fetch(`/api/rookie_projection?season=${year}`);
            const projection = res.ok ? await res.json() : null;
            prospects = chooseProspects(year, projection, players);
        } catch {
            // keep the mock (or nothing) if the projection can't load
        }
    });

    const fmtDate = (d) => {
        if (!d) return '';
        const dt = new Date(`${d}T12:00:00`);
        return isNaN(dt) ? d : dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    };

    function loadAccuracy() {
        if(!accuracy || accuracy === 1) return;
        let timer;
        progress = 0;
        closed = false;
        clearInterval(timer);
        timer = setInterval(() => {
            progress += 0.02;
            if (progress >= accuracy) {
                clearInterval(timer);
                if (progress >= 1) {
                    progress = 1;
                    closed = true;
                }
            }

        }, 100);
    }
</script>

<style>
    /* ============================================================
       DRAFT BOARD — same "model readout" panel as Power Rankings
       ============================================================ */
    .draftPanel {
        width: 96%;
        max-width: 1500px;
        margin: 22px auto 0;
        padding: 22px 16px 24px;
        box-sizing: border-box;
        font-family: 'Chakra Petch', 'Roboto', Arial, sans-serif;
        color: var(--mf-text);
        background:
            linear-gradient(var(--mf-grid) 1px, transparent 1px) 0 0 / 100% 28px,
            linear-gradient(90deg, var(--mf-grid) 1px, transparent 1px) 0 0 / 28px 100%,
            radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--mf-plasma) 22%, transparent), transparent 60%),
            var(--mf-bg);
        border: 1px solid var(--mf-line);
        border-radius: 4px;
        clip-path: polygon(0 0, calc(100% - 22px) 0, 100% 22px, 100% 100%, 22px 100%, 0 calc(100% - 22px));
    }

    .draftPanel.previous {
        margin-top: 14px;
        padding-top: 14px;
        padding-bottom: 14px;
        background:
            linear-gradient(var(--mf-grid) 1px, transparent 1px) 0 0 / 100% 28px,
            linear-gradient(90deg, var(--mf-grid) 1px, transparent 1px) 0 0 / 28px 100%,
            var(--mf-bg);
    }

    .draftHeader {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 12px;
        width: 100%;
        margin: 0 0 14px;
        padding: 0 4px 12px;
        border: 0;
        border-bottom: 1px solid var(--mf-line);
        background: none;
        color: inherit;
        font: inherit;
        text-align: left;
    }

    .previous .draftHeader {
        cursor: pointer;
        align-items: center;
    }

    .previous.closed .draftHeader {
        margin-bottom: 0;
        padding-bottom: 0;
        border-bottom: 0;
    }

    .draftTitle {
        margin: 0;
        font-size: 2rem;
        font-weight: 700;
        line-height: 1;
        letter-spacing: 0.02em;
        color: var(--mf-text);
        text-shadow: 0 0 18px var(--mf-line-strong);
    }

    .previous .draftTitle {
        font-size: 1.35rem;
    }

    .draftSubtitle {
        font-size: 0.85rem;
        font-weight: 500;
        color: var(--mf-dim);
        text-align: right;
    }

    .draftSubtitle strong {
        color: var(--mf-ion);
        font-weight: 700;
    }

    .chevron {
        display: inline-block;
        margin-left: 8px;
        color: var(--mf-ion);
        transition: transform 0.15s ease;
    }

    .open .chevron {
        transform: rotate(90deg);
    }

    .accuracy {
        display: block;
        width: 80%;
        max-width: 800px;
        margin: 0.5em auto 1.5em;
    }

    .accuracyText {
        font-size: 0.75em;
        color: var(--mf-dim);
    }

    .disclaimer {
        font-style: italic;
    }

    .orderNote {
        max-width: 80ch;
        margin: 0 auto 0.8em;
        font-size: 0.85em;
        line-height: 1.45;
        color: var(--mf-dim);
        text-align: center;
    }

    .prospectNote {
        margin-top: -0.2em;
    }

    .orderNote strong {
        color: var(--mf-text);
    }

    /* --- board --- */
    :global(.draftPanel .draftBoard) {
        display: block;
        width: 100%;
        margin: 1em 0 0;
        overflow-x: auto;
        background: transparent;
        border: 1px solid var(--mf-line);
        border-radius: 0;
    }

    :global(.draftPanel .draftBoard table) {
        border-collapse: separate;
        border-spacing: 3px;
        table-layout: fixed;
        width: 100%;
        min-width: 1200px;
        background: transparent;
    }

    :global(.draftPanel .draftBoard .mdc-data-table__row),
    :global(.draftPanel .draftBoard .mdc-data-table__header-row) {
        background: transparent !important;
        border: 0;
    }

    :global(.draftPanel .draftBoard td) {
        height: 7em;
        font-size: 0.7em;
        font-family: 'Chakra Petch', 'Roboto', Arial, sans-serif;
        background: var(--mf-panel);
        border: 1px solid var(--mf-line) !important;
        transition: border-color 0.15s ease, background-color 0.15s ease;
    }

    :global(.draftPanel .draftBoard td:hover) {
        border-color: var(--mf-line-strong) !important;
        background-color: var(--mf-panel-2);
    }

    :global(.draftPanel .upcomingBoard table) {
        min-width: 1400px;
    }

    :global(.draftPanel .upcomingBoard td) {
        height: 12.5em;
    }

    :global(.draftPanel .draftTeam) {
        font-size: 0.8em;
        font-family: 'Chakra Petch', 'Roboto', Arial, sans-serif;
        font-weight: 600;
        text-align: center;
        padding: 6px 2px;
        color: var(--mf-text) !important;
        background: linear-gradient(180deg, color-mix(in srgb, var(--mf-ion) 14%, transparent), transparent 80%), var(--mf-panel-2) !important;
        border: 1px solid var(--mf-line) !important;
        border-top: 2px solid var(--mf-ion) !important;
        white-space: break-spaces;
        line-height: 1.1em;
        height: 5em;
        vertical-align: initial;
    }

    .avatar {
        border-radius: 50%;
        height: 30px;
        width: 30px;
        margin: 0.4em 0;
        border: 1px solid var(--mf-ion);
        box-shadow: 0 0 8px var(--mf-ion-glow);
    }

    .clickable {
        cursor: pointer;
    }

    .orderTag {
        display: inline-block;
        margin: 2px 0;
        padding: 0 5px;
        font-size: 0.7em;
        font-weight: 700;
        white-space: nowrap;
        border: 1px solid currentColor;
    }

    .tag-lottery {
        color: #d9a62e;
    }

    .tag-nonPlayoff {
        color: var(--mf-dim);
    }

    .tag-playoff {
        color: var(--mf-plasma);
    }

    .tag-finalist {
        color: var(--mf-up);
    }

    :global(.curDraftName) {
        color: var(--mf-dim);
        font-size: 0.8em;
        font-style: italic;
        font-weight: 400;
    }

    @media (max-width: 600px) {
        .draftPanel {
            width: calc(100% - 16px);
            padding: 16px 8px 18px;
        }

        .draftHeader {
            flex-direction: column;
            align-items: flex-start;
            gap: 6px;
        }

        .previous .draftHeader {
            flex-direction: row;
            align-items: center;
        }

        .draftTitle {
            font-size: 1.5rem;
        }

        .previous .draftTitle {
            font-size: 1.15rem;
        }

        .draftSubtitle {
            text-align: left;
        }
    }
</style>

<section class="draftPanel" class:previous class:open class:closed={!open}>
    {#if previous}
        <button type="button" class="draftHeader" aria-expanded={open} onclick={() => (open = !open)}>
            <h3 class="draftTitle">{year} Draft<span class="chevron" aria-hidden="true">▸</span></h3>
            <span class="draftSubtitle"><strong>{roundsCount}</strong> rounds · <strong>{roundsCount * teamsCount}</strong> picks</span>
        </button>
    {:else}
        <div class="draftHeader">
            <h3 class="draftTitle">{year} Rookie Draft</h3>
            <span class="draftSubtitle"><strong>Upcoming</strong> · {roundsCount} rounds · {roundsCount * teamsCount} picks</span>
        </div>
    {/if}

{#if open}
{#if accuracy && accuracy !== 1 && !closed}
    <div class="accuracy">
        <div class="accuracyText">
            Upcoming draft order accuracy: {parseInt(progress*100)}%
            <span class="disclaimer">(accuracy will improve as the regular season progresses)</span>
        </div>
        <LinearProgress {progress} {closed} />
    </div>
{/if}

{#if orderInfo && !previous}
    <p class="orderNote">
        Projected order under <a href="/constitution#draft-order">Constitution 3.4</a>, using <a href="/playoff-odds">Lottery Watch</a> odds.
        Picks 1–9 are the lottery pool (the 8th seed plus non-playoff teams): ball teams on top by #1 odds, then teams with no balls.
        Picks 10–14 and 15–16 are drawn among playoff teams. Every group is a live drawing, so this shows the most likely spot.
    </p>
{/if}

{#if prospects && !previous}
    <p class="orderNote prospectNote">
        <strong>Players in the squares:</strong> {prospects.label}{prospects.updated ? `, updated ${fmtDate(prospects.updated)}` : ''}.
        {#if prospects.mode === 'auto'}
            Rankings refresh weekly until the draft.
        {:else}
            After the NFL draft in April, this switches on its own to an automatic projection of real rookies, refreshed weekly.
        {/if}
        Just a projection: owners pick whoever they want.
    </p>
{/if}

<DataTable class="draftBoard{prospects && !previous ? ' upcomingBoard' : ''}">
    <Head>
        <Row>
            {#each draftOrder as draftPosition}
                {#if draftPosition}
                    <Cell class="draftTeam">
                        <img class="avatar clickable" onclick={() => gotoManager({year, leagueTeamManagers, rosterID: draftPosition})} src="{getAvatarFromTeamManagers(leagueTeamManagers, draftPosition, year)}" alt="{getTeamNameFromTeamManagers(leagueTeamManagers, draftPosition, year)} avatar"/>
                        <br />
                        {#if orderInfo?.[String(draftPosition)] && !previous}
                            <span class="orderTag tag-{orderInfo[String(draftPosition)].group}">{groupLabel(orderInfo[String(draftPosition)])}</span>
                            <br />
                        {/if}
                        <span class="clickable" onclick={() => gotoManager({year, leagueTeamManagers, rosterID: draftPosition})}>{getTeamNameFromTeamManagers(leagueTeamManagers, draftPosition, year)}{@html getTeamNameFromTeamManagers(leagueTeamManagers, draftPosition, year) != getTeamNameFromTeamManagers(leagueTeamManagers, draftPosition) ? `<br /><span class="curDraftName">(${getTeamNameFromTeamManagers(leagueTeamManagers, draftPosition)})</span>` : ''}</span>
                    </Cell>
                {/if}
            {/each}
        </Row>
    </Head>
    <Body>
        {#each draft as draftRow, row}
            <DraftRow {draftRow} row={row + 1} {previous} prospects={prospects?.picks} {reversalRound} {draftType} {players} {leagueTeamManagers} {year} />
        {/each}
    </Body>
</DataTable>
{/if}
</section>
