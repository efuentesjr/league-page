import { getUpcomingDraft, getLeagueTeamManagers, loadPlayers } from '$lib/utils/helper';

export async function load({ fetch }) {
    // Fetch data for the mock draft
    const upcomingDraftData = getUpcomingDraft();
    const leagueTeamManagersData = getLeagueTeamManagers();
    const playersData = loadPlayers(fetch);

    return {
        upcomingDraftData,
        leagueTeamManagersData,
        playersData,
    };
}
