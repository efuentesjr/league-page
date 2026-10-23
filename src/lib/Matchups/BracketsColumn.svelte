<script>
    import { round } from "$lib/utils/helper";
	import { getAvatarFromTeamManagers, getTeamNameFromTeamManagers } from "$lib/utils/helperFunctions/universalFunctions";

    export let leagueTeamManagers, players, matchCol, playoffsStart, ix, playoffLength, consolation = false, losers = false, numRosters, consolationNum, selected;

    let label = '';

    const setLabel = (l) => {
        if(matchCol.length > 1) {
            switch (playoffLength - ix) {
                case 1:
                    if(losers) {
                        label = 'Toilet Bowl'
                    } else {
                        label = 'Championship Match'
                    }
                    break;
                case 2:
                    label = 'Semifinals'
                    break;
                case 3:
                    label = 'Quarterfinals'
                    break;
                case 3:
                    label = 'Eighth-Finals'
                    break;
            
                default:
                    break;
            }
        } else {
            // If it's not a consolation match the only single matchup is the final
            if(!consolation) {
                if(losers) {
                    label = 'Toilet Bowl'
                } else {
                    label = 'Championship Match'
                }
                return;
            }
            if(losers) {
                label = nThPlace(numRosters - (2 * (consolationNum + 1)));
            } else {
                label = nThPlace(1 + (2 * (consolationNum + 1)));
            }
        }
    }

    const nThPlace = (num) => {
        let end = 'th';
        switch (num % 10) {
            case 3:
                end = 'rd'
                break;
            case 2:
                end = 'nd'
                break;
            case 1:
                end = 'st'
                break;
            default:
                break;
        }
        return `${num}${end} Place`
    }

    $: setLabel(losers)

    let anchors = {};
    let drawBracket = false;
    const setDrawBracket = (col) => {
        if(col.length % 2 == 0) {
            drawBracket = true;
        } else {
            drawBracket = false;
        }
    }
    $: setDrawBracket(matchCol)

    const duos = matchCol.length / 2;
    for(let i = 0; i < duos; i++) {
        anchors[i] = {
            t: null,
            b: null,
            yTop: null,
            yBottom: null,
            yMiddle: null,
            xLeft: null,
            xMiddle: null,
            xRight: null,
        }
    }

    const getPlayoffName = (manager, bye, season) => {
        if(bye && !manager) {
            return 'BYE';
        }
        if(!manager) {
            return '';
        }
        return getTeamNameFromTeamManagers(leagueTeamManagers, manager, season);
    }

    const calculatePoints = (allPoints) => {
        let totalPoints = 0;
        for(const k in allPoints) {
            const points = allPoints[k];
            if(!points) break;
            for(const point of points) {
                totalPoints += point;
            }
        }
        return round(totalPoints)
    }

    const calculatePotentialPoints = (startersWeeks, ix, p) => {
        if(!startersWeeks) return 0;
        let totalPoints = 0;
        
        for(const k in startersWeeks) {
            const starters = startersWeeks[k];
            if(!starters) break;

            const i = ix + k -1;
            for(const starter of starters) {
                totalPoints += parseFloat(players[starter]?.wi && players[starter].wi[playoffsStart - i]?.p ? players[starter].wi[playoffsStart - i].p : 0);
            }
        }
        return round(totalPoints);
    }

    let el;

    let labelY = 0;
    let labelEl;

    const resize = () => {
        const colTop = el?.getBoundingClientRect()?.top || 0;
        const colLeft = el?.getBoundingClientRect()?.left || 0;
        const colRight = el?.getBoundingClientRect()?.right || 0;
        const colWidth = colRight - colLeft;
        for(const key in anchors) {
            const tTop = anchors[key]?.t?.getBoundingClientRect()?.top || 0;
            const tBottom = anchors[key]?.t?.getBoundingClientRect()?.bottom || 0;
            if(key == 0 && tTop > 0) {
                labelY = tTop - colTop - (labelEl?.offsetHeight || 24) - 8;
            };

            const tLeft= anchors[key]?.t?.getBoundingClientRect()?.left || 0;
            const tRight= anchors[key]?.t?.getBoundingClientRect()?.right || 0;

            const bTop = anchors[key]?.b?.getBoundingClientRect()?.top || 0;
            const bBottom = anchors[key]?.b?.getBoundingClientRect()?.bottom || 0;
            
            anchors[key].yTop = (tBottom + tTop) / 2 - colTop;
            anchors[key].yBottom = (bBottom + bTop) / 2 - colTop;
            anchors[key].yMiddle = (anchors[key].yTop + anchors[key].yBottom) / 2;

            anchors[key].xLeft = (tRight + tLeft) / 2 - (colWidth * ix);
            anchors[key].xMiddle = anchors[key].xLeft + (colWidth / 2);
            anchors[key].xRight = anchors[key].xLeft + colWidth;
        }
    }

    $: resize(innerWidth);
    
    let innerWidth;

    const changeSelection = (m, opponent) => {
        if(m == selected || !opponent) return;
        selected = m;
    }


    $: isFinal = label === 'Championship Match';
    $: shortLabel = ({ 'Championship Match': 'Final', Quarterfinals: 'Quarters', Semifinals: 'Semis', 'Toilet Bowl': 'Toilet Bowl' })[label] || label.replace(' Place', '');

    // the team ahead once both have scored (highlights the leader / winner)
    const leaderOf = (matchups) => {
        if (!matchups?.[0]?.roster_id || !matchups?.[1]?.roster_id) return -1;
        const a = calculatePoints(matchups[0].points), b = calculatePoints(matchups[1].points);
        if (!a || !b || a === b) return -1;
        return a > b ? 0 : 1;
    };
