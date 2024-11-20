<script>
    import MockDraft from './MockDraft.svelte'; // Import the MockDraft component

    // Data passed from the loader (+page.js)
    export let data = {}; // Fallback to an empty object if no data is passed

    // Destructure and provide defaults to avoid runtime errors
    const {
        upcomingDraftData = {}, 
        leagueTeamManagersData = [], 
        playersData = [] 
    } = data;

    // Debug to verify the data being passed
    console.log("Upcoming Draft Data:", upcomingDraftData);
    console.log("League Team Managers Data:", leagueTeamManagersData);
    console.log("Players Data:", playersData);
</script>

<style>
    #main {
        position: relative;
        z-index: 1;
    }
</style>

<div id="main">
    {#if upcomingDraftData.draftOrder && leagueTeamManagersData.length > 0 && playersData.length > 0}
        <!-- Pass the relevant data to the MockDraft component -->
        <MockDraft 
            draftData={upcomingDraftData} 
            leagueTeamManagers={leagueTeamManagersData} 
            players={playersData} 
        />
    {:else}
        <!-- Placeholder if no data is available -->
        <h1>Mock Draft Coming Soon</h1>
        <p>Loading draft data or no data available at this time.</p>
    {/if}
</div>

