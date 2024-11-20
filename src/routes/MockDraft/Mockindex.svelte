<script>
    import { waitForAll } from '$lib/utils/helper';
    import LinearProgress from '@smui/linear-progress';
    import MockDraft from './MockDraft.svelte'; // Use the MockDraft component

    export let upcomingDraftData, leagueTeamManagersData, playersData; // Props passed to this component
</script>

<style>
    .loading {
        display: block;
        width: 85%;
        max-width: 500px;
        margin: 80px auto;
    }

    h4 {
        text-align: center;
    }

    p {
        text-align: center;
    }
</style>

<!-- Await upcoming draft data -->
{#await waitForAll(upcomingDraftData, leagueTeamManagersData, playersData) }
    <div class="loading">
        <p>Retrieving upcoming mock draft...</p>
        <br />
        <LinearProgress indeterminate />
    </div>
{:then [upcomingDraft, leagueTeamManagers, {players}] }
    <!-- Display upcoming mock draft -->
    <h4>Upcoming {upcomingDraft.year} Mock Draft</h4>
    <MockDraft draftData={upcomingDraft} {leagueTeamManagers} year={upcomingDraft.year} {players} />
{:catch error}
    <!-- Handle errors -->
    <p>Something went wrong: {error.message}</p>
{/await}
