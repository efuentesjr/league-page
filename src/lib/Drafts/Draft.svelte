<script>
    import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';
    import LinearProgress from '@smui/linear-progress';
    import { onMount } from 'svelte';
    import DraftRow from './DraftRow.svelte';
    import { gotoManager } from '$lib/utils/helper';
    import { getAvatarFromTeamManagers, getTeamNameFromTeamManagers } from '$lib/utils/helperFunctions/universalFunctions';

    export let draftData, leagueTeamManagers, previous = false, year, players;

    const { draftOrder, draft, accuracy, reversalRound, draftType } = draftData;

    let progress = 0;
    let closed = false;

    onMount(loadAccuracy);

    function loadAccuracy() {
        if (!accuracy) return;
        let timer;
        progress = 0;
        closed = false;
        clearInterval(timer);
        timer = setInterval(() => {
            progress += 0.01;
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

    :global(.draftBoard td:last-of-type) {
        border-right: none;
    }

    .avatar {
        border-radius: 50%;
        height: 50px;
        width: 50px;
        object-fit: cover;
        margin: auto;
    }

    .clickable {
        cursor: pointer;
    }

    :global(.curDraftName) {
        color: #888;
        font-size: 0.7em;
        font-style: italic;
    }
</style>

<!-- Accuracy Progress Bar -->
{#if accuracy && !closed}
    <div class="accuracy">
        <div class="accuracyText">
            Upcoming draft order accuracy: {parseInt(progress * 100)}%
            <span class="disclaimer">(accuracy will improve as the regular season progresses)</span>
        </div>
        <LinearProgress {progress} {closed} />
    </div>
{/if}

<!-- Draft Table -->
<DataTable class="draftBoard">
    <Head>
        <Row>
            {#each draftOrder as draftPosition}
                {#if draftPosition}
                    <Cell class="draftTeam">
                        <img 
                            class="avatar clickable" 
                            on:click={() => gotoManager({ year, leagueTeamManagers, rosterID: draftPosition })} 
                            src="{getAvatarFromTeamManagers(leagueTeamManagers, draftPosition, year)}" 
                            alt="{getTeamNameFromTeamManagers(leagueTeamManagers, draftPosition, year)} avatar"
                        />
                        <br />
                        <span class="clickable" on:click={() => gotoManager({ year, leagueTeamManagers, rosterID: draftPosition })}>
                            {getTeamNameFromTeamManagers(leagueTeamManagers, draftPosition, year)}
                            {@html getTeamNameFromTeamManagers(leagueTeamManagers, draftPosition, year) != getTeamNameFromTeamManagers(leagueTeamManagers, draftPosition) 
                                ? `<br /><span class="curDraftName">(${getTeamNameFromTeamManagers(leagueTeamManagers, draftPosition)})</span>` 
                                : ''}
                        </span>
                    </Cell>
                {/if}
            {/each}
        </Row>
    </Head>
    <Body>
        {#each draft as draftRow, row}
            <Row>
                <!-- Loop through each cell in the row -->
                {#each draftRow as draftCol, col}
                    <Cell>
                        {#if row === 0 && col === 0}
                            <!-- Hardcoded TH.png for 1.1 -->
                            <img src="./TH.png" alt="Player Image" class="avatar" />
                        {:else}
                            <!-- Render empty cell or dynamic data -->
                            <DraftRow {draftRow} row={row + 1} {previous} {reversalRound} {draftType} {players} {leagueTeamManagers} {year} />
                        {/if}
                    </Cell>
                {/each}
            </Row>
        {/each}
    </Body>
</DataTable>
