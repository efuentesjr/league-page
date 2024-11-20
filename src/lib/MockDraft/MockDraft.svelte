<script>
    import { onMount } from 'svelte';
    import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';
    import MockDraftRow from './MockDraftRow.svelte'; // Component to display individual rows

    // Props passed to the component
    export let mockDraftData, leagueTeamManagers, year;

    // Destructure mock draft data
    let draftOrder = mockDraftData.draftOrder; // Original mock draft order
    let collegePlayers = []; // Store for 2025 college players
    let isLoading = true;

    // Fetch players on component mount
    onMount(async () => {
        try {
            const response = await fetch('https://example.com/api/college-players/2025'); // Replace with actual API URL
            if (!response.ok) throw new Error('Failed to fetch player data');
            collegePlayers = await response.json(); // Assume response is an array of player objects
        } catch (error) {
            console.error('Error fetching college players:', error);
        } finally {
            isLoading = false;

            // Fill draft spots with fetched players
            draftOrder = draftOrder.map((spot, index) => {
                if (!spot.player && collegePlayers[index]) {
                    return {
                        ...spot,
                        player: collegePlayers[index], // Add a player to the draft spot
                    };
                }
                return spot;
            });
        }
    });

    // Function to save the modified draft order
    async function saveDraftOrder() {
        try {
            const response = await fetch('https://example.com/api/mock-drafts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ draftOrder }),
            });
            if (!response.ok) throw new Error('Failed to save draft');
            console.log('Mock draft saved successfully!');
        } catch (error) {
            console.error('Error saving draft:', error);
        }
    }

    // Function to reset the draft order to its original state
    function resetDraftOrder() {
        draftOrder = [...mockDraftData.draftOrder]; // Reset to the initial draft order
    }
</script>

<style>
    .mockDraftBoard {
        margin: 2em auto;
        max-width: 1000px;
    }

    .actions {
        margin: 1em auto;
        text-align: center;
    }

    button {
        margin: 0 0.5em;
        padding: 0.5em 1em;
        border: none;
        background-color: #007bff;
        color: white;
        border-radius: 4px;
        cursor: pointer;
    }

    button:hover {
        background-color: #0056b3;
    }

    button:disabled {
        background-color: #ccc;
        cursor: not-allowed;
    }
</style>

<h1>Mock Draft</h1>
<p>Modify the upcoming draft order to simulate different scenarios with the 2025 college players.</p>

<div class="actions">
    <button on:click={saveDraftOrder}>Save Mock Draft</button>
    <button on:click={resetDraftOrder}>Reset Mock Draft</button>
</div>

{#if isLoading}
    <p>Loading 2025 college players...</p>
{:else}
    <DataTable class="mockDraftBoard">
        <Head>
            <Row>
                <Cell>Team</Cell>
                <Cell>Player</Cell>
            </Row>
        </Head>
        <Body>
            {#each draftOrder as draftRow}
                <MockDraftRow {draftRow} />
            {/each}
        </Body>
    </DataTable>
{/if}
