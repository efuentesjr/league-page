<script>
    import { gotoManager } from '$lib/utils/helper';
    import { getLogoColor } from '$lib/utils/logoColor';
  	import { Row, Cell } from '@smui/data-table';

    export let columnOrder, team, standing, leagueTeamManagers, rank;
    export let ball = null;

    // team color pulled from the logo, same as Power Rankings
    let teamColor = null;
    $: getLogoColor(team?.avatar).then((c) => (teamColor = c)).catch(() => {});
    $: rowStyle = teamColor
        ? `--teamColor: ${teamColor}; --teamDark: color-mix(in srgb, ${teamColor} 30%, #000);`
        : '';
</script>

<style>
    /* ---------- team colors, like Power Rankings ---------- */
    :global(.teamRow) {
        --teamColor: #34495e;
        --teamDark: #151d24;
    }

    :global(.teamRow .rankCell) {
        position: relative;
        isolation: isolate;
    }

    /* angled slab in the team's color behind the rank number */
    .rankSlab {
        position: absolute;
        inset: 0;
        z-index: -1;
        background: linear-gradient(160deg, var(--teamColor), var(--teamDark));
        clip-path: polygon(0 0, 100% 0, 80% 100%, 0 100%);
    }

    :global(.teamRow .teamCell) {
        background: linear-gradient(90deg, color-mix(in srgb, var(--teamColor) 32%, transparent), transparent 85%);
    }

    :global(.teamRow:hover .teamCell) {
        background: linear-gradient(90deg, color-mix(in srgb, var(--teamColor) 45%, transparent), transparent 90%);
    }

    .clickable {
        cursor: pointer;
    }
	
	.teamAvatar {
		flex: none;
		width: 40px;
		height: 40px;
		border-radius: 50%;
		object-fit: cover;
		border: 2px solid color-mix(in srgb, var(--teamColor) 70%, white);
		box-shadow: 0 0 12px -2px color-mix(in srgb, var(--teamColor) 70%, transparent);
	}

    :global(.contrastRow) {
        background-color: var(--f8f8f8);
    }

    .team {
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 180px;
        text-align: left;
    }

    .teamName {
        font-weight: 600;
        white-space: nowrap;
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
        font-size: 1.15em;
        font-weight: 700;
        color: #fff;
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
        font-variant-numeric: tabular-nums;
    }

    @media (max-width: 600px) {
        .team {
            min-width: 140px;
            gap: 8px;
        }
        .teamAvatar {
            width: 30px;
            height: 30px;
        }
        .teamName {
            white-space: normal;
        }
    }
</style>

<Row class="contrastRow teamRow" style={rowStyle}>
    <Cell class="center rankCell">
        <span class="rankSlab" aria-hidden="true"></span>
        <span class="rankWrap">
            <span class="rank">{rank}</span>
            {#if ball != null}
                <span class="ball">{ball}</span>
            {/if}
        </span>
    </Cell>
    <Cell class="teamCell">
        <div class="clickable team" onclick={() => gotoManager({leagueTeamManagers, rosterID: standing.rosterID})}>
            <img alt="team avatar" class="teamAvatar clickable" src="{team.avatar}" />
            <div class="teamName">
                {team.name}
            </div>
        </div>
    </Cell>
    {#each columnOrder as column}
        <Cell class="center">{standing[column.field]}</Cell>
    {/each}
</Row>
