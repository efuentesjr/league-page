<script>
    import { gotoManager } from '$lib/utils/helper';
  	import { Row, Cell } from '@smui/data-table';

    export let columnOrder, team, standing, leagueTeamManagers, rank;
    export let ball = null;
</script>

<style>
    .clickable {
        cursor: pointer;
    }
	
	.teamAvatar {
		vertical-align: middle;
		border-radius: 50%;
		height: 40px;
		margin-right: 15px;
		border: 0.25px solid #775;
	}

    :global(.contrastRow) {
        background-color: var(--f8f8f8);
    }

    .team {
        text-align: center;
    }

    /* narrow # column; the ball sits on the number's top-right corner like a badge */
    :global(.rankCell) {
        width: 1%;
        padding-left: 4px !important;
        padding-right: 4px !important;
    }

    .rankWrap {
        position: relative;
        display: inline-block;
        padding: 0 13px;
    }

    .ball {
        position: absolute;
        left: calc(100% - 13px);
        top: -7px;

        display: inline-flex;
        align-items: center;
        justify-content: center;

        width: 15px;
        height: 15px;
        border-radius: 50%;

        font-size: 9px;
        font-weight: 800;
        line-height: 1;
        color: #1a1a1a;

        background: radial-gradient(circle at 35% 30%, #fff6b3 0%, #ffd400 45%, #c99a00 100%);
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
    }

    .rank {
        font-weight: 600;
        font-variant-numeric: tabular-nums;
    }
</style>

<Row class="contrastRow">
    <Cell class="center rankCell">
        <span class="rankWrap">
            <span class="rank">{rank}</span>
            {#if ball != null}
                <span class="ball">{ball}</span>
            {/if}
        </span>
    </Cell>
    <Cell class="">
        <div class="clickable team" onclick={() => gotoManager({leagueTeamManagers, rosterID: standing.rosterID})}>
            <img alt="team avatar" class="teamAvatar clickable" src="{team.avatar}" />
            <div>
                {team.name}
            </div>
        </div>
    </Cell>
    {#each columnOrder as column}
        <Cell class="center">{standing[column.field]}</Cell>
    {/each}
</Row>
