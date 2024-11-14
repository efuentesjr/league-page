<script>
	import { gotoManager } from '$lib/utils/helper';
	import { getTeamFromTeamManagers } from '$lib/utils/helperFunctions/universalFunctions';
	import TransactionMove from './TransactionMove.svelte';

	export let transaction, players, leagueTeamManagers;

	// Initialize tradeCount as an empty object
	let tradeCount = {};

	// Populate tradeCount with initial structure
	for (const manager of leagueTeamManagers) {
	  tradeCount[manager.id] = {};
	  for (const otherManager of leagueTeamManagers) {
	    if (manager.id !== otherManager.id) {
	      tradeCount[manager.id][otherManager.id] = 0;
	    }
	  }
	}

	// Assuming each transaction involves exactly two rosters/managers
	const [managerA, managerB] = transaction.rosters;

	// Increment trade count between managerA and managerB if both are valid
	if (managerA && managerB) {
	  tradeCount[managerA][managerB]++;
	  tradeCount[managerB][managerA]++;
	}

	// Function to get the manager name by ID
	const getManagerName = (managerId) => {
	  const manager = leagueTeamManagers.find(mgr => mgr.id === managerId);
	  return manager ? manager.name : 'Unknown';
	};
</script>

<style>
    .tradeTransaction {
        display: flex;
        position: relative;
        flex-direction: column;
        margin-bottom: 1em;
    }
    
    .name {
        position: relative;
        text-align: center;
    }

    .avatar {
        border-radius: 50%;
        height: 40px;
        width: 40px;
        border: 2px solid var(--blueOne);
        background-color: var(--fff);
    }

    .ownerName {
        display: inline-block;
        font-weight: normal;
        line-height: 1em;
        margin: 0.2em;
    }

    .currentOwner {
        font-style: italic;
        color: var(--aaa);
        font-size: 0.7em;
    }

    .clickable {
        cursor: pointer;
    }

    .date {
        color: var(--g999);
        font-style: italic;
        font-size: 0.7em;
        text-align: center;
        padding: 0.7em 0 1em;
        background-color: var(--fff);
        border-radius: 0 0 0 40px;
        border-left: 2px solid var(--blueOne);
        border-right: 1px solid var(--ddd);
        margin-bottom: 3em;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
        height: 1px;
        margin-top: 1em;
    }

    thead {
        background-color: var(--blueOne);
        color: var(--fff);
    }

    th, td {
        padding: 8px;
        border: 1px solid var(--ddd);
        text-align: center;
    }

    .holder {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        height: 100%;
    }

    @media (max-width: 420px) {
        .ownerName {
            font-size: 0.8em;
        }
    }
</style>

<div class="tradeTransaction">
    <table>
        <thead>
            <tr>
                {#each transaction.rosters as owner}
                    <th class="name clickable" style="width: {1 / transaction.rosters.length * 100}%;" on:click={() => gotoManager({year: transaction.season, leagueTeamManagers, rosterID: owner})}>
                        <div class="holder">
                            <img class="avatar" src="{getTeamFromTeamManagers(leagueTeamManagers, owner, transaction.season).avatar}" alt="{getTeamFromTeamManagers(leagueTeamManagers, owner, transaction.season).name} avatar"/>
                            <span class="ownerName">
                                {getTeamFromTeamManagers(leagueTeamManagers, owner, transaction.season).name}
                                {#if getTeamFromTeamManagers(leagueTeamManagers, owner, transaction.season).name != getTeamFromTeamManagers(leagueTeamManagers, owner).name}
                                    <br />
                                    <span class="currentOwner">({getTeamFromTeamManagers(leagueTeamManagers, owner).name})</span>
                                {/if}
                            </span>
                        </div>
                    </th>
                {/each}
            </tr>
        </thead>
        <tbody>
            {#each transaction.moves as move}
                <TransactionMove {players} {move} type={transaction.type} {leagueTeamManagers} season={transaction.season} />
            {/each}
        </tbody>
    </table>
    <span class="date">
        {transaction.date}
    </span>
</div>

<!-- Trade Count Table -->
<h3>Trade Counts Between Managers</h3>
<table>
    <thead>
        <tr>
            <th>Manager</th>
            {#each leagueTeamManagers as otherManager}
                <th>{otherManager.name}</th>
            {/each}
        </tr>
    </thead>
    <tbody>
        {#each leagueTeamManagers as manager}
            <tr>
                <td>{manager.name}</td>
                {#each leagueTeamManagers as otherManager}
                    <td>{manager.id !== otherManager.id ? tradeCount[manager.id][otherManager.id] || 0 : '-'}</td>
                {/each}
            </tr>
        {/each}
    </tbody>
</table>

