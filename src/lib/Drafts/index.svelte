<script>
	import { waitForAll } from '$lib/utils/helper';
    import LinearProgress from '@smui/linear-progress';
    import Draft from './Draft.svelte'; 

    export let upcomingDraftData, previousDraftsData, leagueTeamManagersData, playersData;
</script>

<style>
	.loading {
		display: block;
		width: 85%;
		max-width: 500px;
		margin: 80px auto;
	}

    .historyHeading {
        width: 96%;
        max-width: 1500px;
        margin: 40px auto 0;
        padding: 0 4px 10px;
        box-sizing: border-box;
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 12px;
        border-bottom: 1px solid var(--mf-line);
        font-family: 'Chakra Petch', 'Roboto', Arial, sans-serif;
    }

    .historyHeading h2 {
        margin: 0;
        font-size: 1.6rem;
        font-weight: 700;
        line-height: 1;
        letter-spacing: 0.02em;
        color: var(--mf-text);
        text-shadow: 0 0 18px var(--mf-line-strong);
    }

    .historyHeading span {
        font-size: 0.8rem;
        color: var(--mf-dim);
    }

    .drafts {
        padding-bottom: 40px;
    }
</style>


<div class="drafts">
{#await waitForAll(upcomingDraftData, leagueTeamManagersData, playersData) }
	<div class="loading">
		<p>Retrieving upcoming draft...</p>
		<br />
		<LinearProgress indeterminate />
	</div>
{:then [upcomingDraft, leagueTeamManagers, {players}] }
    <Draft draftData={upcomingDraft} {leagueTeamManagers} year={upcomingDraft.year} {players} />
{:catch error}
	<!-- promise was rejected -->
	<p>Something went wrong: {error.message}</p>
{/await}


{#await waitForAll(previousDraftsData, leagueTeamManagersData, playersData) }
	<div class="historyHeading"><h2>Draft History</h2></div>
	<div class="loading">
		<p>Retrieving previous drafts...</p>
		<br />
		<LinearProgress indeterminate />
	</div>
{:then [previousDrafts, leagueTeamManagers, {players}] }
	<!-- Don't display anything unless there are previous drafts -->
	{#if previousDrafts.length}
		<div class="historyHeading">
			<h2>Draft History</h2>
			<span>Tap a year to open it</span>
		</div>
		{#each previousDrafts as previousDraft, i}
			<Draft draftData={previousDraft} previous={true} startOpen={i === 0} {leagueTeamManagers} year={previousDraft.year} {players} />
		{/each}
	{/if}
{:catch error}
	<!-- promise was rejected -->
	<p>Something went wrong: {error.message}</p>
{/await}
</div>
