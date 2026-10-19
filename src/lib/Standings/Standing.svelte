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

    .rankWrap {
        display: inline-flex;
        align-items: center;
        gap: 6px;
    }

    .ball {
        display: inline-flex;
        align-items: center;
        justify-content: center;

        width: 18px;
        height: 18px;
        border-radius: 50%;

        font-size: 11px;
        font-weight: 800;
        line-height: 1;
        color: #1a1a1a;

        background: radial-gradient(circle at 35% 30%, #ffffff 0%, #f1f1f1 45%, #bdbdbd 100%);
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
    }

    .rank {
        font-size: 1.15em;
        font-weight: 700;
    }
</style>

<Row class="contrastRow">
    <Cell class="center">
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
