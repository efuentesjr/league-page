<!-- src/lib/Managers/Manager.svelte -->
<script>
    import Button, { Group, Label } from '@smui/button';
    import LinearProgress from '@smui/linear-progress';
    import { loadPlayers, getLeagueTransactions } from '$lib/utils/helper';
    import Roster from '../Rosters/Roster.svelte';
    import TransactionsPage from '../Transactions/TransactionsPage.svelte';
    import { goto } from '$app/navigation';
    import ManagerFantasyInfo from './ManagerFantasyInfo.svelte';
    import ManagerAwards from './ManagerAwards.svelte';
    import { onMount } from 'svelte';
    import { getDatesActive, getRosterIDFromManagerID, getTeamNameFromTeamManagers } from '$lib/utils/helperFunctions/universalFunctions';

    export let manager, managers, rostersData, leagueTeamManagers, rosterPositions, transactionsData, awards, records;

    let transactions = transactionsData.transactions;

    $: viewManager = managers[manager];

    $: datesActive = getDatesActive(leagueTeamManagers, viewManager.managerID);

    const startersAndReserve = rostersData.startersAndReserve;
    let rosters = rostersData.rosters;

    $: ({ rosterID, year } = viewManager.managerID
        ? getRosterIDFromManagerID(leagueTeamManagers, viewManager.managerID)
        : { rosterID: viewManager.roster, year: null });

    $: teamTransactions = transactions.filter((t) => t.rosters.includes(parseInt(rosterID)));

    $: roster = rosters[rosterID];

    $: coOwners = year && rosterID
        ? leagueTeamManagers.teamManagersMap[year][rosterID].managers.length > 1
        : roster.co_owners;

    $: commissioner = viewManager.managerID
        ? leagueTeamManagers.users[viewManager.managerID].is_owner
        : false;

    $: managerEarnings = viewManager?.earnings ?? [];
    $: managerTotalEarnings = Number(viewManager?.totalEarnings ?? 0);

    /* Detect Champion */
    $: isChampion = managerEarnings.some(e => e.title === 'Champion');

    const formatMoney = (value) => `$${Number(value || 0).toLocaleString()}`;

    const maxPossibleEarnings = 5000;

    $: earningsPercent = Math.min(
        100,
        Math.round((managerTotalEarnings / maxPossibleEarnings) * 100)
    );

    let players, playersInfo;
    let loading = true;

    const refreshTransactions = async () => {
        const newTransactions = await getLeagueTransactions(false, true);
        transactions = newTransactions.transactions;
    };

    onMount(async () => {
        if (transactionsData.stale) refreshTransactions();

        const playerData = await loadPlayers(null);
        playersInfo = playerData;
        players = playerData.players;
        loading = false;

        if (playerData.stale) {
            const newPlayerData = await loadPlayers(null, true);
            playersInfo = newPlayerData;
            players = newPlayerData.players;
        }
    });

    const changeManager = (newManager, noscroll = false) => {
        if (!newManager) goto(`/managers`);
        manager = newManager;
        goto(`/manager?manager=${newManager}`, { noscroll });
    };
</script>

<style>

.managerContainer {
    width: 100%;
    margin: 2em 0 5em;
}

.managerConstrained {
    width: 97%;
    max-width: 800px;
    margin: 0 auto 3em;
}

.managerPhoto {
    display: block;
    border-radius: 100%;
    width: 70%;
    max-width: 200px;
    height: auto;
    margin: 5em auto 1em;
    box-shadow: 0 0 8px 4px #aaa;
}

h2 {
    text-align: center;
    font-size: 2.8em;
    margin: 1em 0 0em;
}

h3 {
    text-align: center;
    font-size: 1.5em;
    margin: 1.5em 0 0.5em;
    font-weight: 200;
}

.basicInfo {
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    height: 24px;
    margin: 2em 0;
}

.basicInfo span {
    color: #888;
    font-size: 0.9em;
}

.infoChild { font-style: italic; }

.infoContact {
    height: 20px;
    vertical-align: middle;
    padding-left: 1em;
}

.infoTeam { height: 48px; }

.bio, .philosophy {
    margin: 2em 1.5em;
    text-indent: 4em;
}

.loading {
    display: block;
    width: 85%;
    max-width: 500px;
    margin: 80px auto;
}

.teamSub {
    font-size: 0.4em;
    color: #666;
}

.managerNav {
    margin: 3em 0 2em;
    text-align: center;
}

.upper { margin-top: 0; }

.commissionerBadge {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 25px;
    width: 25px;
    font-weight: 600;
    border-radius: 15px;
    background-color: var(--blueTwo);
    border: 1px solid var(--blueOne);
}

.commissionerBadge span { color: #fff; }

/* Earnings card */

.managerEarnings {
    width: min(520px, 90%);
    margin: 0 auto 1.1em;
    padding: 10px 12px;
    border-radius: 10px;
    background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.018));
    border: 1px solid rgba(255,255,255,0.12);
    box-shadow:
        0 0 35px rgba(255,255,255,0.06),
        0 0px 28px rgba(255,255,255,0.35),
        0 12px 30px rgba(0,0,0,0.45);
}

