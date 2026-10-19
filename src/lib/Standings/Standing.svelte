<script>
    import { gotoManager } from '$lib/utils/helper';
  	import { Row, Cell } from '@smui/data-table';

    export let columnOrder, team, standing, leagueTeamManagers, rank;
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

    .rank {
        font-size: 1.15em;
        font-weight: 700;
    }
</style>

<Row class="contrastRow">
    <Cell class="center"><span class="rank">{rank}</span></Cell>
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