</script>

<svelte:window bind:innerWidth={innerWidth} />

<style>
    .bracketColumn {
        position: relative;
        padding-top: 40px;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        align-items: center;
        flex-grow: 1;
        font-family: 'Chakra Petch', 'Roboto', Arial, sans-serif;
    }

    .label {
        position: absolute;
        top: 0;
        margin: 0;
        padding: 3px 12px;
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        white-space: nowrap;
        color: var(--mf-ion);
        background: var(--mf-panel);
        border: 1px solid var(--mf-line-strong);
        box-shadow: 0 0 14px -6px var(--mf-ion-glow);
    }

    .label .short {
        display: none;
    }

    .label.final {
        color: #1a1203;
        background: linear-gradient(180deg, #fff3c4, #f5d56b 60%, #c9962c);
        border-color: #f5d56b;
        box-shadow: 0 0 18px -4px rgba(245, 213, 107, 0.7);
    }

    .label.toilet {
        color: #d9a62e;
        border-color: color-mix(in srgb, #d9a62e 50%, var(--mf-line));
    }

    .match {
        position: relative;
        width: 280px;
        margin: 2em 1em;
        z-index: 2;
        background:
            linear-gradient(180deg, color-mix(in srgb, var(--mf-ion) 6%, transparent), transparent 40%),
            var(--mf-panel);
        border: 1px solid var(--mf-line);
        border-left: 3px solid var(--mf-line-strong);
        clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px));
        transition: border-color 0.2s, background 0.2s, transform 0.2s;
    }

    .match.final {
        border-color: color-mix(in srgb, #f5d56b 55%, transparent);
        border-left-color: #f5d56b;
        background:
            radial-gradient(ellipse at 50% 0%, rgba(245, 213, 107, 0.18), transparent 70%),
            var(--mf-panel);
    }

    .clickable {
        cursor: pointer;
    }

    .clickable:hover {
        transform: translateY(-2px);
        border-color: var(--mf-line-strong);
    }

    .selected {
        border-color: var(--mf-ion);
        border-left-color: var(--mf-ion);
        background:
            linear-gradient(180deg, color-mix(in srgb, var(--mf-ion) 16%, transparent), transparent 70%),
            var(--mf-panel-2);
    }

    .match.final.selected {
        border-left-color: #f5d56b;
    }

    .manager {
        display: grid;
        grid-template-columns: 30px minmax(0, 1fr) auto;
        align-items: center;
        gap: 10px;
        padding: 9px 12px;
    }

    .manager + .manager {
        border-top: 1px solid var(--mf-line);
    }

    .name {
        min-width: 0;
        overflow: hidden;
        font-size: 0.92rem;
        font-weight: 600;
        line-height: 1.15;
        white-space: nowrap;
        text-overflow: ellipsis;
        color: var(--mf-text);
    }

    .manager.lead .name {
        color: var(--mf-ion);
    }

    .final .manager.lead .name {
        color: #f5d56b;
    }

    .bye,
    .tbd {
        font-weight: 500;
        font-style: italic;
        color: var(--mf-dim);
    }

    .avatar {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        object-fit: cover;
        background: #000;
        border: 1px solid var(--mf-line-strong);
    }

    .avatarBye {
        opacity: 0.25;
        border-style: dashed;
    }

    .points {
        text-align: right;
        font-variant-numeric: tabular-nums;
    }

    .actualPoints {
        font-size: 1.05rem;
        font-weight: 700;
        line-height: 1;
        color: var(--mf-text);
    }

    .manager.lead .actualPoints {
        color: var(--mf-ion);
        text-shadow: 0 0 10px var(--mf-ion-glow);
    }

    .final .manager.lead .actualPoints {
        color: #f5d56b;
        text-shadow: 0 0 10px rgba(245, 213, 107, 0.5);
    }

    .projectedPoints {
        margin-top: 2px;
        font-size: 0.66rem;
        color: var(--mf-dim);
    }

    /* SVG connector lines */
    .lineParent {
        top: 0;
        left: 0;
        position: absolute;
        overflow: visible;
        width: 1px;
        height: 1px;
        pointer-events: none;
    }

    .line {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 1;
        stroke: var(--mf-line-strong);
        stroke-width: 2px;
        filter: drop-shadow(0 0 3px var(--mf-ion-glow));
    }

    @media (max-width: 1000px) {
        .match {
            width: 220px;
        }
    }

    @media (max-width: 800px) {
        .match {
            width: 180px;
        }
        .manager {
            grid-template-columns: 24px minmax(0, 1fr) auto;
            gap: 6px;
            padding: 7px 8px;
        }
        .avatar {
            width: 24px;
            height: 24px;
        }
    }

    @media (max-width: 610px) {
        .match {
            width: 112px;
            margin: 2.2em 0.25em 1.2em;
            font-size: 0.82em;
            clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px));
        }
        .manager {
            grid-template-columns: 18px minmax(0, 1fr);
            gap: 5px;
            padding: 6px 6px;
        }
        .name {
            white-space: normal;
            overflow-wrap: anywhere;
            font-size: 0.8rem;
            line-height: 1.15;
        }
        .points {
            grid-column: 1 / -1;
            text-align: left;
        }
        .actualPoints {
            font-size: 0.92rem;
        }
        .projectedPoints {
            font-size: 0.62rem;
        }
        .avatar {
            width: 18px;
            height: 18px;
        }
        .label {
            max-width: 104px;
            padding: 2px 6px;
            font-size: 0.58rem;
            letter-spacing: 0.08em;
        }
        .label .long {
            display: none;
        }
        .label .short {
            display: inline;
        }
    }

    @media (max-width: 400px) {
        .match {
            width: 100px;
        }
        .name {
            font-size: 0.74rem;
        }
    }

    .spacer {
        background: none;
        border: none;
    }