.careerEarningsTop {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.careerEarningsLabel {
    font-size: 11px;
    letter-spacing: .08em;
    text-transform: uppercase;
    color: #9ca3af;
}

.moneyIcon {
    width: 18px;
    height: 18px;
}

.champGlow {
    animation: goldPulse 2.5s ease-in-out infinite;
}

@keyframes goldPulse {
    0% {
        filter: drop-shadow(0 0 2px rgba(255,215,0,0.3));
        transform: scale(1);
    }
    50% {
        filter: drop-shadow(0 0 10px rgba(255,215,0,0.9));
        transform: scale(1.08);
    }
    100% {
        filter: drop-shadow(0 0 2px rgba(255,215,0,0.3));
        transform: scale(1);
    }
}

.careerEarningsValue {
    font-size: 16px;
    font-weight: 700;
    color: #f5d56b;
    margin: 2px 0 6px;
}

.earningsBar {
    width: 100%;
    height: 10px;
    border-radius: 999px;
    background: rgba(255,255,255,0.08);
    overflow: hidden;
}

.earningsBarFill {
    position: relative;
    height: 100%;
    background: linear-gradient(90deg,#f5d56b,#ffd700);
    box-shadow: 0 0 10px rgba(245,213,107,.45);
    transition: width .4s ease;
}

.championBar::after {
    content:"";
    position:absolute;
    top:0;
    left:-40%;
    width:40%;
    height:100%;
    background:linear-gradient(
        120deg,
        transparent,
        rgba(255,255,255,0.6),
        transparent
    );
    animation: shimmer 3s infinite;
}

@keyframes shimmer {
    0% { left:-40%; }
    100% { left:120%; }
}

.managerEarningsTable {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
    margin-top: 8px;
}

.managerEarningsTable th {
    text-align: left;
    font-size: 11px;
    color: #94a3b8;
    padding-bottom: 6px;
    border-bottom: 1px solid rgba(255,255,255,0.1);
}

.managerEarningsTable td {
    padding: 7px 0 4px;
    border-bottom: 1px solid rgba(255,255,255,0.04);
    color: #e5e7eb;
}

.managerEarningsTable tbody tr:last-child td { border-bottom:none; }

.managerEarningsTable td:last-child { font-weight:600; }

.earningsChampion td:last-child { color:#f5d56b; }
.earningsSecond td:last-child { color:#c0c0c0; }
.earningsThird td:last-child { color:#cd7f32; }

</style>

<div class="managerContainer">
<div class="managerConstrained">

<img class="managerPhoto" src="{viewManager.photo}" alt="manager" />

<h2>
{viewManager.name}
<div class="teamSub">
{coOwners ? 'Co-' : ''}Manager of
<i>{getTeamNameFromTeamManagers(leagueTeamManagers, rosterID, year)}</i>
</div>
</h2>

<div class="basicInfo">
<span class="infoChild">{viewManager.location || 'Undisclosed Location'}</span>

{#if viewManager.fantasyStart}
<span>|</span>
<span class="infoChild">EST '{viewManager.fantasyStart.toString().substr(2)}</span>
{/if}

{#if viewManager.preferredContact}
<span>|</span>
<span class="infoChild">
{viewManager.preferredContact}
<img class="infoChild infoContact" src="/{viewManager.preferredContact}.png"/>
</span>
{/if}

{#if viewManager.favoriteTeam}
<span>|</span>
<img class="infoChild infoTeam"
src="https://sleepercdn.com/images/team_logos/nfl/{viewManager.favoriteTeam}.png"/>
{/if}

{#if commissioner}
<span>|</span>
<div class="commissionerBadge"><span>C</span></div>
{/if}
</div>

<!-- Earnings card -->

<div class="managerEarnings">

<div class="careerEarningsTop">
<div class="careerEarningsLabel">Career Earnings</div>
<img src="/Money.png" alt="Money" class="moneyIcon" class:champGlow={isChampion} />
</div>

<div class="careerEarningsValue">{formatMoney(managerTotalEarnings)}</div>

<div class="earningsBar">
<div
class="earningsBarFill"
class:championBar={isChampion}
style="width:{earningsPercent}%"
></div>
</div>

{#if managerEarnings.length}
<table class="managerEarningsTable">
<thead>
<tr>
<th>Year</th>
<th>Amount</th>
<th>Result</th>
</tr>
</thead>

<tbody>
{#each managerEarnings as item}
<tr
class:earningsChampion={item.title==='Champion'}
class:earningsSecond={item.title==='2nd Place'}
class:earningsThird={item.title==='3rd Place'}
>
<td>{item.year}</td>
<td>{formatMoney(item.amount)}</td>
<td>{item.title}</td>
</tr>
{/each}
</tbody>
</table>
{:else}
<div class="managerEarningsEmpty">No winnings recorded</div>
{/if}

</div>

</div>
