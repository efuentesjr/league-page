<script>
    import Button, { Group, Label } from '@smui/button';
	import Bar from './Bar.svelte';

    export let graphs, leagueTeamManagers, curGraph = 0;

    const colors = [
        "--barChartOne",
        "--barChartTwo",
        "--barChartThree",
        "--barChartFour",
        "--barChartFive",
        "--barChartSix",
	    "--barChartSeven",
	    "--barChartEight",
	    "--barChartNine",
	    "--barChartTen",
	    "--barChartEleven",
	    "--barChartTwelve",
	    "--barChartThirteen",
	    "--barChartFourteen",
	    "--barChartFifteen",
	    "--barChartSixteen",
    ];

    // note that due to changig to horizontal, yMin and yMax are now used as xMin and xMax
    $: xMin = graphs[curGraph].secondStats.length > 0 ? graphs[curGraph].xMin/3 : graphs[curGraph].xMin;
    $: xMax = graphs[curGraph].xMax;
    $: stats = graphs[curGraph].stats;
    $: secondStats = graphs[curGraph].secondStats;
    $: managerIDs = graphs[curGraph].managerIDs;
    $: rosterIDs = graphs[curGraph].rosterIDs;
    $: labels = graphs[curGraph].labels;
    $: header = graphs[curGraph].header;
    $: year = graphs[curGraph].year;
</script>

<style>
    .chartWrapper {
        background:
            linear-gradient(var(--mf-grid) 1px, transparent 1px) 0 0 / 100% 24px,
            linear-gradient(90deg, var(--mf-grid) 1px, transparent 1px) 0 0 / 24px 100%,
            var(--mf-panel);
        border: 1px solid var(--mf-line);
        border-top: 2px solid var(--mf-ion);
        padding: 1em 0 0.5em;
        margin: 0 auto;
        max-width: 950px;
    }

    .barChart {
        display: block;
        position: relative;
        width: 100%;
        height: 100%;
    }

    h6 {
        font-family: 'Chakra Petch', 'Roboto', Arial, sans-serif;
        font-weight: 700;
        font-size: 1rem;
        letter-spacing: 0.04em;
        width: 100%;
        text-align: center;
        margin: 0 0 0.8em;
        color: var(--mf-text);
    }

    .buttonHolderG {
        text-align: center;
        margin: 1em 0 2em;
    }

    /* Start button resizing */
    @media (max-width: 1000px) {
        .chartWrapper {
            max-width: 95%;
        }
    }
    @media (max-width: 850px) {
        .chartWrapper {
            max-width: 100%;
        }
    }

    @media (max-width: 525px) {
        :global(.buttonHolderG .selectionButtons) {
            font-size: 0.6em;
            height: 32px;
        }
    }

    @media (max-width: 505px) {
        :global(.buttonHolderG .selectionButtons) {
            height: 26px;
        }
    }

    @media (max-width: 405px) {
        :global(.buttonHolderG .selectionButtons) {
            font-size: 0.5em;
            padding: 0 6px;
        }
    }

    @media (max-width: 260px) {
        :global(.buttonHolderG .selectionButtons) {
            font-size: 0.4em;
            padding: 0 2px;
            height: 24px;
            min-width: 40px;
        }
    }

    /* End button resizing */
</style>

<h6>{header}</h6>
<div class="chartWrapper">
    <div class="barChart" >
        {#each managerIDs as managerID, ix}
            <Bar {leagueTeamManagers} {managerID} rosterID={rosterIDs[ix]} {xMin} {xMax} stat={stats[ix]} secondStat={secondStats[ix]} {year} label={labels.stat} color={colors[ix % colors.length]} />
        {/each}
    </div>
</div>

{#if graphs.length > 1}
    <div class="buttonHolderG">
        <Group variant="outlined">
            {#each graphs as graph, ix}
                {#if ix < 4}
                    <Button class="selectionButtons" onclick={() => curGraph = ix} variant="{curGraph == ix ? "raised" : "outlined"}">
                        <Label>{graph.short}</Label>
                    </Button>
                {/if}
            {/each}
        </Group>
        <br />
        <Group variant="outlined">
            {#each graphs as graph, ix}
                {#if ix > 3}
                    <Button class="selectionButtons" onclick={() => curGraph = ix} variant="{curGraph == ix ? "raised" : "outlined"}">
                        <Label>{graph.short}</Label>
                    </Button>
                {/if}
            {/each}
        </Group>
    </div>
{/if}
