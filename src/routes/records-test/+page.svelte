<script>
    import { onMount } from 'svelte';
    import { getLeagueRecords, getLeagueTeamManagers } from '$lib/utils/helper';
    import { calculateManagerLineupIQ } from '$lib/utils/managerLineupIQ';

    let rankings = [];
    let managerMap = {};
    let loading = true;
    let error = '';

    onMount(async () => {
        try {
            const [records, teamManagers] = await Promise.all([
                getLeagueRecords(false),
                getLeagueTeamManagers()
            ]);

            const leagueManagerRecords =
                records?.regularSeasonData?.leagueManagerRecords || {};

            rankings = calculateManagerLineupIQ(leagueManagerRecords);

            /*
             * Build a simple manager lookup so we can display
             * manager names instead of Sleeper IDs.
             */
            managerMap = {};

            if (teamManagers?.users) {
                for (const managerID in teamManagers.users) {
                    const manager = teamManagers.users[managerID];

                    managerMap[managerID] =
                        manager?.display_name ||
                        manager?.username ||
                        managerID;
                }
            }

        } catch (err) {
            console.error(err);
            error = err?.message || 'Unable to load Manager Lineup IQ data.';
        } finally {
            loading = false;
        }
    });
</script>

<svelte:head>
    <title>Manager Lineup IQ Test</title>
</svelte:head>

<div class="page">

    <h1>Manager Lineup IQ — Sandbox</h1>

    <p class="description">
        Experimental Manager Lineup IQ calculation.
        This page does not modify the existing Records calculation.
    </p>

    {#if loading}

        <div class="message">
            Loading Manager Lineup IQ...
        </div>

    {:else if error}

        <div class="error">
            {error}
        </div>

    {:else if rankings.length}

        <div class="summary">
            <div>
                <strong>Managers:</strong>
                {rankings.length}
            </div>

            <div>
                <strong>Baseline Potential PPG:</strong>
                {rankings[0].medianPotentialPPG}
            </div>

            <div>
                <strong>Weighting:</strong>
                70% Efficiency / 30% Roster Strength
            </div>
        </div>

        <div class="table-wrapper">

            <table>

                <thead>
                    <tr>
                        <th>#</th>
                        <th>Manager</th>
                        <th>Manager IQ</th>
                        <th>Current IQ</th>
                        <th>Efficiency</th>
                        <th>Potential PPG</th>
                        <th>Roster Strength</th>
                        <th>Points</th>
                        <th>Potential</th>
                        <th>Games</th>
                    </tr>
                </thead>

                <tbody>

                    {#each rankings as manager}

                        <tr>

                            <td class="rank">
                                {manager.rank}
                            </td>

                            <td class="manager">
                                {managerMap[manager.managerID] || manager.managerID}
                            </td>

                            <td class="new-iq">
                                {manager.iq}%
                            </td>

                            <td>
                                {manager.efficiency}%
                            </td>

                            <td>
                                {manager.efficiency}%
                            </td>

                            <td>
                                {manager.potentialPPG}
                            </td>

                            <td>
                                {manager.rosterStrength}
                            </td>

                            <td>
                                {Math.round(manager.fpts).toLocaleString()}
                            </td>

                            <td>
                                {Math.round(manager.potentialPoints).toLocaleString()}
                            </td>

                            <td>
                                {manager.games}
                            </td>

                        </tr>

                    {/each}

                </tbody>

            </table>

        </div>

        <div class="formula">

            <h2>How the test score is calculated</h2>

            <p>
                <strong>Efficiency</strong> =
                Actual Points ÷ Potential Points
            </p>

            <p>
                <strong>Potential PPG</strong> =
                Total Potential Points ÷ Games
            </p>

            <p>
                <strong>Roster Strength</strong> =
                Manager Potential PPG ÷ League Median Potential PPG
            </p>

            <p>
                <strong>Manager Lineup IQ</strong> =
                Efficiency × (0.70 + 0.30 × Roster Strength)
            </p>

        </div>

    {:else}

        <div class="message">
            No Manager Lineup IQ data was found.
        </div>

    {/if}

</div>

<style>
    .page {
        width: min(1400px, 96%);
        margin: 30px auto 60px;
        font-family: inherit;
    }

    h1 {
        text-align: center;
        margin-bottom: 8px;
    }

    .description {
        text-align: center;
        color: #888;
        margin-bottom: 30px;
    }

    .summary {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 30px;
        margin-bottom: 25px;
        padding: 15px;
        border-radius: 8px;
        background: rgba(128, 128, 128, 0.08);
    }

    .table-wrapper {
        width: 100%;
        overflow-x: auto;
    }

    table {
        width: 100%;
        min-width: 1050px;
        border-collapse: collapse;
    }

    th,
    td {
        padding: 10px 12px;
        text-align: center;
        border-bottom: 1px solid rgba(128, 128, 128, 0.25);
        white-space: nowrap;
    }

    th {
        font-weight: 600;
    }

    tbody tr:hover {
        background: rgba(128, 128, 128, 0.08);
    }

    .rank {
        width: 40px;
        font-weight: 600;
    }

    .manager {
        text-align: left;
        font-weight: 600;
    }

    .new-iq {
        font-size: 1.1em;
        font-weight: 700;
    }

    .formula {
        max-width: 850px;
        margin: 35px auto;
        padding: 20px;
        border-radius: 8px;
        background: rgba(128, 128, 128, 0.08);
    }

    .formula h2 {
        margin-top: 0;
    }

    .message,
    .error {
        text-align: center;
        padding: 40px;
    }

    .error {
        color: #c00;
    }
</style>