</style>

<div class="bracketColumn" bind:this={el}>
    {#if matchCol.length}
        <p bind:this={labelEl} class="label" class:final={isFinal} class:toilet={label === 'Toilet Bowl'} ><span class="long">{label}</span><span class="short">{shortLabel}</span></p>
    {/if}
    <!-- If we need to draw a bracket, include anchor points and include svgs to draw the  bracket -->
    {#each matchCol as matchups, inx}
        {@const lead = leaderOf(matchups)}
        <div class="match{matchups[0].m == selected ? ' selected' : ''}{matchups[0].m && matchups[1].roster_id ? ' clickable' : ''}{isFinal ? ' final' : ''}" bind:this={anchors[Math.floor(inx / 2)][inx % 2 == 0 ? 't' : 'b']} onclick={() => {changeSelection(matchups[0].m, matchups[1].roster_id)}}>
            {#each matchups as matchup, side}
                <div class="manager" class:lead={lead === side}>
                    {#if matchup.roster_id || (!matchups.bye && !matchup.roster_id)}
                        <img class="avatar{!matchups.bye && !matchup.roster_id ? ' avatarBye': ''}" src={getAvatarFromTeamManagers(leagueTeamManagers, matchup.roster_id, leagueTeamManagers.currentYear)} alt="" />
                    {:else}
                        <span></span>
                    {/if}
                    <div class="name{matchups.bye && !matchup.roster_id ? ' bye': ''}{!matchups.bye && !matchup.roster_id ? ' tbd' : ''}">{getPlayoffName(matchup.roster_id, matchups.bye, leagueTeamManagers.currentYear) || 'TBD'}</div>
                    {#if matchup.roster_id}
                        <div class="points">
                            <div class="actualPoints">{calculatePoints(matchup.points)}</div>
                            <div class="projectedPoints">proj {calculatePotentialPoints(matchup.starters, ix, players)}</div>
                        </div>
                    {:else}
                        <span></span>
                    {/if}
                </div>
            {/each}
        </div>
        {#if drawBracket && inx % 2 == 0}
            <!-- Only draw the bracket once for each pair -->
            <svg class="lineParent">
                <line x1="{anchors[Math.floor(inx / 2)].xLeft}" y1="{anchors[Math.floor(inx / 2)].yTop}" x2="{anchors[Math.floor(inx / 2)].xMiddle}" y2="{anchors[Math.floor(inx / 2)].yTop}" class="line"/>
                <line x1="{anchors[Math.floor(inx / 2)].xMiddle}" y1="{anchors[Math.floor(inx / 2)].yTop}" x2="{anchors[Math.floor(inx / 2)].xMiddle}" y2="{anchors[Math.floor(inx / 2)].yBottom}" class="line"/>
                <line x1="{anchors[Math.floor(inx / 2)].xMiddle}" y1="{anchors[Math.floor(inx / 2)].yMiddle}" x2="{anchors[Math.floor(inx / 2)].xRight}" y2="{anchors[Math.floor(inx / 2)].yMiddle}" class="line"/>
                <line x1="{anchors[Math.floor(inx / 2)].xLeft}" y1="{anchors[Math.floor(inx / 2)].yBottom}" x2="{anchors[Math.floor(inx / 2)].xMiddle}" y2="{anchors[Math.floor(inx / 2)].yBottom}" class="line"/>
            </svg>
        {/if}
    {:else}
        <div class="match spacer" />
    {/each}
</div>
