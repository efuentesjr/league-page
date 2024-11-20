<script>
    import MockDraft from './MockDraft.svelte'; // Import the MockDraft component

    export let data; // Data loaded from +page.js
    const { upcomingDraftData, leagueTeamManagersData, playersData } = data; // Extract necessary data
</script>

<style>
    #main {
        position: relative;
        z-index: 1;
    }
</style>

<div id="main">
    <!-- Pass the relevant data to the MockDraft component -->
    <MockDraft 
        draftData={upcomingDraftData} 
        leagueTeamManagers={leagueTeamManagersData} 
        players={playersData} 
    />
</div>
