<script>
    import { getTeamNameFromTeamManagers } from '$lib/utils/helperFunctions/universalFunctions';
    import { Row, Cell } from '@smui/data-table';

    // Props passed to this component
    export let mockDraftRow, mockPlayers, row, draftType, reversalRound, leagueTeamManagers, year;
</script>

<style>
    :global(.mockDraftCell) {
        background-color: var(--mockDraftHighlight); /* Highlight mock draft cells */
        border: 1px solid var(--mockDraftBorder); /* Optional border for clarity */
    }

    .draftPos {
        position: absolute;
        top: 0.3em;
        left: 0.3em;
        font-style: italic;
        color: #aaa;
    }

    .newOwner {
        font-style: italic;
        color: #444;
        text-align: center;
        white-space: break-spaces;
        line-height: 1.2em;
    }

    .playerAvatar {
        display: inline-block;
        position: absolute;
        transform: translate(-50%, -50%);
        left: 50%;
        top: 45%;
        height: 30px;
        width: 30px;
        background-position: center;
        border-radius: 50%;
        background-repeat: no-repeat;
        background-size: cover;
    }

    .name {
        display: block;
        width: 100%;
        text-align: center;
        position: absolute;
        left: 0;
        white-space: break-spaces;
        line-height: 1em;
        bottom: 0.5em;
        color: rgba(0, 0, 0, 0.87);
    }
</style>

<Row>
    {#each mockDraftRow as draftCol, col}
        <Cell class="mockDraftCell">
            <!-- Draft Position -->
            <span class="draftPos">
                {row}.{col + 1}
            </span>

            <!-- Team or Player Details -->
            {#if draftCol}
                <!-- Team Name -->
                <div class="newOwner">
                    {getTeamNameFromTeamManagers(leagueTeamManagers, draftCol.newOwner, year)}
                </div>

                <!-- Player Avatar -->
                <div
                    class="playerAvatar"
                    style="background-image: url(https://collegeplayerscdn.com/images/{mockPlayers[draftCol.player].id}.jpg), url('/default_player_image.png')">
                </div>

                <!-- Player Name and Details -->
                <div class="name">
                    {mockPlayers[draftCol.player].name}
                    ({mockPlayers[draftCol.player].position}, {mockPlayers[draftCol.player].college})
                </div>
            {/if}
        </Cell>
    {/each}
</Row>

