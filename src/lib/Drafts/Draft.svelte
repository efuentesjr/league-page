<script>
  	import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';
	import LinearProgress from '@smui/linear-progress';
    import { onMount } from 'svelte';
    import DraftRow from './DraftRow.svelte';
    import { chooseProspects } from '$lib/utils/helperFunctions/rookieProjection';
    import { gotoManager } from '$lib/utils/helper'
	import { getAvatarFromTeamManagers, getTeamNameFromTeamManagers } from '$lib/utils/helperFunctions/universalFunctions';
    
    export let draftData, leagueTeamManagers, previous = false, year, players;

    const {draftOrder, draft, accuracy, reversalRound, draftType, orderInfo} = draftData;

    const groupLabel = (info) => {
        if (!info) return '';
        if (info.group === 'lottery') return `Lottery · ${info.firstPickPct >= 0.5 ? Math.round(info.firstPickPct) : '<1'}% #1`;
        if (info.group === 'nonPlayoff') return 'Non-playoff';
        return 'Playoffs';
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
    .accuracy {
        display: block;
        width: 80%;
        max-width: 800px;
        margin: 2em auto 3em;
    }

    .accuracyText {
        font-size: 0.7em;
        color: #666;
    }

    .disclaimer {
        font-style: italic;
        color: #888;
    }

    :global(.draftBoard) {
        display: block;
        width: 95%;
        margin: 2em auto 3em;
        overflow-x: auto;
    }

	:global(.draftTeam) {
        font-size: 0.8em;
		text-align: center;
		padding: 5px 0;
		background-color: var(--transactHeader);
        white-space: break-spaces;
        line-height: 1em;
        height: 5em;
        vertical-align: initial;
	}

	:global(.draftBoard table) {
        border-collapse: collapse;
        table-layout: fixed;
        width: 100%;
        min-width: 1200px;
	}

    :global(.draftBoard td) {
        border-right: 1px solid #ddd;
        height: 7em;
        font-size: 0.7em;
    }

    :global(.upcomingBoard td) {
        height: 10em;
    }

    :global(.draftBoard td:last-of-type) {
        border-right: none;
    }

	.avatar {
		border-radius: 50%;
        height: 30px;
        width: 30px;
        margin: 0.4em 0;
		border: 0.25px solid #777;
	}

    .clickable {
        cursor: pointer;
    }
	
    .orderNote {
        max-width: 72ch;
        margin: 0 auto 1em;
        font-size: 0.85em;
        line-height: 1.45;
        color: var(--mf-dim);
        text-align: center;
    }

    .prospectNote {
        margin-top: -0.4em;
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
        color: var(--mf-ion);
    }

	:global(.curDraftName) {
        color: #888;
        font-size: 0.7em;
        font-style: italic;
    }
</style>

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
        Projected order from <a href="/playoff-odds">Lottery Watch</a>: lottery teams first (best #1 pick odds),
        then other non-playoff teams (worst record first), then playoff teams by projected finish (title favorite picks last).
        The real order is set by the lottery drawing.
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
